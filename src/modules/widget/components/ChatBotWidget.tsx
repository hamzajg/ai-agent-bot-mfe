import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { AIAgent } from '../../agent/AIAgent';
import { logEvent, getSettings } from '@shared/utils/usage';
import { Product } from '@shared/types';
import { agentProfile } from '../../agent/agentProfile';

const ChatBotWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<
    { sender: 'user' | 'bot'; text?: string; products?: Product[] }[]
  >([{ sender: 'bot', text: '👋 Hi! How can I help you today?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const append = (m: { sender: 'user' | 'bot'; text?: string; products?: Product[] }) =>
    setMessages((prev) => [...prev, m]);

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
      const reply = await AIAgent.sendMessage(content);

      // Try to extract and parse a JSON action object from the reply
      let handled = false;
      try {
        const jsonMatch = reply.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const obj = JSON.parse(jsonMatch[0]) as { action?: string; params?: Record<string, any> };
          if (obj && obj.action) {
            const actionName = String(obj.action).toLowerCase();

            // find matching action from agent profile
            const action = agentProfile.actions.find((a) => a.name.toLowerCase() === actionName);
            if (action) {
              append({ sender: 'bot', text: `🔎 Executing action: ${action.name}...` });
              try {
                logEvent('action_called', { name: action.name, source: 'tool_call' });

                // Build URL
                const cfg = (window as any).__AGENT_CONFIG || {};
                const base = (cfg.assetsBaseUrl || '').replace(/\/$/, '');
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
                let data: any = null;
                const ctype = res.headers.get('content-type') || '';
                if (ctype.includes('application/json')) data = await res.json();
                else data = await res.text();

                // Present results in a friendly way
                if (Array.isArray(data)) {
                  append({ sender: 'bot', text: `Found ${data.length} results.` });
                  // show first few items if they have title/description
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
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg z-50 transition-transform hover:scale-105"
        style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 2147483647 }}
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-20 right-6 w-96 h-[480px] bg-white border border-gray-300 rounded-2xl shadow-2xl flex flex-col z-50"
          style={{ position: 'fixed', bottom: 80, right: 24, zIndex: 2147483647, width: 384, height: 480 }}
        >
          {/* Header */}
          <div className="flex justify-between items-center bg-blue-600 text-white px-4 py-2 rounded-t-2xl">
            <h4 className="font-semibold">{agentProfile.role}</h4>
            <button onClick={() => setIsOpen(false)} className="text-white text-lg">✕</button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50">
            {messages.map((m, idx) => (
              <div key={idx} className={`text-sm ${m.sender === 'user' ? 'text-white bg-blue-500 ml-auto' : 'text-gray-800 bg-white'} p-2 rounded-lg shadow-sm w-fit max-w-[90%] whitespace-pre-line`}>
                {m.text && <span>{m.text}</span>}
              </div>
            ))}
            {isTyping && (
              <div className="text-sm text-gray-800 bg-white p-2 rounded-lg shadow-sm w-fit">
                <span className="animate-pulse">Assistant is typing…</span>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white flex">
            <input
              type="text"
              placeholder="Type your message..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button onClick={handleSend} className="ml-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBotWidget;