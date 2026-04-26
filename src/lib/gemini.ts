import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateTryOn(baseImageBase64: string, clothingImageBase64: string): Promise<string> {
  // Strip the prefix if present (e.g. data:image/jpeg;base64,)
  const baseData = baseImageBase64.split(',')[1] || baseImageBase64;
  const clothData = clothingImageBase64.split(',')[1] || clothingImageBase64;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview', // The recommended model for image stuff
    contents: {
      parts: [
        {
          inlineData: {
             data: baseData,
             mimeType: 'image/jpeg'
          }
        },
        {
          inlineData: {
             data: clothData,
             mimeType: 'image/jpeg'
          }
        },
        {
          text: 'Superimpose the clothing from the second image realistically onto the person in the first image. Keep the person\'s face, body type, background identically unchanged. Only change the outfit to match the provided clothing, ensuring accurate lighting, texture, and fit.'
        }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "1K" // Might need size limiting for Firebase upload afterwards or use standard resolution
      }
    }
  });

  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error('Failed to generate image');
  }
  
  for (const part of candidates[0].content.parts) {
    if (part.inlineData) {
      return `data:image/jpeg;base64,${part.inlineData.data}`;
    }
  }

  throw new Error('No image returned by model');
}
