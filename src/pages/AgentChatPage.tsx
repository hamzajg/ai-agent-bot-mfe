import React, { useState } from 'react';
import { AIAgent } from '../agent/AIAgent';

const AgentChatPage: React.FC = () => {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);

    const response = await AIAgent.sendMessage(input);
    setMessages((prev) => [...prev, { role: 'assistant', content: response }]);

    setInput('');
  };

  return (
    <div className='flex flex-col h-screen'>
      <div className='flex-1 overflow-y-auto p-4 space-y-3'>
        {messages.map((msg, idx) => (
          <div key={idx} className={`p-3 rounded-lg max-w-lg ${msg.role === 'user' ? 'bg-blue-500 text-white ml-auto' : 'bg-gray-200 text-gray-800'}`}>
            {msg.content}
          </div>
        ))}
      </div>
      <div className='p-4 border-t flex gap-2'>
        <input
          type='text'
          className='flex-1 border rounded-lg px-3 py-2'
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Ask your AI shopping assistant...'
        />
        <button onClick={sendMessage} className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'>
          Send
        </button>
      </div>
    </div>
  );
};

export default AgentChatPage;
