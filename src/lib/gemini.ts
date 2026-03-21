import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return new GoogleGenAI({ apiKey });
};

export const generateWorkoutPlan = async (goal: string, level: string, days: number) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a ${days}-day workout plan for a ${level} level user with the goal of ${goal}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          exercises: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.NUMBER },
                name: { type: Type.STRING },
                sets: { type: Type.NUMBER },
                reps: { type: Type.NUMBER },
                restSeconds: { type: Type.NUMBER }
              },
              required: ["day", "name", "sets", "reps", "restSeconds"]
            }
          }
        },
        required: ["title", "description", "exercises"]
      }
    }
  });

  const text = response.text || "{}";
  const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanedText);
};

export const generateNutritionPlan = async (goal: string, weightKg: number, heightCm: number) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: "gemini-3.1-pro-preview",
    contents: `Generate a daily nutrition plan for a user weighing ${weightKg}kg, height ${heightCm}cm, with the goal of ${goal}.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          dailyCalories: { type: Type.NUMBER },
          proteinGrams: { type: Type.NUMBER },
          carbsGrams: { type: Type.NUMBER },
          fatsGrams: { type: Type.NUMBER },
          meals: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                calories: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                fats: { type: Type.NUMBER }
              },
              required: ["name", "description", "calories", "protein", "carbs", "fats"]
            }
          }
        },
        required: ["dailyCalories", "proteinGrams", "carbsGrams", "fatsGrams", "meals"]
      }
    }
  });

  const text = response.text || "{}";
  const cleanedText = text.replace(/```json\n?|\n?```/g, '').trim();
  return JSON.parse(cleanedText);
};

export const askFitnessQuestion = async (question: string, userProfile?: any) => {
  const ai = getGeminiClient();
  
  let systemInstruction = "You are an expert personal trainer and nutritionist. Provide concise, actionable, and safe advice.";
  if (userProfile) {
    systemInstruction += `\n\nUser Profile Context:\nAge: ${userProfile.age}\nHeight: ${userProfile.height}cm\nWeight: ${userProfile.weight}kg\nGoal: ${userProfile.goal.replace('_', ' ')}\nExperience: ${userProfile.experience_level}\nEquipment: ${userProfile.equipment}\nInjuries/Limitations: ${userProfile.injuries || 'None'}`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3.1-flash-lite-preview",
    contents: question,
    config: {
      systemInstruction
    }
  });
  return response.text;
};
