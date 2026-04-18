import { buildSystemPrompt, getAgentProfile } from "../agentProfile";

const env = import.meta.env as any;

export const openAIProvider = {
  async send(message: string, localContext?: string): Promise<string> {
    const apiKey = env.VITE_OPENAI_API_KEY as string;

    if (!apiKey) {
      const profile = getAgentProfile();
      return `I'm ${profile.role}. ${profile.mission} How can I help you?`;
    }

    let systemPrompt = buildSystemPrompt();
    if (localContext) {
      systemPrompt += '\n\n' + localContext;
    }

    try {
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
    } catch (e) {
      console.log('[OpenAI Error]:', e);
      throw e;
    }
  },
};