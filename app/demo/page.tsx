"use client";

import { useState } from "react";
import ChatPanel from "@/components/ChatPanel";
import Dashboard from "@/components/Dashboard";
import { Message, Property, Outreach } from "@/lib/types";

const initialMessages: Message[] = [
  {
    role: "bot",
    text: "Hi! I’m RentalFinder AI. I’ll help you find your next rental and book viewings. Let’s start — what city or neighborhood are you looking in?",
    timestamp: new Date().toISOString(),
  },
];

export default function DemoPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [preferences, setPreferences] = useState<Record<string, string | number | string[]>>({});
  const [properties, setProperties] = useState<Property[]>([]);
  const [outreach, setOutreach] = useState<Outreach[]>([]);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const addMessage = (role: Message["role"], text: string) => {
    setMessages((prev) => [...prev, { role, text, timestamp: new Date().toISOString() }]);
  };

  const handleSendMessage = async (text: string) => {
    if (conversationComplete) return;
    addMessage("user", text);
    setIsTyping(true);
    setSuggestions([]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });

      if (!response.ok) throw new Error("Chat request failed");
      const data = await response.json();

      addMessage("bot", data.reply);
      if (data.preferences) setPreferences(data.preferences);
      if (data.properties) setProperties(data.properties);
      if (data.outreach) setOutreach(data.outreach);
      if (data.suggestions) setSuggestions(data.suggestions);
      if (data.complete) setConversationComplete(true);
    } catch (error) {
      addMessage("bot", "Sorry, I hit a snag. Can you try that again?");
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="h-screen w-full flex flex-col md:flex-row overflow-hidden">
      <div className="flex-1 md:max-w-md lg:max-w-md h-full border-r border-surface">
        <ChatPanel
          messages={messages}
          onSendMessage={handleSendMessage}
          isTyping={isTyping}
          disabled={conversationComplete}
          suggestions={suggestions}
        />
      </div>
      <div className="flex-[2] h-full hidden md:block">
        <Dashboard preferences={preferences} properties={properties} outreach={outreach} />
      </div>
      <div className="md:hidden h-1/2">
        <Dashboard preferences={preferences} properties={properties} outreach={outreach} />
      </div>
    </main>
  );
}
