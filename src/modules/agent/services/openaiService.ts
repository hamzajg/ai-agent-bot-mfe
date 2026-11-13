import { buildSystemPromptWithContext, getAgentProfile } from "../agentProfile";
import { readStreamLines, sseData, StreamCallback } from "./stream";

const env = import.meta.env as any;

export const openAIProvider = {
  async send(message: string, localContext?: string, onStream?: StreamCallback): Promise<string> {
    const apiKey = env.VITE_OPENAI_API_KEY as string;

    if (!apiKey) {
      const profile = getAgentProfile();
      return `I'm ${profile.role}. ${profile.mission} How can I help you?`;
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: buildSystemPromptWithContext(localContext) },
            { role: 'user', content: message },
          ],
          stream: !!onStream,
        }),
      });

      if (!res.ok) {
        throw new Error(`OpenAI API error: ${res.status} ${res.statusText}`);
      }

      if (onStream && res.body) {
        let fullContent = '';

        await readStreamLines(res.body, (line) => {
          const data = sseData(line);
          if (!data || data === '[DONE]') return;

          try {
            const parsed = JSON.parse(data);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              fullContent += content;
              onStream(content);
            }
          } catch {}
        });

        return fullContent;
      }

      const data = await res.json();
      return data.choices?.[0]?.message?.content || 'No response.';
    } catch (e) {
      console.log('[OpenAI Error]:', e);
      throw e;
    }
  },
};
