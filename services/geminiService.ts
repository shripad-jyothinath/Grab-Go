import { GoogleGenAI, Type } from "@google/genai";
import { MenuItem } from "../types";

const API_KEY = process.env.API_KEY || '';

// Helper to convert file to base64
export const fileToGenerativePart = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      // Remove data url prefix (e.g., "data:image/jpeg;base64,")
      const base64Data = base64String.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

export const extractMenuFromImage = async (imageFile: File): Promise<Partial<MenuItem>[]> => {
  if (!API_KEY) {
    console.error("API Key is missing");
    throw new Error("Gemini API Key is missing");
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    const base64Data = await fileToGenerativePart(imageFile);

    const prompt = `
      Analyze this menu image and extract the food items. 
      Return a JSON array where each object has:
      - name (string)
      - description (string, keep it short)
      - price (number, just the value)
      - category (string, e.g., 'Main', 'Starter', 'Drink')
      
      Ignore non-food text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: imageFile.type,
              data: base64Data
            }
          },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              price: { type: Type.NUMBER },
              category: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    
    return JSON.parse(text) as Partial<MenuItem>[];
  } catch (error) {
    console.error("Error extracting menu:", error);
    throw error;
  }
};