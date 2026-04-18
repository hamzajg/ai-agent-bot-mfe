import React from "react";
import { Bot } from "lucide-react";

interface Props {
  onClick: () => void;
}

const FloatingBotButton: React.FC<Props> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="
        fixed
        bottom-6
        right-6
        w-16
        h-16
        bg-gradient-to-br from-blue-500 to-indigo-600
        text-white
        rounded-full
        shadow-2xl
        flex
        items-center
        justify-center
        z-50
        hover:scale-110
        transition-transform
        duration-300
        ring-2 ring-blue-400/30
      "
    aria-label="Open Chatbot"
  >
    <Bot className="w-8 h-8" />
  </button>
);

export default FloatingBotButton;