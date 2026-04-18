import { geminiProvider } from "./services/geminiService";
import { ollamaProvider } from "./services/ollamaService";
import { openAIProvider } from "./services/openaiService";


const provider = ((typeof window !== 'undefined' && (window as any).__AGENT_CONFIG?.provider) || import.meta.env.VITE_AI_PROVIDER || 'openai') as string;

export const AIAgent = {
  async sendMessage(message: string): Promise<string> {
    switch (provider) {
      case 'gemini':
        return geminiProvider.send(message);
      case 'ollama':
        return ollamaProvider.send(message);
      default:
        return openAIProvider.send(message);
    }
  },
};