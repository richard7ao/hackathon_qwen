"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Viewing } from "@/lib/types";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface WhatsAppMsg {
  kind: "confirmation" | "reminder";
  body: string;
}

interface VoiceCallModalProps {
  viewing: Viewing;
  renterName: string;
  phoneNumber: string;
  onClose: () => void;
}

type Phase = "calling" | "live" | "whatsapp" | "done";

// Minimal typing for the Web Speech API (not in TS lib DOM by default).
type SpeechRecognitionLike = {
  lang: string;
  interimResults: boolean;
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export default function VoiceCallModal({
  viewing,
  renterName,
  phoneNumber,
  onClose,
}: VoiceCallModalProps) {
  const [phase, setPhase] = useState<Phase>("calling");
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [listening, setListening] = useState(false);
  const [waMessages, setWaMessages] = useState<WhatsAppMsg[]>([]);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [waNote, setWaNote] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const started = useRef(false);
  const scrollEnd = useRef<HTMLDivElement>(null);

  const speak = useCallback((audioUrl?: string) => {
    if (!audioUrl || !audioRef.current) return;
    const el = audioRef.current;
    el.src = audioUrl;
    setSpeaking(true);
    el.onended = () => setSpeaking(false);
    el.play().catch(() => setSpeaking(false));
  }, []);

  const sendTurn = useCallback(
    async (userText: string | null) => {
      const nextHistory = userText
        ? [...turns, { role: "user" as const, content: userText }]
        : turns;
      if (userText) setTurns(nextHistory);
      setThinking(true);
      try {
        const res = await fetch("/api/voice-chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            history: nextHistory,
            property: { title: viewing.propertyTitle, address: viewing.address },
          }),
        });
        const data = await res.json();
        setTurns((t) => [...t, { role: "assistant", content: data.reply }]);
        setThinking(false);
        if (phase === "calling") setPhase("live");
        speak(data.audioUrl);
      } catch {
        setThinking(false);
      }
    },
    [turns, viewing, phase, speak],
  );

  // On open, the landlord answers the call.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    sendTurn(null);
  }, [sendTurn]);

  useEffect(() => {
    scrollEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns, thinking, phase, waMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || thinking) return;
    setInput("");
    sendTurn(text);
  };

  // Speech-to-text (Web Speech API) for "you speaking on the call".
  const toggleMic = () => {
    const w = window as unknown as {
      webkitSpeechRecognition?: new () => SpeechRecognitionLike;
      SpeechRecognition?: new () => SpeechRecognitionLike;
    };
    const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Ctor) {
      alert("Speech input isn't supported in this browser — type instead.");
      return;
    }
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }
    const rec = new Ctor();
    rec.lang = "en-GB";
    rec.interimResults = false;
    rec.onresult = (e) => {
      const transcript = e.results[0][0].transcript;
      setInput("");
      sendTurn(transcript);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  const finishAndBook = useCallback(async () => {
    setPhase("whatsapp");
    try {
      const res = await fetch("/api/whatsapp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          propertyTitle: viewing.propertyTitle,
          address: viewing.address,
          date: viewing.date,
          time: viewing.time,
        }),
      });
      const data = await res.json();
      setWaMessages(data.messages || []);
      setWaStatus(data.status || null);
      setWaNote(data.note || null);
    } catch {
      setWaMessages([]);
    }
    setTimeout(() => setPhase("done"), 2600);
  }, [phoneNumber, viewing]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-bg rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary px-6 py-4 text-white shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                {speaking ? "🔊" : "📞"}
              </span>
              {(phase === "calling" || speaking) && (
                <span className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
              )}
            </div>
            <div>
              <p className="font-semibold">Call · Landlord</p>
              <p className="text-xs text-white/80">
                {phase === "calling" && "Connecting…"}
                {phase === "live" && (speaking ? "Speaking…" : thinking ? "…" : "On the call")}
                {phase === "whatsapp" && "Sending WhatsApp…"}
                {phase === "done" && "Call ended · viewing booked"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">
            ✕
          </button>
        </div>

        {/* Sub-header: what you're calling about */}
        <div className="px-6 py-3 border-b border-surface shrink-0">
          <p className="text-xs text-muted">Calling about</p>
          <p className="text-sm font-medium text-ink">{viewing.propertyTitle}</p>
        </div>

        {/* Conversation */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
          {turns.map((t, i) => (
            <div key={i} className={`flex ${t.role === "user" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                  t.role === "user"
                    ? "bg-primary text-white rounded-br-none"
                    : "bg-primary-subtle text-ink rounded-bl-none"
                }`}
              >
                <span className="block text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                  {t.role === "user" ? `You (${renterName})` : "Landlord"}
                </span>
                {t.content}
              </div>
            </div>
          ))}
          {thinking && (
            <div className="flex justify-start">
              <div className="bg-primary-subtle rounded-2xl rounded-bl-none px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" />
              </div>
            </div>
          )}

          {/* WhatsApp thread on finish */}
          {(phase === "whatsapp" || phase === "done") && (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">💬</span>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">WhatsApp</p>
              </div>
              <div className="rounded-xl bg-[oklch(0.96_0.02_150)] p-3 space-y-2">
                {waMessages.map((m, i) => (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[oklch(0.85_0.12_150)] text-ink px-3 py-2 text-sm">
                      {m.body}
                    </div>
                  </div>
                ))}
                {waMessages.length === 0 && <p className="text-xs text-muted text-center">sending…</p>}
              </div>
              {waStatus === "sent" && (
                <p className="text-xs text-success mt-2">Delivered to your WhatsApp ({phoneNumber}).</p>
              )}
              {waNote && waStatus !== "sent" && (
                <p className="text-xs text-muted mt-2">{waNote}</p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="mt-2 p-3 rounded-xl bg-success/10 text-center">
              <p className="text-sm font-medium text-success">✓ Viewing confirmed</p>
              <p className="text-xs text-muted mt-0.5">
                {viewing.propertyTitle} · {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
              </p>
            </div>
          )}
          <div ref={scrollEnd} />
        </div>

        {/* Composer */}
        {(phase === "live" || phase === "calling") && (
          <div className="px-6 py-3 border-t border-surface shrink-0">
            <form onSubmit={handleSend} className="flex gap-2 items-center">
              <button
                type="button"
                onClick={toggleMic}
                className={`w-10 h-10 rounded-full shrink-0 flex items-center justify-center border transition-colors ${
                  listening ? "bg-error text-white border-error" : "border-muted text-ink hover:border-primary"
                }`}
                title="Speak"
              >
                🎤
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={listening ? "Listening…" : "Say something to the landlord…"}
                className="flex-1 px-4 py-2.5 rounded-xl border border-muted bg-bg text-sm placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-50"
              >
                Send
              </button>
            </form>
            <button
              onClick={finishAndBook}
              className="mt-2 w-full py-2 rounded-xl bg-success/10 text-success text-sm font-medium hover:bg-success/20 transition-colors"
            >
              End call &amp; book the viewing
            </button>
          </div>
        )}

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
}
