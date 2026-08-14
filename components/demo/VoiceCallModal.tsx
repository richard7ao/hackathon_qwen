"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Viewing } from "@/lib/types";

interface CallLine {
  speaker: "agent" | "landlord";
  text: string;
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

type Phase = "dialing" | "live" | "whatsapp" | "done" | "error";

export default function VoiceCallModal({
  viewing,
  renterName,
  phoneNumber,
  onClose,
}: VoiceCallModalProps) {
  const [phase, setPhase] = useState<Phase>("dialing");
  const [transcript, setTranscript] = useState<CallLine[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const [waMessages, setWaMessages] = useState<WhatsAppMsg[]>([]);
  const [waRevealed, setWaRevealed] = useState(0);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const started = useRef(false);

  const startCall = useCallback(async () => {
    setPhase("dialing");
    setError(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          call: true,
          phoneNumber,
          renterName,
          propertyTitle: viewing.propertyTitle,
          address: viewing.address,
          moveInDate: viewing.date,
        }),
      });
      if (!res.ok) throw new Error("Voice request failed");
      const data = await res.json();
      setTranscript(data.transcript || []);
      setCallStatus(data.callStatus || null);
      setPhase("live");
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play().catch(() => {});
      }
    } catch {
      setError("Could not start the call. Try again.");
      setPhase("error");
    }
  }, [phoneNumber, renterName, viewing]);

  // Auto-start the call when the modal opens.
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    startCall();
  }, [startCall]);

  // Reveal transcript lines progressively, then move to WhatsApp.
  useEffect(() => {
    if (phase !== "live" || transcript.length === 0) return;
    if (revealed >= transcript.length - 1) {
      const t = setTimeout(() => setPhase("whatsapp"), 1400);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), 1600);
    return () => clearTimeout(t);
  }, [phase, revealed, transcript.length]);

  // Fire WhatsApp when entering the whatsapp phase.
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

  // Reveal WhatsApp messages one at a time, then finish.
  useEffect(() => {
    if (phase !== "whatsapp" || waMessages.length === 0) return;
    if (waRevealed >= waMessages.length) {
      const t = setTimeout(() => setPhase("done"), 800);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setWaRevealed((r) => r + 1), 1500);
    return () => clearTimeout(t);
  }, [phase, waRevealed, waMessages.length]);

  const showTranscript = phase === "live" || phase === "whatsapp" || phase === "done";
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
                  📞
                </span>
                {(phase === "dialing" || phase === "live") && (
                  <span className="absolute inset-0 rounded-full border-2 border-white/60 animate-ping" />
                )}
              </div>
              <div>
                <p className="font-semibold">Ava · RentalFinder AI</p>
                <p className="text-xs text-white/80">
                  {phase === "dialing" && `Calling ${phoneNumber}…`}
                  {phase === "live" && "On the call"}
                  {phase === "whatsapp" && "Sending WhatsApp…"}
                  {phase === "done" && "Booked & notified"}
                  {phase === "error" && "Call failed"}
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

          {phase === "dialing" && (
            <div className="py-8 text-center">
              <div className="flex justify-center gap-1.5 mb-3">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              </div>
              <p className="text-sm text-muted">Generating voice & calling {phoneNumber}…</p>
            </div>
          )}

          {showTranscript && transcript.length > 0 && (
            <div className="space-y-3">
              {transcript
                .slice(0, phase === "live" ? revealed + 1 : transcript.length)
                .map((line, i) => (
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
                      <span className="block text-[10px] uppercase tracking-wide opacity-60 mb-0.5">
                        {line.speaker === "agent" ? "Ava (AI)" : "Landlord"}
                      </span>
                      {line.text}
                    </div>
                  </div>
                ))}
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
              {waStatus === "error" && (
                <p className="text-xs text-warning mt-2">
                  WhatsApp shown as demo — join the Twilio sandbox to receive it on your phone.
                </p>
              )}
              {waStatus === "sent" && (
                <p className="text-xs text-success mt-2">Sent to your WhatsApp ({phoneNumber}).</p>
              )}
            </div>
          )}

          {phase === "done" && (
            <div className="mt-5 p-3 rounded-xl bg-success/10 text-center">
              <p className="text-sm font-medium text-success">✓ Viewing confirmed</p>
              <p className="text-xs text-muted mt-0.5">
                {viewing.propertyTitle} · {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
              </p>
              {callStatus === "placed" && (
                <p className="text-xs text-muted mt-1">A real call was placed to {phoneNumber}.</p>
              )}
            </div>
          )}

          {phase === "error" && (
            <div className="py-6 text-center">
              <p className="text-sm text-error mb-3">{error}</p>
              <button
                onClick={startCall}
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
