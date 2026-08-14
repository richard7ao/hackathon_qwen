"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Viewing } from "@/lib/types";

interface VoiceLine {
  speaker: "agent" | "landlord";
  text: string;
  audioUrl?: string;
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

type Phase = "connecting" | "live" | "whatsapp" | "done" | "error";

export default function VoiceCallModal({
  viewing,
  renterName,
  phoneNumber,
  onClose,
}: VoiceCallModalProps) {
  const [phase, setPhase] = useState<Phase>("connecting");
  const [lines, setLines] = useState<VoiceLine[]>([]);
  const [current, setCurrent] = useState(-1);
  const [error, setError] = useState<string | null>(null);
  const [waMessages, setWaMessages] = useState<WhatsAppMsg[]>([]);
  const [waRevealed, setWaRevealed] = useState(0);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const started = useRef(false);
  const transcriptEnd = useRef<HTMLDivElement>(null);

  const loadCall = useCallback(async () => {
    setPhase("connecting");
    setError(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          renterName,
          propertyTitle: viewing.propertyTitle,
          address: viewing.address,
          moveInDate: viewing.date,
        }),
      });
      if (!res.ok) throw new Error("voice failed");
      const data = await res.json();
      if (!data.lines || data.lines.length === 0) throw new Error("no lines");
      setLines(data.lines);
      setPhase("live");
      setCurrent(0);
    } catch {
      setError("Could not start the call. Try again.");
      setPhase("error");
    }
  }, [renterName, viewing]);

  // Kick off once.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    loadCall();
  }, [loadCall]);

  // Drive the conversation line by line.
  useEffect(() => {
    if (phase !== "live" || current < 0 || current >= lines.length) return;
    const line = lines[current];
    const advance = () => {
      if (current + 1 >= lines.length) {
        setTimeout(() => setPhase("whatsapp"), 900);
      } else {
        setCurrent((c) => c + 1);
      }
    };

    if (line.speaker === "agent" && line.audioUrl && audioRef.current) {
      const el = audioRef.current;
      el.src = line.audioUrl;
      el.onended = advance;
      el.play().catch(() => {
        // Autoplay blocked or error — fall back to a timed advance.
        setTimeout(advance, 2600);
      });
      return () => {
        el.onended = null;
      };
    }
    // Landlord line (or missing audio): show for a beat, then advance.
    const t = setTimeout(advance, line.speaker === "landlord" ? 1400 : 2600);
    return () => clearTimeout(t);
  }, [phase, current, lines]);

  useEffect(() => {
    transcriptEnd.current?.scrollIntoView({ behavior: "smooth" });
  }, [current, phase, waRevealed]);

  // WhatsApp phase.
  useEffect(() => {
    if (phase !== "whatsapp") return;
    let cancelled = false;
    (async () => {
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
        if (cancelled) return;
        setWaMessages(data.messages || []);
        setWaStatus(data.status || null);
      } catch {
        if (!cancelled) setWaMessages([]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [phase, phoneNumber, viewing]);

  useEffect(() => {
    if (phase !== "whatsapp" || waMessages.length === 0) return;
    if (waRevealed >= waMessages.length) {
      const t = setTimeout(() => setPhase("done"), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setWaRevealed((r) => r + 1), 1500);
    return () => clearTimeout(t);
  }, [phase, waRevealed, waMessages.length]);

  const visibleLines = phase === "live" ? lines.slice(0, current + 1) : lines;
  const showWhatsApp = phase === "whatsapp" || phase === "done";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-bg rounded-2xl w-full max-w-md overflow-hidden shadow-xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-lg">
                  🎙️
                </span>
                {(phase === "connecting" || phase === "live") && (
                  <span className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
                )}
              </div>
              <div>
                <p className="font-semibold">Ava · AI Voice Agent</p>
                <p className="text-xs text-white/80">
                  {phase === "connecting" && "Preparing the call…"}
                  {phase === "live" && "Calling the landlord"}
                  {phase === "whatsapp" && "Sending WhatsApp…"}
                  {phase === "done" && "Booked & notified"}
                  {phase === "error" && "Something went wrong"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">
              ✕
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm text-muted">Booking a viewing for</p>
            <p className="font-medium text-ink">{viewing.propertyTitle}</p>
            <p className="text-sm text-muted">{viewing.address}</p>
          </div>

          {phase === "connecting" && (
            <div className="py-8 text-center">
              <div className="flex justify-center gap-1.5 mb-3">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              </div>
              <p className="text-sm text-muted">Generating Ava&apos;s voice with Qwen3-TTS…</p>
            </div>
          )}

          {(phase === "live" || showWhatsApp) && lines.length > 0 && (
            <div className="space-y-3">
              {visibleLines.map((line, i) => {
                const isSpeaking = phase === "live" && i === current && line.speaker === "agent";
                return (
                  <div
                    key={i}
                    className={`flex ${line.speaker === "agent" ? "justify-start" : "justify-end"}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
                        line.speaker === "agent"
                          ? "bg-primary-subtle text-ink rounded-bl-none"
                          : "bg-surface text-muted rounded-br-none"
                      }`}
                    >
                      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                        {line.speaker === "agent" ? "Ava (AI)" : "Landlord"}
                        {isSpeaking && (
                          <span className="inline-flex gap-0.5 items-end h-2.5">
                            <span className="w-0.5 h-1.5 bg-primary rounded animate-pulse" />
                            <span className="w-0.5 h-2.5 bg-primary rounded animate-pulse [animation-delay:-0.2s]" />
                            <span className="w-0.5 h-2 bg-primary rounded animate-pulse [animation-delay:-0.4s]" />
                          </span>
                        )}
                      </span>
                      {line.text}
                    </div>
                  </div>
                );
              })}
              <div ref={transcriptEnd} />
            </div>
          )}

          {/* WhatsApp thread */}
          {showWhatsApp && (
            <div className="mt-5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">💬</span>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide">WhatsApp</p>
              </div>
              <div className="rounded-xl bg-[oklch(0.96_0.02_150)] p-3 space-y-2">
                {waMessages.slice(0, waRevealed).map((m, i) => (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] rounded-2xl rounded-br-none bg-[oklch(0.85_0.12_150)] text-ink px-3 py-2 text-sm">
                      {m.body}
                    </div>
                  </div>
                ))}
                {waRevealed < waMessages.length && (
                  <p className="text-xs text-muted text-center">sending…</p>
                )}
              </div>
              {waStatus === "sent" && (
                <p className="text-xs text-success mt-2">Also sent to your WhatsApp ({phoneNumber}).</p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="mt-5 p-3 rounded-xl bg-success/10 text-center">
              <p className="text-sm font-medium text-success">✓ Viewing confirmed</p>
              <p className="text-xs text-muted mt-0.5">
                {viewing.propertyTitle} · {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
              </p>
            </div>
          )}

          {phase === "error" && (
            <div className="py-6 text-center">
              <p className="text-sm text-error mb-3">{error}</p>
              <button
                onClick={loadCall}
                className="px-5 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover"
              >
                Retry
              </button>
            </div>
          )}
        </div>

        {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
        <audio ref={audioRef} />
      </div>
    </div>
  );
}
