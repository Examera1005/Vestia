import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function extractClothing(userPhotoBase64: string, clothingImageBase64: string, category: 'top' | 'bottom' | 'fullbody'): Promise<string> {
  const baseData = userPhotoBase64.split(',')[1] || userPhotoBase64;
  const clothData = clothingImageBase64.split(',')[1] || clothingImageBase64;
  
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-flash-image-preview', 
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
          text: `Extract the ${category} clothing item from the second image. Then, reshape, warp, and resize it so that its angles, sleeve positions, shapes, and proportions perfectly align with the body and pose of the person in the first image, as if it was worn by them. The output MUST ONLY be the isolated, reshaped clothing item on a pure, solid white background. No person, no mannequins, no other objects. Pure white background.`
        }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "1K"
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
