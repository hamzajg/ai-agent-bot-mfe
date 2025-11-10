import React from 'react';
import ReactDOM from 'react-dom/client';
import ChatBotWidget from './components/ChatBotWidget';
import '../../index.css';

interface ChatBotOptions {
  rootId?: string;
  assetsBaseUrl?: string;
}

function setGlobals(options: ChatBotOptions) {
  // Load admin config from localStorage
  try {
    const raw = localStorage.getItem('ai_agent_config');
    if (raw) (window as any).__AGENT_CONFIG = JSON.parse(raw);
  } catch {}

  // Determine assets base URL
  try {
    const adminBase = (window as any).__AGENT_CONFIG?.assetsBaseUrl as string | undefined;
    const override = options.assetsBaseUrl || adminBase;
    let base: string | undefined = override;
    if (!base) {
      const scripts = Array.from(document.getElementsByTagName('script')) as HTMLScriptElement[];
      const self = scripts.find((s) => (s.src || '').includes('chatbot-widget.iife'));
      if (self && self.src) {
        const u = new URL(self.src);
        base = `${u.protocol}//${u.host}`;
      }
    }
    (window as any).__CHATBOT_ASSETS_BASE__ = base;
  } catch {}
}

function mountWidget(options: ChatBotOptions) {
  const rootId = options.rootId || 'chatbot-root';
  let container = document.getElementById(rootId);
  if (!container) {
    container = document.createElement('div');
    container.id = rootId;
    document.body.appendChild(container);
  }
  setGlobals(options);
  const root = ReactDOM.createRoot(container);
  root.render(<ChatBotWidget />);
}

export function init(options: ChatBotOptions = {}) {
  const mount = () => {
    mountWidget(options);
  };
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount);
  } else {
    mount();
  }
}