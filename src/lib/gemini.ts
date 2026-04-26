import { auth } from './firebase';

interface ExtractClothingResponse {
  imageBase64: string;
  error?: string;
}

export async function extractClothing(userPhotoBase64: string, clothingImageBase64: string, category: 'top' | 'bottom' | 'fullbody'): Promise<string> {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Please sign in again before extracting clothing.');

  const response = await fetch('/api/extract-clothing', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ userPhotoBase64, clothingImageBase64, category }),
  });

  const payload = (await response.json()) as ExtractClothingResponse;
  if (!response.ok) throw new Error(payload.error || 'Extraction failed. Try again.');

  return payload.imageBase64;
}
