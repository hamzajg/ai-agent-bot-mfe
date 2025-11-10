/// <reference types="vite/client" />
/// <reference types="node" />
declare module "*.css";
declare module "*.svg";
declare module "*.png";
declare module "*.jpg";

interface ImportMetaEnv {
  readonly VITE_OPENAI_API_KEY?: string;
  readonly VITE_GEMINI_API_KEY?: string;
  readonly VITE_OLLAMA_API_URL?: string;
  readonly VITE_AI_PROVIDER?: 'openai' | 'gemini' | 'ollama';
  readonly VITE_AGENT_ROLE?: string;
  readonly VITE_AGENT_MISSION?: string;
  readonly VITE_AGENT_RESPONSIBILITIES?: string; // JSON array of strings
  readonly VITE_AGENT_ACTIONS_JSON?: string; // JSON array of AgentAction
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
