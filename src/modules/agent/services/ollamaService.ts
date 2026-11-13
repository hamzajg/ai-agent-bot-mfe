import { buildSystemPromptWithContext } from "../agentProfile";
import { readStreamLines, StreamCallback } from "./stream";

export const ollamaProvider = {
  async send(message: string, localContext?: string, onStream?: StreamCallback): Promise<string> {
    const cfg = (typeof window !== 'undefined' && (window as any).__AGENT_CONFIG) || {};
    const baseUrl = (cfg.ollamaUrl as string) || 'http://localhost:11434';
    const model = (cfg.ollamaModel as string) || (import.meta.env.VITE_OLLAMA_MODEL as string) || 'llama2';

    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model,
        prompt: message,
        system: buildSystemPromptWithContext(localContext),
      }),
    });

    if (!res.ok) {
      throw new Error(`Ollama API error: ${res.status} ${res.statusText}`);
    }

    if (!res.body) return 'No response.';

    let fullContent = '';

    // Ollama streams one JSON object per line (NDJSON): {"response":"...","done":false}
    await readStreamLines(res.body, (line) => {
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
    });

    return fullContent;
  },
};
