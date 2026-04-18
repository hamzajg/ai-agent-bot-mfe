import React, { useState, useEffect, useRef } from 'react';
import { Bot, Settings, Send, X, MessageCircle } from 'lucide-react';
import { AIAgent } from '../../agent/AIAgent';
import { logEvent, getSettings } from '@shared/utils/usage';
import { Product } from '@shared/types';
import { agentProfile, buildSystemPrompt } from '../../agent/agentProfile';
import { readGuestProfile, readChatHistory, writeChatHistory, appendChatMessage, clearChatHistory, ChatMessage } from '@shared/utils/storage';
import InitView from './InitView';

function getLocalDataContext(): string {
  const actions = agentProfile.actions || [];
  const localActions = actions.filter((a) => a.source === 'local');
  if (!localActions.length) return '';

  const lines: string[] = [];
  lines.push('# Local Data (from browser storage)');

  for (const action of localActions) {
    const key = action.localKey || action.name;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const value = JSON.parse(raw);
        lines.push(`## ${key}`);
        lines.push(JSON.stringify(value, null, 2));
        lines.push('');
      }
    } catch {}
  }

  return lines.join('\n');
}

const ChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = readChatHistory();
    return saved.length > 0 ? saved : [{ sender: 'bot', text: '👋 Hi! How can I help you today?' }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const saved = readChatHistory();
    if (saved.length > 0) {
      setMessages(saved);
    }
  }, []);

  useEffect(() => {
    const webAppConfig = localStorage.getItem('ai_agent_config');
    const guestProfile = readGuestProfile();
    if (webAppConfig || guestProfile) {
      setInitialized(true);
    }
  }, []);

  const handleInitComplete = () => {
    setInitialized(true);
  };

  const append = (m: ChatMessage) => {
    setMessages((prev) => {
      const updated = [...prev, m];
      writeChatHistory(updated);
      return updated;
    });
  };

  const getProductUrl = (p: Product) => {
    const tpl = (window as any).__PRODUCT_URL_TEMPLATE || '/products/{id}';
    return tpl.replace('{id}', p.id);
  };

  const isProductSearchIntent = (text: string) => {
    const t = text.toLowerCase();
    return /(find|search|lookup)\s+(product|item|sku|deal)/.test(t) || /(product|item)/.test(t);
  };

  const isGreetingIntent = (text: string) => {
    const t = text.trim().toLowerCase();
    return /^(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening))\b/.test(t);
  };

  const stripGreeting = (text: string) => {
    const t = text.trim();
    const match = t.match(/^\s*(hi|hello|hey|yo|sup|good\s*(morning|afternoon|evening))\b[\s,!.:-]*/i);
    if (match) {
      const rest = t.slice(match[0].length).trim();
      return { isGreeting: true as const, rest };
    }
    return { isGreeting: false as const, rest: t };
  };

  const handleSend = async () => {
    const content = input.trim();
    if (!content) return;
    try {
      const { logMessageContent } = getSettings();
      logEvent('message_sent', logMessageContent ? { content } : {});
    } catch {}
    append({ sender: 'user', text: content });
    setInput('');

try {
      setIsTyping(true);
      const localContext = getLocalDataContext();
      const reply = await AIAgent.sendMessage(content, localContext);

      // Try to extract and parse a JSON action object from the reply
      let handled = false;
      try {
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const obj = JSON.parse(jsonMatch[0]) as { action?: string; navigate?: string; params?: Record<string, any> };

          // Handle navigation
          if (obj && obj.navigate) {
            const routeName = String(obj.navigate);
            const route = agentProfile.routes?.find((r) => r.name.toLowerCase() === routeName.toLowerCase());
            if (route) {
              let path = route.path;
              const params = obj.params || {};
              for (const [key, value] of Object.entries(params)) {
                path = path.replace(`{${key}}`, String(value));
              }

              // Check if user explicitly asked for navigation
              const userLower = content.toLowerCase();
              const explicitNav = /^(navigate|go to|show me|take me|open|view product|see product|check out)\b/i.test(userLower);

              if (explicitNav) {
                append({ sender: 'bot', text: `🧭 Navigating to ${route.name}...` });
                try {
                  window.location.href = path;
                  handled = true;
                } catch (err) {
                  append({ sender: 'bot', text: `Navigation failed: ${String(err)}` });
                  handled = true;
                }
              } else {
                // Show clickable link instead of auto-navigate
                append({
                  sender: 'bot',
                  text: `Would you like to ${route.name.toLowerCase()}?`,
                  action: 'navigate',
                  link: path,
                  linkLabel: route.name,
                });
                handled = true;
              }
            }
          }

          // Handle action
          if (!handled && obj && obj.action) {
            const actionName = String(obj.action).toLowerCase();

            // find matching action from agent profile
            const action = agentProfile.actions.find((a) => a.name.toLowerCase() === actionName);
            if (action) {
              append({ sender: 'bot', text: `🔎 Executing action: ${action.name}...` });
              try {
                logEvent('action_called', { name: action.name, source: 'tool_call' });

                let data: any = null;

                // Handle local storage action
                if (action.source === 'local' || action.localKey) {
                  const localKey = action.localKey || action.name.toLowerCase().replace(/\s+/g, '_');
                  const raw = localStorage.getItem(localKey);
                  if (raw) {
                    try {
                      data = JSON.parse(raw);
                    } catch {
                      data = raw;
                    }
                  } else {
                    data = null;
                  }
                } else {
                  // Handle API action
                  const base = (agentProfile.baseUrl || '').replace(/\/$/, '');
                  const endpoint = action.endpoint || '';
                  const url = endpoint.startsWith('http') ? endpoint : `${base}${endpoint}`;

                  let fetchUrl = url;
                  const params = obj.params || {};
                  let fetchOptions: RequestInit = { method: (action.method || 'GET').toUpperCase() };
                  if ((fetchOptions.method || 'GET') === 'GET') {
                    const qs = new URLSearchParams();
                    for (const [k, v] of Object.entries(params || {})) qs.set(k, String(v));
                    fetchUrl = qs.toString() ? `${fetchUrl}${fetchUrl.includes('?') ? '&' : '?'}${qs.toString()}` : fetchUrl;
                  } else {
                    fetchOptions = { ...fetchOptions, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(params) };
                  }

                  const res = await fetch(fetchUrl, fetchOptions);
                  const ctype = res.headers.get('content-type') || '';
                  if (ctype.includes('application/json')) data = await res.json();
                  else data = await res.text();
                }

                // Present results in a friendly way
                if (Array.isArray(data)) {
                  append({ sender: 'bot', text: `Found ${data.length} results.` });
                  const preview = data.slice(0, 5).map((it: any, i: number) => `- ${it.title || it.name || it.id || 'item'}${it.price ? ` (${it.price})` : ''}`).join('\n');
                  append({ sender: 'bot', text: preview });
                } else if (typeof data === 'object' && data !== null) {
                  append({ sender: 'bot', text: JSON.stringify(data, null, 2) });
                } else {
                  append({ sender: 'bot', text: String(data) });
                }

                handled = true;
              } catch (err) {
                append({ sender: 'bot', text: `Action failed: ${String(err)}` });
                try { logEvent('error', { message: String(err) }); } catch {}
                handled = true;
              }
            }
          }
        }
      } catch (e) {
        // parsing/execution failed, fall back to normal reply
      }

      if (!handled) {
        // If the user started with a greeting and had a request, prefer a single tailored message.
        if (isGreetingIntent(content)) {
          const combined = `Hi! ${reply}`;
          append({ sender: 'bot', text: combined });
        } else {
          append({ sender: 'bot', text: reply });
        }
      }
    } catch (err: any) {
      append({ sender: 'bot', text: 'Sorry, something went wrong. Please try again.' });
      try { logEvent('error', { message: String(err && err.message ? err.message : err) }); } catch {}
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <>
      {/* Floating Button - Enhanced with pulse animation */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl z-50"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2147483647,
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
        }}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageCircle className="w-6 h-6" />}
      </button>

      {/* Chat Window - Slide in animation */}
      {isOpen && (
        <div
          className="fixed bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 animate-slide-up"
          style={{
            bottom: 80,
            right: 24,
            zIndex: 2147483647,
            width: 380,
            height: 520,
            maxHeight: 'calc(100vh - 100px)',
            animation: 'slideUp 0.3s ease-out',
          }}
        >
          {!initialized || showSettings ? (
            <InitView
              onComplete={() => {
                setInitialized(true);
                setShowSettings(false);
              }}
              defaultProfile={readGuestProfile()}
            />
          ) : (
            <>
              {/* Header - Gradient with avatar */}
              <div
                className="flex items-center justify-between px-4 py-3 text-white"
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{agentProfile.role || 'AI Assistant'}</h4>
                    <p className="text-xs text-white/70">Online</p>
                  </div>
                </div>
                <div className="flex items-center space-x-1">
                  <button
                    onClick={() => setShowSettings(true)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Settings"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Close"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Messages - Improved bubbles */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f8fafc' }}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-line ${
                        m.sender === 'user'
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md'
                          : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                      }`}
                    >
                      {m.text && <span>{m.text}</span>}
                      {m.link && (
                        <a
                          href={m.link}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = m.link!;
                          }}
                          className={`block mt-2 underline cursor-pointer ${
                            m.sender === 'user' ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
                          }`}
                        >
                          → {m.linkLabel || 'Click here'}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white rounded-2xl rounded-bl-md shadow-sm p-3">
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Area - Improved styling */}
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors"
                  >
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;