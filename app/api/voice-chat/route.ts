import { NextRequest, NextResponse } from "next/server";
import { chatCompletion } from "@/lib/sie";
import { synthesizeSpeech } from "@/lib/voice";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

/**
 * Interactive voice call: the AI plays the landlord/letting agent for a
 * property. The user (caller, on their laptop) speaks/types; the landlord
 * replies naturally and the reply is synthesized with Qwen3-TTS for in-browser
 * playback.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      history,
      property,
      renterName,
    }: { history: Turn[]; property?: { title?: string; address?: string }; renterName?: string } =
      await req.json();

    const title = property?.title || "the property";
    const address = property?.address || "the listed address";
    const renter = renterName || "my client";

    const system = `You are Ava, a friendly AI booking assistant for RentalFinder. You are phoning a LANDLORD to arrange a viewing of their rental "${title}" at ${address}, on behalf of a tenant called ${renter}. The person you are speaking to IS the landlord.
Rules:
- Speak naturally and briefly, like a real phone call: 1-2 short sentences per reply.
- You are the CALLER. If the call is just starting (no messages yet), open the call: introduce yourself as Ava from RentalFinder, say you're calling on behalf of ${renter} about "${title}", and ask if it's still available.
- Your goal is to agree a viewing time. Propose a specific slot (e.g. "would this Saturday at 2pm suit you?") and confirm once the landlord agrees.
- Be polite and efficient; thank them and confirm the details at the end.
- Do not use emojis or markdown. Keep it human and warm.`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: system },
    ];
    for (const t of history || []) {
      messages.push({ role: t.role, content: t.content });
    }
    // Nudge a greeting when the call just connected.
    if (!history || history.length === 0) {
      messages.push({ role: "user", content: "(call connected)" });
    }

    const reply = (await chatCompletion(messages)).trim() || "Hello? Sorry, I didn't catch that.";

    let audioUrl: string | undefined;
    try {
      const tts = await synthesizeSpeech(reply, "Cherry", "English");
      audioUrl = `/api/voice/audio?src=${encodeURIComponent(tts.audioUrl)}`;
    } catch {
      audioUrl = undefined;
    }

    return NextResponse.json({ reply, audioUrl });
  } catch (error) {
    console.error("voice-chat error:", error);
    return NextResponse.json({ reply: "Sorry, the line dropped. Could you say that again?" }, { status: 200 });
  }
}
