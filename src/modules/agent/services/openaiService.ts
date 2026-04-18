import { buildSystemPrompt } from "../agentProfile";

export const openAIProvider = {
  async send(message: string, localContext?: string): Promise<string> {
    const apiKey = ((typeof window !== 'undefined' && (window as any).__AGENT_CONFIG?.openaiApiKey) || import.meta.env.VITE_OPENAI_API_KEY) as string;

    let systemPrompt = buildSystemPrompt();
    if (localContext) {
      systemPrompt += '\n\n' + localContext;
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
      }),
    });

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response.';
  },
};