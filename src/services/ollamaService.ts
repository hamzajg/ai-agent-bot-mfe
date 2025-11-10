export const ollamaProvider = {
  async send(message: string): Promise<string> {
    const cfg = (typeof window !== 'undefined' && (window as any).__AGENT_CONFIG) || {};
    const baseUrl = (cfg.ollamaUrl as string) || 'http://localhost:11434';
    const model = (cfg.ollamaModel as string) || (import.meta.env.VITE_OLLAMA_MODEL as string) || 'llama2';
    const res = await fetch(`${baseUrl.replace(/\/$/, '')}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, prompt: message }),
    });

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    let result = '';
    while (true) {
      const { value, done } = await reader!.read();
      if (done) break;
      result += decoder.decode(value);
    }
    return result;
  },
};
