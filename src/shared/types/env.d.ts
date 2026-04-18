/// <reference types="vite/client" />

declare interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_OLLAMA_API_URL?: string;
  readonly VITE_AI_PROVIDER?: 'openai' | 'gemini' | 'ollama';
  readonly VITE_AGENT_ROLE?: string;
  readonly VITE_AGENT_MISSION?: string;
  readonly VITE_AGENT_RESPONSIBILITIES?: string; // JSON array of strings
  readonly VITE_AGENT_ACTIONS_JSON?: string; // JSON array of AgentAction
}

declare interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// Global window augmentations
interface Window {
  __AGENT_CONFIG?: any;
  __CHATBOT_ASSETS_BASE__?: string;
  __PRODUCT_URL_TEMPLATE?: string;
  ChatBot: {
    init: (options?: { rootId?: string; assetsBaseUrl?: string }) => void;
  };
}