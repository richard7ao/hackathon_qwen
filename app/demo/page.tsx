"use client";

import { useState } from "react";
import Sidebar, { DemoView } from "@/components/demo/Sidebar";
import ChatView from "@/components/demo/ChatView";
import OverviewView from "@/components/demo/OverviewView";
import ManualSearchView from "@/components/demo/ManualSearchView";
import ViewedPropertiesView from "@/components/demo/ViewedPropertiesView";
import BookedViewingsView from "@/components/demo/BookedViewingsView";
import VoiceCallModal from "@/components/demo/VoiceCallModal";
import { Message, Preferences, Property, PropertyDecision, Viewing } from "@/lib/types";

const RENTER_NAME = "Richard";
const DEMO_PHONE = "+447402184536";

const initialMessages: Message[] = [
  {
    role: "bot",
    text: "Hi! I’m RentalFinder AI. I’ll help you find your next rental and book viewings. Let’s start — what city or neighborhood are you looking in?",
    timestamp: new Date().toISOString(),
  },
];

function nextSaturday2pm(): { date: string; time: string } {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSat = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSat);
  d.setHours(14, 0, 0, 0);
  return { date: d.toISOString(), time: "2:00 PM" };
}

export default function DemoPage() {
  const [activeView, setActiveView] = useState<DemoView>("chat");

  // Chat state
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isTyping, setIsTyping] = useState(false);
  const [conversationComplete, setConversationComplete] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Shared search state
  const [preferences, setPreferences] = useState<Preferences>({});
  const [matches, setMatches] = useState<Property[]>([]);
  const [decisions, setDecisions] = useState<Record<string, PropertyDecision>>({});
  const [viewings, setViewings] = useState<Viewing[]>([]);

  // Voice call modal
  const [callViewing, setCallViewing] = useState<Viewing | null>(null);

  const matchedIds = new Set(matches.map((m) => m.id));
  const decidedCount = Object.keys(decisions).length;

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
      if (data.properties && data.properties.length > 0) {
        setMatches((prev) => {
          const ids = new Set(prev.map((p: Property) => p.id));
          return [...prev, ...data.properties.filter((p: Property) => !ids.has(p.id))];
        });
      }
      if (data.suggestions) setSuggestions(data.suggestions);
      if (data.complete) setConversationComplete(true);
    } catch {
      addMessage("bot", "Sorry, I hit a snag. Can you try that again?");
    } finally {
      setIsTyping(false);
    }
  };

  const addMatch = (property: Property) => {
    setMatches((prev) => (prev.some((p) => p.id === property.id) ? prev : [...prev, property]));
  };

  const decide = (property: Property, decision: PropertyDecision) => {
    setDecisions((prev) => ({ ...prev, [property.id]: decision }));
    if (decision === "yes") {
      const { date, time } = nextSaturday2pm();
      const viewing: Viewing = {
        id: `v-${property.id}`,
        propertyId: property.id,
        propertyTitle: property.title,
        address: property.address,
        date,
        time,
        channel: "voice",
      };
      setViewings((prev) => (prev.some((v) => v.propertyId === property.id) ? prev : [...prev, viewing]));
      // Immediately open the voice agent to "call" the landlord.
      setCallViewing(viewing);
    }
  };

  return (
    <div className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-bg">
      <Sidebar
        active={activeView}
        onSelect={setActiveView}
        counts={{ matches: matches.length, viewed: decidedCount, booked: viewings.length }}
      />

      <main className="flex-1 overflow-y-auto">
        {activeView === "chat" && (
          <ChatView
            messages={messages}
            onSendMessage={handleSendMessage}
            isTyping={isTyping}
            disabled={conversationComplete}
            suggestions={suggestions}
          />
        )}
        {activeView === "overview" && (
          <OverviewView
            preferences={preferences}
            matches={matches}
            decidedCount={decidedCount}
            viewings={viewings}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "search" && (
          <ManualSearchView onAddMatch={addMatch} matchedIds={matchedIds} />
        )}
        {activeView === "viewed" && (
          <ViewedPropertiesView
            matches={matches}
            decisions={decisions}
            onDecide={decide}
            onNavigate={setActiveView}
          />
        )}
        {activeView === "booked" && (
          <BookedViewingsView viewings={viewings} onNavigate={setActiveView} onCall={setCallViewing} />
        )}
      </main>

      {callViewing && (
        <VoiceCallModal
          viewing={callViewing}
          renterName={RENTER_NAME}
          phoneNumber={DEMO_PHONE}
          onClose={() => setCallViewing(null)}
        />
      )}
    </div>
  );
}
