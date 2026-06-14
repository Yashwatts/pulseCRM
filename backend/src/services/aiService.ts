import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const generateSegmentQuery = async (prompt: string): Promise<any> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Returning mock rules.");
    return {
      rules: [{ field: "totalSpent", operator: "greaterThan", value: 100 }],
      interpretation: "Customers who spent more than 100",
      recommendations: { campaignType: "Upsell", channel: "Email", discount: "10% OFF", bestTime: "Wednesday 2 PM", confidenceScore: 85 }
    };
  }

  try {
    const systemInstruction = `You are a Segment Rule Generator for an AI Marketing CRM. 
    Given a user prompt about a customer audience, generate a valid JSON object matching this exact schema:
    {
      "rules": [ { "field": string, "operator": string, "value": string | number } ],
      "interpretation": string,
      "recommendations": {
        "campaignType": string,
        "channel": "Email" | "SMS" | "WhatsApp",
        "discount": string,
        "bestTime": string,
        "confidenceScore": number
      }
    }
    Allowed fields: "totalSpent", "lastPurchaseDays", "aiTags", "email".
    Allowed operators: "greaterThan", "lessThan", "equals", "contains".
    Example output: {"rules": [{"field": "totalSpent", "operator": "greaterThan", "value": 500}], "interpretation": "Customers who spent over 500", "recommendations": {"campaignType": "Upsell", "channel": "Email", "discount": "10%", "bestTime": "Tuesday 10AM", "confidenceScore": 90}}
    DO NOT wrap the output in markdown blocks or add any other text.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
            { role: 'user', parts: [{ text: prompt }] }
        ],
        config: {
            systemInstruction: systemInstruction,
            temperature: 0,
        }
    });

    const text = response.text?.trim() || '{}';
    // Clean up potential markdown formatting if the model still includes it
    const cleanText = text.replace(/^```json/, '').replace(/^```/, '').replace(/```$/, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw new Error('Failed to generate segment query');
  }
};

export const generateCampaignMessage = async (
  goal: string,
  offer: string,
  tone: string,
  channel: string,
  audienceContext: any
): Promise<any> => {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Returning a mock message.");
    return {
      subject: "Exclusive Offer Inside!",
      message: "Hey {firstName}, we miss you. Here is a special offer.",
      cta: "Shop Now",
      emojis: ["🎉", "🔥", "🎁"]
    };
  }

  try {
    const systemInstruction = `You are an expert SaaS Marketing Copywriter. 
    Given the campaign goal, offer, tone, channel, and audience context, write a high-converting message.
    Return ONLY a valid JSON object matching this schema:
    {
      "subject": "The subject line (if Email, else short summary)",
      "message": "The main body copy. Use {firstName} for personalization. DO NOT include the CTA or Subject in this field.",
      "cta": "The call to action text (e.g., 'Claim Your 20% Off')",
      "emojis": ["3 relevant emojis as an array of strings"]
    }
    DO NOT wrap the output in markdown blocks or add any other text.`;

    const promptText = `
    Goal: ${goal}
    Offer: ${offer}
    Tone: ${tone}
    Channel: ${channel}
    Audience Rules: ${JSON.stringify(audienceContext)}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptText,
      config: { systemInstruction }
    });

    const rawText = response.text?.trim() || '';
    // In case Gemini wraps in markdown despite instructions:
    const jsonStr = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("AI Generation failed:", error);
    throw new Error("Failed to generate campaign message via AI");
  }
};

export const chatWithAssistant = async (history: any[], context: any): Promise<string> => {
  if (!process.env.GEMINI_API_KEY) {
    return "This is a mock response from the AI Copilot. To enable real intelligence, please configure the GEMINI_API_KEY environment variable.";
  }

  try {
    const systemInstruction = `You are the AI Marketing Copilot for PulseCRM AI.
    Your goal is to help the user grow their business by recommending segments, suggesting campaigns, and explaining analytics.
    You have direct access to the live CRM data context:
    Total Customers: ${context.totalCustomers}
    Total Revenue: $${context.totalRevenue}
    Active Campaigns: ${context.activeCampaigns}
    
    Guidelines:
    - Keep answers concise, professional, and formatted in clean markdown.
    - If suggesting a segment, give specific criteria (e.g., "Customers who spent > $500").
    - If suggesting a campaign, provide a brief channel and offer idea.
    - Be proactive and encouraging.`;

    const formattedHistory = history.map((msg: any) => ({
      role: msg.role === 'ai' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: formattedHistory,
      config: { systemInstruction, temperature: 0.7 }
    });

    return response.text?.trim() || "I'm sorry, I couldn't process that request.";
  } catch (error) {
    console.error("AI Chat Generation Error:", error);
    throw new Error('Failed to generate assistant response');
  }
};
