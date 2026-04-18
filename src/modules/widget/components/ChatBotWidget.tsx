import React, { useState, useEffect, useRef } from 'react';
import { Bot, Settings, Send, X, MessageCircle } from 'lucide-react';
import { AIAgent } from '../../agent/AIAgent';
import { logEvent, getSettings } from '@shared/utils/usage';
import { Product } from '@shared/types';
import { agentProfile, getAgentProfile, buildSystemPrompt } from '../../agent/agentProfile';
import { readGuestProfile, readChatHistory, writeChatHistory, appendChatMessage, clearChatHistory, ChatMessage } from '@shared/utils/storage';
import InitView from './InitView';

function hasTable(text: string): boolean {
  const lines = text.split('\n');
  return lines.some((l) => l.trim().startsWith('|') && l.trim().endsWith('|'));
}

function renderRichText(text: string, isBot: boolean): React.ReactNode {
  if (!text) return null;

  const hasTables = hasTable(text);
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];

  const flushTable = () => {
    if (tableBuffer.length === 0) return;
    const rows = tableBuffer.filter((r) => {
      const t = r.trim();
      return t.startsWith('|') && t.endsWith('|') && !t.match(/\|[\s\-:]+\|/);
    });
    if (rows.length > 0) {
      elements.push(
        <div key={`table-${elements.length}`} className="overflow-x-auto mb-2 -mx-2 w-[calc(100%+16px)]">
          <table className="text-xs border-collapse">
            <tbody>
              {rows.map((row, ri) => {
                const cells = row.slice(1, -1).split('|').map((c) => c.trim());
                return (
                  <tr key={ri} className={ri === 0 ? 'font-semibold bg-gray-100' : ''}>
                    {cells.map((cell, ci) => (
                      <td key={ci} className="px-2 py-1 border-b border-r border-gray-200 whitespace-nowrap">
                        {cell}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }
    tableBuffer = [];
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      tableBuffer.push(trimmed);
      return;
    } else if (tableBuffer.length > 0) {
      flushTable();
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      elements.push(
        <div key={i} className="flex items-start mb-1">
          <span className="mr-2 text-gray-400">•</span>
          <span>{trimmed.slice(2)}</span>
        </div>
      );
    } else if (/^(\d+)\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start mb-1 ml-2">
            <span className="mr-2 font-medium opacity-70">{match[1]}.</span>
            <span>{match[2]}</span>
          </div>
        );
      }
    } else if (/^#{1,3}\s/.test(trimmed)) {
      const level = trimmed.match(/^(#{1,3})\s/)?.[1].length || 1;
      const sizes = ['text-lg font-semibold', 'text-base font-medium', 'text-sm'];
      elements.push(
        <div key={i} className={`${sizes[level - 1]} mt-2 mb-1`}>
          {trimmed.replace(/^#{1,3}\s/, '')}
        </div>
      );
    } else if (/^`[^`]+`$/.test(trimmed)) {
      elements.push(
        <code key={i} className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono">
          {trimmed.slice(1, -1)}
        </code>
      );
    } else if (trimmed.includes(':')) {
      const colonIdx = trimmed.indexOf(':');
      const key = trimmed.slice(0, colonIdx).trim();
      const val = trimmed.slice(colonIdx + 1).trim();
      if (key.length > 0 && key.length < 30) {
        elements.push(
          <div key={i} className="flex flex-wrap items-baseline mb-1">
            <span className="font-medium mr-1">{key}:</span>
            <span>{val}</span>
          </div>
        );
      } else {
        elements.push(<div key={i}>{line}</div>);
      }
    } else if (trimmed.startsWith('http')) {
      elements.push(
        <a key={i} href={trimmed} className="text-blue-500 underline break-all">{trimmed}</a>
      );
    } else {
      elements.push(<div key={i}>{line}</div>);
    }
  });

  flushTable();
  return elements;
}

function getLocalDataContext(): string {
  const profile = getAgentProfile();
  const actions = profile.actions || [];
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
        lines.push(JSON.stringify(value));
        lines.push('');
      }
    } catch {}
  }

  return lines.join('\n').trim();
}

const ChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [initialized, setInitialized] = useState(() => {
    const saved = readChatHistory();
    if (saved.length > 0) return true;
    const webAppConfig = localStorage.getItem('ai_agent_config');
    const guestRaw = localStorage.getItem('ai_agent_guest_profile');
    let guestProfile = null;
    if (guestRaw) {
      try {
        guestProfile = JSON.parse(guestRaw);
      } catch {}
    }
    return !!(webAppConfig || (guestProfile && guestProfile.role));
  });
  const [showSettings, setShowSettings] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const saved = readChatHistory();
    return saved.length > 0 ? saved : [{ sender: 'bot', text: '👋 Hi! How can I help you today?' }];
  });
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [streamText, setStreamText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 50);
    }
  }, [isOpen, initialized]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const currentProfile = getAgentProfile();

  useEffect(() => {
    const saved = readChatHistory();
    if (saved.length > 0) {
      setMessages(saved);
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

  const updateMessage = (id: number, updates: Partial<ChatMessage>) => {
    setMessages((prev) => {
      const updated = prev.map((m) => (m.id === id ? { ...m, ...updates } : m));
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
      const userLower = content.toLowerCase();
      const isNavRequest = /^(navigate|go to|show me|take me|open|view|see|check out|go|visit)\s+/i.test(userLower);
      
      const localContext = getLocalDataContext();
      const messageId = Date.now();
      const useStream = !isNavRequest;
      const usedStreaming = useStream;
      
      if (useStream) {
        append({ sender: 'bot', text: '', id: messageId });
      }

      const streamContent = (chunk: string) => {
        setStreamText((prev) => {
          const newText = prev + chunk;
          setMessages((msgs) => {
            const updated = msgs.map((m) => 
              m.id === messageId ? { ...m, text: newText } : m
            );
            return updated;
          });
          setTimeout(scrollToBottom, 10);
          return newText;
        });
      };

      const reply = await AIAgent.sendMessage(content, localContext, streamContent);

      // For navigation requests, handle directly without waiting for conversational fallback
      if (isNavRequest) {
        const navMatch = reply.match(/\{[\s\S]*"navigate"\s*:\s*"([^"]+)"[\s\S]*\}/);
        if (navMatch) {
          const routeName = navMatch[1].trim();
          let route = currentProfile.routes?.find((r) => r.name.toLowerCase() === routeName.toLowerCase());
          if (!route) {
            route = currentProfile.routes?.find((r) => r.path.toLowerCase() === `/${routeName.toLowerCase()}`);
          }
          if (route) {
            if (usedStreaming) updateMessage(messageId, { text: `🧭 Navigating to ${route.name}...` });
            else append({ sender: 'bot', text: `🧭 Navigating to ${route.name}...` });
            try { window.location.href = route.path; } catch {}
            setIsTyping(false);
            setStreamText('');
            return;
          } else {
            const directPath = routeName.startsWith('/') ? routeName : `/${routeName}`;
            if (usedStreaming) updateMessage(messageId, { text: `🧭 Navigating to ${routeName}...` });
            else append({ sender: 'bot', text: `🧭 Navigating to ${routeName}...` });
            try { window.location.href = directPath; } catch {}
            setIsTyping(false);
            setStreamText('');
            return;
          }
        }
      }

      // Try to extract and parse a JSON action object from the reply
      let handled = false;
      try {
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const obj = JSON.parse(jsonMatch[0]) as { action?: string; navigate?: string; params?: Record<string, any> };

          // Handle navigation only if user explicitly requested it
          if (obj && obj.navigate) {
            const userLower = content.toLowerCase();
            const explicitNav = /^(navigate|go to|show me|take me|open|view|see|check out|go|visit)\b/i.test(userLower);
            
            if (explicitNav) {
              const routeName = String(obj.navigate);
              const route = currentProfile.routes?.find((r) => r.name.toLowerCase() === routeName.toLowerCase());
              if (route) {
                let path = route.path;
                const params = obj.params || {};
                for (const [key, value] of Object.entries(params)) {
                  path = path.replace(`{${key}}`, String(value));
                }
                append({ sender: 'bot', text: `🧭 Navigating to ${route.name}...` });
                try {
                  window.location.href = path;
                  handled = true;
                } catch (err) {
                  append({ sender: 'bot', text: `Navigation failed: ${String(err)}` });
                  handled = true;
                }
              }
              // If route not found, don't mark as handled - fall back to conversational
            }
            // If not explicit navigation request, ignore JSON and respond conversationally
          }

          // Handle action only if user explicitly asked for it
          if (!handled && obj && obj.action) {
            const userLower = content.toLowerCase();
            const explicitAction = /\b(search|find|lookup|add to cart|remove from cart|view cart|checkout|create order|confirm order)\b/i.test(userLower);
            
            if (explicitAction) {
              const actionName = String(obj.action).toLowerCase();
              const action = currentProfile.actions.find((a) => a.name.toLowerCase() === actionName);
            if (action) {
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
                  const base = (currentProfile.baseUrl || '').replace(/\/$/, '');
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

                // Present results in a friendly way - interpret instead of just showing raw data
                if (Array.isArray(data)) {
                  if (data.length === 0) {
                    append({ sender: 'bot', text: `No results found.` });
                  } else {
                    const preview = data.slice(0, 5).map((it: any, i: number) => {
                      const name = it.title || it.name || it.id || 'item';
                      const price = it.price ? ` - ${it.price}` : '';
                      return `${i + 1}. ${name}${price}`;
                    }).join('\n');
                    const suffix = data.length > 5 ? `\n...and ${data.length - 5} more` : '';
                    append({ sender: 'bot', text: `${preview}${suffix}` });
                  }
                } else if (typeof data === 'object' && data !== null) {
                  const entries = Object.entries(data).filter(([k]) => !k.startsWith('_') && k !== 'id');
                  if (entries.length <= 3) {
                    const kv = entries.map(([k, v]) => `${k}: ${typeof v === 'object' ? JSON.stringify(v) : v}`).join('\n');
                    append({ sender: 'bot', text: kv });
                  } else {
                    append({ sender: 'bot', text: JSON.stringify(data, null, 2) });
                  }
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
        }
      } catch (e) {
        // parsing/execution failed, fall back to normal reply
      }

      if (!handled) {
        // Strip any JSON from reply to avoid showing raw JSON to user
        const cleanedReply = reply.replace(/^\s*\{[\s\S]*\}\s*$/, '').replace(/\{[\s\S]*\}/, '').trim();
        const displayText = cleanedReply || reply;

        if (usedStreaming) {
          const finalText = isGreetingIntent(content) ? `Hi! ${displayText}` : displayText;
          updateMessage(messageId, { text: finalText });
        } else {
          if (isGreetingIntent(content)) {
            const combined = `Hi! ${displayText}`;
            append({ sender: 'bot', text: combined });
          } else {
            append({ sender: 'bot', text: displayText });
          }
        }
      }
    } catch (err: any) {
      if (usedStreaming) {
        updateMessage(messageId, { text: 'Sorry, something went wrong. Please try again.' });
      } else {
        append({ sender: 'bot', text: 'Sorry, something went wrong. Please try again.' });
      }
      try { logEvent('error', { message: String(err && err.message ? err.message : err) }); } catch {}
    } finally {
      setIsTyping(false);
      setStreamText('');
      setTimeout(scrollToBottom, 100);
    }
  };

  return (
    <>
      {/* Floating Button - Enhanced with pulse animation */}
      <button
        onClick={() => {
          setIsOpen(!isOpen);
        }}
        className="fixed p-4 rounded-full shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl z-50"
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 2147483647,
          background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          boxShadow: '0 4px 20px rgba(37, 99, 235, 0.4)',
          color: 'white',
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
            width: 420,
            height: 560,
            maxHeight: 'calc(100vh - 100px)',
            maxWidth: '90vw',
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
                    <h4 className="font-semibold text-sm">{currentProfile.role || 'AI Assistant'}</h4>
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
              <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f9fafb' }}>
                {messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className="max-w-[85%] p-3 rounded-2xl text-sm whitespace-pre-wrap break-words"
                      style={{
                        background: m.sender === 'user'
                          ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                          : '#ffffff',
                        color: m.sender === 'user' ? 'white' : '#1f2937',
                        borderBottomRightRadius: m.sender === 'user' ? '4px' : '12px',
                        borderBottomLeftRadius: m.sender === 'user' ? '12px' : '4px',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        maxWidth: '300px',
                      }}
                    >
                      {m.text && renderRichText(m.text, m.sender === 'bot')}
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
                    <div
                      className="rounded-2xl rounded-bl-md shadow-sm p-3"
                      style={{ background: '#ffffff', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
                    >
                      <div className="flex space-x-1">
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#9ca3af', animationDelay: '0ms' }} />
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#9ca3af', animationDelay: '150ms' }} />
                        <span className="w-2 h-2 rounded-full animate-bounce" style={{ background: '#9ca3af', animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Improved styling */}
              <div className="border-t border-gray-100 p-3 bg-white">
                <div className="flex items-end space-x-2">
                  <textarea
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all resize-none"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    rows={1}
                    style={{ minHeight: '44px', maxHeight: '100px', overflowWrap: 'break-word' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSend();
                      }
                    }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-xl transition-colors flex-shrink-0"
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