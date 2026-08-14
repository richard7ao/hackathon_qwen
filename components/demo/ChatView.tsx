"use client";

import { useState, useRef, useEffect } from "react";
import { Message } from "@/lib/types";

interface ChatViewProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  isTyping: boolean;
  disabled: boolean;
  suggestions: string[];
}

export default function ChatView({
  messages,
  onSendMessage,
  isTyping,
  disabled,
  suggestions,
}: ChatViewProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "bot" && (
              <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold mr-2 shrink-0 self-end">
                AI
              </span>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-primary text-white rounded-br-none"
                  : "bg-primary-subtle text-ink rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex justify-start">
            <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-semibold mr-2 shrink-0 self-end">
              AI
            </span>
            <div className="bg-primary-subtle rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
              <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
            </div>
          </div>
        )}
        <div ref={scrollRef} />
      </div>

      <div className="px-6 py-4 border-t border-surface">
        {suggestions.length > 0 && !disabled && (
          <div className="flex flex-wrap gap-2 mb-3">
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => onSendMessage(suggestion)}
                className="text-xs px-3 py-1.5 rounded-full border border-muted text-muted hover:border-primary hover:text-primary transition-colors duration-150 ease-out-quart"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={disabled ? "Chat complete — check the sidebar" : "Type your answer…"}
            disabled={disabled}
            className="flex-1 px-4 py-2.5 rounded-xl border border-muted bg-bg text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={disabled || !input.trim()}
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50 transition-colors duration-150 ease-out-quart"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
