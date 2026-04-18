import { buildSystemPrompt, getAgentProfile } from "../agentProfile";

const env = import.meta.env as any;

type StreamCallback = (chunk: string) => void;

export const openAIProvider = {
  async send(message: string, localContext?: string, onStream?: StreamCallback): Promise<string> {
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
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          stream: !!onStream,
        }),
      });

      if (onStream && res.body) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let fullContent = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n').filter((line) => line.trim().startsWith('data: '));

          for (const line of lines) {
            const data = line.replace(/^data: /, '');
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullContent += content;
                onStream(content);
              }
            } catch {}
          }
        }

        return fullContent;
      } else {
        const data = await res.json();
        return data.choices?.[0]?.message?.content || 'No response.';
      }
    } catch (e) {
      console.log('[OpenAI Error]:', e);
      throw e;
    }
  },
};