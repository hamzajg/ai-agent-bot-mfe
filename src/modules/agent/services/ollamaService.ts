import { buildSystemPrompt } from "../agentProfile";

type StreamCallback = (chunk: string) => void;

export const ollamaProvider = {
  async send(message: string, localContext?: string, onStream?: StreamCallback): Promise<string> {
    const cfg = (typeof window !== 'undefined' && (window as any).__AGENT_CONFIG) || {};
    const baseUrl = (cfg.ollamaUrl as string) || 'http://localhost:11434';
    const model = (cfg.ollamaModel as string) || (import.meta.env.VITE_OLLAMA_MODEL as string) || 'llama2';

    let systemPrompt = buildSystemPrompt();
    if (localContext) {
      systemPrompt += '\n\n' + localContext;
    }

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: message, system: systemPrompt }),
    });

    const reader = res.body?.getReader();
    if (!reader) return 'No response.';

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    // Ollama streams one JSON object per line (NDJSON): {"response":"...","done":false}
    const handleLine = (line: string) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      try {
        const parsed = JSON.parse(trimmed);
        const chunk = parsed.response as string | undefined;
        if (chunk) {
          fullContent += chunk;
          onStream?.(chunk);
        }
      } catch {
        // Partial or malformed line - ignored (incomplete lines stay buffered).
      }
    };

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      // Keep the last, possibly incomplete, line in the buffer for the next read.
      buffer = lines.pop() ?? '';
      for (const line of lines) handleLine(line);
    }

    // Flush a trailing line that was not newline-terminated.
    if (buffer) handleLine(buffer);

    return fullContent;
  },
};
