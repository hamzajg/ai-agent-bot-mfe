export const geminiProvider = {
  async send(message: string): Promise<string> {
    const apiKey = ((typeof window !== 'undefined' && (window as any).__AGENT_CONFIG?.geminiApiKey) || import.meta.env.VITE_GEMINI_API_KEY) as string;
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}` , {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
    });

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  },
};
