import { buildSystemPrompt } from "../agentProfile";

export const geminiProvider = {
  async send(message: string, localContext?: string): Promise<string> {
    const apiKey = ((typeof window !== 'undefined' && (window as any).__AGENT_CONFIG?.geminiApiKey) || import.meta.env.VITE_GEMINI_API_KEY) as string;

    let systemPrompt = buildSystemPrompt();
    if (localContext) {
      systemPrompt += '\n\n' + localContext;
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}` , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: message }] }],
      }),
    });

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  },
};