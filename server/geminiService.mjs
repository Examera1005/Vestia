import { createVerify } from 'node:crypto';
import { GoogleGenAI } from '@google/genai';

const FIREBASE_CERTS_URL =
  'https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com';
const MAX_IMAGE_CHARS = 1_500_000;
const ALLOWED_CATEGORIES = new Set(['top', 'bottom', 'fullbody']);

let certCache = {
  expiresAt: 0,
  certs: {},
};

function json(res, statusCode, body) {
  res.statusCode = statusCode;
  res.setHeader('content-type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function base64UrlDecode(value) {
  const padded = `${value}${'='.repeat((4 - (value.length % 4)) % 4)}`;
  return Buffer.from(padded.replaceAll('-', '+').replaceAll('_', '/'), 'base64');
}

function parseJwt(token) {
  const parts = token.split('.');
  if (parts.length !== 3) throw new Error('Malformed token');

  return {
    header: JSON.parse(base64UrlDecode(parts[0]).toString('utf8')),
    payload: JSON.parse(base64UrlDecode(parts[1]).toString('utf8')),
    signedContent: `${parts[0]}.${parts[1]}`,
    signature: base64UrlDecode(parts[2]),
  };
}

async function getFirebaseCerts() {
  if (Date.now() < certCache.expiresAt) return certCache.certs;

  const response = await fetch(FIREBASE_CERTS_URL);
  if (!response.ok) throw new Error('Unable to fetch Firebase public keys');

  const cacheControl = response.headers.get('cache-control') || '';
  const maxAge = Number(cacheControl.match(/max-age=(\d+)/)?.[1] || 300);
  certCache = {
    certs: await response.json(),
    expiresAt: Date.now() + maxAge * 1000,
  };
  return certCache.certs;
}

async function verifyFirebaseIdToken(token) {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID is not configured');

  const { header, payload, signedContent, signature } = parseJwt(token);
  if (header.alg !== 'RS256' || typeof header.kid !== 'string') {
    throw new Error('Unsupported token');
  }

  const certs = await getFirebaseCerts();
  const cert = certs[header.kid];
  if (!cert) throw new Error('Unknown Firebase signing key');

  const verifier = createVerify('RSA-SHA256');
  verifier.update(signedContent);
  verifier.end();
  if (!verifier.verify(cert, signature)) throw new Error('Invalid token signature');

  const now = Math.floor(Date.now() / 1000);
  if (payload.aud !== projectId) throw new Error('Invalid token audience');
  if (payload.iss !== `https://securetoken.google.com/${projectId}`) {
    throw new Error('Invalid token issuer');
  }
  if (typeof payload.sub !== 'string' || payload.sub.length === 0 || payload.sub.length > 128) {
    throw new Error('Invalid token subject');
  }
  if (typeof payload.exp !== 'number' || payload.exp <= now) throw new Error('Token expired');
  if (typeof payload.iat !== 'number' || payload.iat > now + 300) throw new Error('Invalid token time');

  return payload;
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
      if (body.length > MAX_IMAGE_CHARS * 2 + 4096) {
        reject(new Error('Request body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body || '{}'));
      } catch {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function normalizeImage(value, fieldName) {
  if (typeof value !== 'string') throw new Error(`${fieldName} must be a string`);
  if (value.length > MAX_IMAGE_CHARS) throw new Error(`${fieldName} is too large`);

  const stripped = value.replace(/^data:image\/(?:jpeg|jpg|png|webp);base64,/i, '');
  if (!/^[a-zA-Z0-9+/]+={0,2}$/.test(stripped)) {
    throw new Error(`${fieldName} must be a base64 image`);
  }
  return stripped;
}

export async function handleExtractClothingRequest(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('allow', 'POST');
    return json(res, 405, { error: 'Method not allowed' });
  }

  try {
    const authorization = req.headers.authorization || '';
    const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : '';
    if (!token) return json(res, 401, { error: 'Missing Firebase ID token' });
    await verifyFirebaseIdToken(token);

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

    const body = await readJsonBody(req);
    const category = body.category;
    if (!ALLOWED_CATEGORIES.has(category)) throw new Error('Invalid clothing category');

    const baseData = normalizeImage(body.userPhotoBase64, 'userPhotoBase64');
    const clothData = normalizeImage(body.clothingImageBase64, 'clothingImageBase64');

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_IMAGE_MODEL || 'gemini-3.1-flash-image-preview',
      contents: {
        parts: [
          { inlineData: { data: baseData, mimeType: 'image/jpeg' } },
          { inlineData: { data: clothData, mimeType: 'image/jpeg' } },
          {
            text: `Extract the ${category} clothing item from the second image. Then, reshape, warp, and resize it so that its angles, sleeve positions, shapes, and proportions perfectly align with the body and pose of the person in the first image, as if it was worn by them. The output MUST ONLY be the isolated, reshaped clothing item on a pure, solid white background. No person, no mannequins, no other objects. Pure white background.`,
          },
        ],
      },
      config: {
        imageConfig: {
          aspectRatio: '3:4',
          imageSize: '1K',
        },
      },
    });

    const imagePart = response.candidates?.[0]?.content?.parts?.find((part) => part.inlineData);
    if (!imagePart?.inlineData?.data) throw new Error('No image returned by model');

    return json(res, 200, { imageBase64: `data:image/jpeg;base64,${imagePart.inlineData.data}` });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Extraction failed';
    const status = message.includes('token') || message.includes('audience') || message.includes('issuer') ? 401 : 400;
    return json(res, status, { error: message });
  }
}
