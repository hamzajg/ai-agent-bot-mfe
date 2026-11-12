import { buildSystemPrompt } from "../agentProfile";

type StreamCallback = (chunk: string) => void;

export const geminiProvider = {
  async send(message: string, localContext?: string, onStream?: StreamCallback): Promise<string> {
    const apiKey = ((typeof window !== 'undefined' && (window as any).__AGENT_CONFIG?.geminiApiKey) || import.meta.env.VITE_GEMINI_API_KEY) as string;

    if (!apiKey) {
      return 'Gemini API key is not configured.';
    }

    let systemPrompt = buildSystemPrompt();
    if (localContext) {
      systemPrompt += '\n\n' + localContext;
    }

    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: [{ parts: [{ text: message }] }],
    };

    if (onStream) {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
      }

      const reader = res.body?.getReader();
      if (!reader) return 'No response.';

      const decoder = new TextDecoder();
      let buffer = '';
      let fullContent = '';

      const handleLine = (line: string) => {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) return;
        const jsonStr = trimmed.slice(6).trim();
        if (jsonStr === '[DONE]') return;
        try {
          const parsed = JSON.parse(jsonStr);
          const chunk = parsed?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (chunk) {
            fullContent += chunk;
            onStream(chunk);
          }
        } catch {
          // Incomplete line remains in buffer
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) handleLine(line);
      }

      if (buffer) handleLine(buffer);
      return fullContent || 'No response.';
    }

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'No response.';
  },
};