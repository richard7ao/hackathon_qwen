"use client";

import { useEffect, useRef, useState } from "react";
import { Viewing } from "@/lib/types";

interface CallLine {
  speaker: "agent" | "landlord";
  text: string;
}

interface VoiceCallModalProps {
  viewing: Viewing;
  renterName: string;
  phoneNumber: string;
  onClose: () => void;
}

type Phase = "idle" | "dialing" | "live" | "done" | "error";

export default function VoiceCallModal({
  viewing,
  renterName,
  phoneNumber,
  onClose,
}: VoiceCallModalProps) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState<CallLine[]>([]);
  const [revealed, setRevealed] = useState(0);
  const [callToPhone, setCallToPhone] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [callStatus, setCallStatus] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const startCall = async () => {
    setPhase("dialing");
    setError(null);
    try {
      const res = await fetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          call: callToPhone,
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

      // Play the Qwen3-TTS audio in the browser too.
      if (data.audioUrl && audioRef.current) {
        audioRef.current.src = data.audioUrl;
        audioRef.current.play().catch(() => {});
      }
    } catch (e) {
      setError("Could not start the call. Try again.");
      setPhase("error");
    }
  };

  // Reveal transcript lines progressively while "live".
  useEffect(() => {
    if (phase !== "live" || transcript.length === 0) return;
    if (revealed >= transcript.length) {
      const t = setTimeout(() => setPhase("done"), 1200);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setRevealed((r) => r + 1), 1800);
    return () => clearTimeout(t);
  }, [phase, revealed, transcript.length]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 backdrop-blur-sm p-4">
      <div className="bg-bg rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-primary px-6 py-5 text-white">
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
                  {phase === "idle" && "Ready to call the landlord"}
                  {phase === "dialing" && "Dialing…"}
                  {phase === "live" && "On the call"}
                  {phase === "done" && "Call complete"}
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
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-muted">Booking a viewing for</p>
            <p className="font-medium text-ink">{viewing.propertyTitle}</p>
            <p className="text-sm text-muted">{viewing.address}</p>
          </div>

          {phase === "idle" && (
            <>
              <label className="flex items-center gap-2 text-sm text-ink mb-4">
                <input
                  type="checkbox"
                  checked={callToPhone}
                  onChange={(e) => setCallToPhone(e.target.checked)}
                  className="accent-[oklch(0.52_0.17_145)]"
                />
                Also ring my real phone ({phoneNumber})
              </label>
              <button
                onClick={startCall}
                className="w-full py-3 rounded-xl bg-primary text-white font-medium hover:bg-primary-hover transition-colors"
              >
                Start the call
              </button>
              <p className="mt-2 text-xs text-muted text-center">
                Voice by Qwen3-TTS · dialed via Twilio
              </p>
            </>
          )}

          {phase === "dialing" && (
            <div className="py-8 text-center">
              <div className="flex justify-center gap-1.5 mb-3">
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 bg-primary rounded-full animate-bounce" />
              </div>
              <p className="text-sm text-muted">Generating voice & connecting…</p>
            </div>
          )}

          {(phase === "live" || phase === "done") && (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {transcript.slice(0, phase === "done" ? transcript.length : revealed + 1).map((line, i) => (
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

          {phase === "done" && (
            <div className="mt-5 p-3 rounded-xl bg-success/10 text-center">
              <p className="text-sm font-medium text-success">✓ Viewing confirmed</p>
              <p className="text-xs text-muted mt-0.5">
                {viewing.propertyTitle} · {new Date(viewing.date).toLocaleDateString()} at {viewing.time}
              </p>
              {callStatus === "placed" && (
                <p className="text-xs text-muted mt-1">A real call was placed to {phoneNumber}.</p>
              )}
              {callStatus === "unconfigured" && (
                <p className="text-xs text-warning mt-1">
                  Phone dialing not configured — played in browser only.
                </p>
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
