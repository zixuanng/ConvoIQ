import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisReport, Conflict, ChatMessage } from "../types";

// Helper to get the API key safely
const getApiKey = (): string => {
  const key = process.env.API_KEY;
  if (!key) {
    console.error("API Key is missing!");
    return "";
  }
  return key;
};

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: getApiKey() });

const ANALYSIS_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    contactName: { type: Type.STRING },
    metrics: {
      type: Type.OBJECT,
      properties: {
        healthScore: { type: Type.NUMBER },
        velocity: { type: Type.NUMBER },
        initiationBalance: { type: Type.NUMBER },
        avgResponseTime: { type: Type.NUMBER },
      },
      required: ["healthScore", "velocity", "initiationBalance", "avgResponseTime"]
    },
    psychologicalProfile: {
      type: Type.OBJECT,
      properties: {
        attachmentStyle: { type: Type.STRING },
        attachmentDescription: { type: Type.STRING },
        loveLanguage: { type: Type.STRING },
        communicationStyle: { type: Type.STRING },
        hiddenNeeds: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      },
      required: ["attachmentStyle", "attachmentDescription", "loveLanguage", "communicationStyle", "hiddenNeeds"]
    },
    summary: { type: Type.STRING },
    messages: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          sender: { type: Type.STRING, enum: ["user", "contact"] },
          text: { type: Type.STRING },
          timestamp: { type: Type.STRING },
          emotion: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              color: { type: Type.STRING },
            }
          }
        }
      }
    },
    conflicts: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          messageId: { type: Type.STRING },
          severity: { type: Type.STRING, enum: ["low", "medium", "high"] },
          description: { type: Type.STRING },
          triggerMessage: { type: Type.STRING },
        }
      }
    },
    predictions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          probability: { type: Type.NUMBER },
          description: { type: Type.STRING },
          timeframe: { type: Type.STRING },
          trend: { type: Type.STRING, enum: ["up", "down", "stable"] },
        }
      }
    },
    momentumHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          date: { type: Type.STRING },
          score: { type: Type.NUMBER },
        }
      }
    }
  },
  required: ["contactName", "metrics", "psychologicalProfile", "summary", "messages", "conflicts", "predictions", "momentumHistory"]
};

export const analyzeChatLog = async (chatText: string): Promise<AnalysisReport> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze the following chat log between 'User' and a contact. 
      Generate a detailed relationship analysis report.
      
      CRITICAL: Infer the psychological profile of the relationship dynamic based on the text.
      - Attachment Style (Secure, Anxious, Avoidant, Disorganized)
      - Love Language (Words of Affirmation, Acts of Service, Receiving Gifts, Quality Time, Physical Touch)
      - Hidden Emotional Needs (what are they asking for without saying it?)
      
      Include health score (0-100), emotional analysis of messages, conflict detection, and future predictions.
      Infer timestamps relative to today if missing. Create a realistic momentum history for the last 7 days.
      
      Chat Log:
      ${chatText}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: ANALYSIS_SCHEMA,
        systemInstruction: "You are ConvoIQ, an expert psychologist and data scientist specializing in human interaction patterns.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisReport;
    }
    throw new Error("Empty response from Gemini");
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const generateRewindAlternatives = async (conflict: Conflict, contextMessages: string[]): Promise<Conflict['alternatives']> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `The user sent a message that caused a conflict: "${conflict.triggerMessage}".
      Context: ${JSON.stringify(contextMessages)}
      Reason for conflict: ${conflict.description}
      
      Provide 3 alternative responses the user COULD have sent to avoid this conflict or improve the outcome.
      Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              label: { type: Type.STRING },
              text: { type: Type.STRING },
              tone: { type: Type.STRING },
              predictedOutcome: { type: Type.STRING },
            }
          }
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return [];
  } catch (error) {
    console.error("Rewind generation failed:", error);
    return [];
  }
};

export const generateCoachingTips = async (report: AnalysisReport): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are a relationship coach.
      User: ${report.contactName}
      Psych Profile: ${JSON.stringify(report.psychologicalProfile)}
      Conflicts: ${report.conflicts.length}
      
      Generate a warm, encouraging message that includes:
      1. A one-sentence insight about their dynamic.
      2. Three specific, actionable conversation starters or exercises they can try TODAY to improve connection or resolve conflict.
      
      Keep it concise and friendly. Do not use Markdown headers (like ##), just use bolding or bullet points.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Tips generation failed", error);
    return "";
  }
};

export const sendChatMessage = async (history: ChatMessage[], newMessage: string, context?: string): Promise<string> => {
  try {
    const systemInstruction = `You are ConvoIQ's assistant. You help users understand their relationship data.
    Current Analysis Context: ${context || "No specific relationship loaded."}
    
    Answer questions about relationship advice, communication improvement, and interpreting the data. Keep answers concise.`;

    // We will just do a single generation for simplicity in this demo structure
    const historyContents = history.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
    }));

    const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: [
            { role: "user", parts: [{ text: `System Context: ${systemInstruction}` }] },
            ...historyContents,
            { role: "user", parts: [{ text: newMessage }] }
        ]
    });

    return response.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat failed:", error);
    return "Sorry, I'm having trouble connecting to ConvoIQ intelligence right now.";
  }
};