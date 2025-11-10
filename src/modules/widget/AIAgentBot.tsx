import React, { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import FloatingBotButton from "@shared/components/FloatingBotButton";

interface Message {
  sender: "user" | "bot";
  text: string;
}

const AIAgentBot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: "bot", text: "👋 Hi! I'm your AI Shopping Assistant. How can I help today?" },
  ]);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");

    // Simulate AI reply (placeholder)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: `Searching for "${newMessage.text}"... 🔍` },
      ]);
    }, 800);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <>
      {!isOpen && <FloatingBotButton onClick={() => setIsOpen(true)} />}

      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-80 max-w-full bg-white border border-gray-200 
                     shadow-2xl rounded-2xl flex flex-col animate-fadeIn"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-t-2xl">
            <h2 className="text-lg font-semibold">AI Shopping Assistant</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="hover:text-gray-200 transition"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-3 max-h-96 scroll-smooth">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`px-3 py-2 rounded-2xl text-sm max-w-[80%] ${
                    msg.sender === "user"
                      ? "bg-blue-500 text-white rounded-br-none"
                      : "bg-white text-gray-800 border border-gray-200 shadow-sm rounded-bl-none"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex p-3 border-t bg-white rounded-b-2xl">
            <input
              type="text"
              className="flex-grow border border-gray-300 rounded-lg p-2 text-sm mr-2 
                         focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button
              onClick={handleSend}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 
                         active:scale-95 transition-transform"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AIAgentBot;