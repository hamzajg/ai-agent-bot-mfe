import React, { useState } from 'react';
import { Bot } from 'lucide-react';
import { AIAgent } from '../../agent/AIAgent';
import { logEvent, getSettings } from '@shared/utils/usage';
import { Product } from '@shared/types';
import { agentProfile } from '@modules/agent/agentProfile';

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

      // Try to parse action JSON: {"action":"Products Search","params":{"text":"..."}}
      let handled = false;
      try {
        const trimmed = reply.trim();
        if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
          const obj = JSON.parse(trimmed) as { action?: string; params?: Record<string, any> };
          if (obj && obj.action) {
            const actionName = obj.action.toLowerCase();
            if (actionName === 'products search') {
              const q = String(obj.params?.text || '');
              if (q) {
                append({ sender: 'bot', text: '🔎 Searching products...' });
                logEvent('action_called', { name: 'Products Search', source: 'tool_call' });
                // Call products service
                // Here we would make the actual API call to search products
                // For now just show a placeholder response
                append({ sender: 'bot', text: `Found products matching "${q}"...` });
                handled = true;
              }
            }
          }
        }
      } catch {}

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