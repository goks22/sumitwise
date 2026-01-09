import { GoogleGenAI } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const getClient = (): GoogleGenAI => {
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return aiClient;
};

export const getTaxAdvice = async (question: string): Promise<string> => {
  try {
    const ai = getClient();
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: question,
      config: {
        systemInstruction: `You are a helpful, professional, and concise assistant for a Tax CPA firm called 'PaiWise Accounting & Tax LLC', registered with the Virginia Board of Accountancy. 
        
        Your goals:
        1. Answer general questions about tax preparation, deadlines (US Tax Day is typically April 15), and general deductions.
        2. Maintain a professional, trustworthy tone.
        3. Do NOT provide specific legal advice or calculate exact tax liabilities for the user.
        4. Always include a brief disclaimer that you are an AI and they should consult a professional CPA for their specific situation.
        5. Keep answers under 150 words unless the topic is complex.
        `,
      },
    });

    return response.text || "I apologize, but I couldn't generate a response at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Unable to connect to the Tax Assistant service.");
  }
};