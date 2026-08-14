import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech, buildCallScript } from "@/lib/voice";

interface VoiceLine {
  speaker: "agent" | "landlord";
  text: string;
  audioUrl?: string;
}

/**
 * Build the landlord call and synthesize the AGENT lines with Qwen3-TTS.
 * Audio is played in the browser (no phone call). Each agent line gets its own
 * clip, routed through /api/voice/audio to repair the WAV header for playback.
 */
export async function POST(req: NextRequest) {
  try {
    const {
      renterName,
      propertyTitle,
      address,
      moveInDate,
    }: {
      renterName?: string;
      propertyTitle?: string;
      address?: string;
      moveInDate?: string;
    } = await req.json();

    const { transcript } = buildCallScript({
      renterName: renterName || "the renter",
      propertyTitle: propertyTitle || "your property",
      address: address || "the listed address",
      moveInDate,
    });

    // Synthesize each agent line (landlord lines are shown as text only).
    const lines: VoiceLine[] = await Promise.all(
      transcript.map(async (line) => {
        if (line.speaker !== "agent") return { ...line };
        try {
          const { audioUrl } = await synthesizeSpeech(line.text, "Cherry", "English");
          return { ...line, audioUrl: `/api/voice/audio?src=${encodeURIComponent(audioUrl)}` };
        } catch {
          return { ...line };
        }
      }),
    );

    return NextResponse.json({ lines });
  } catch (error) {
    console.error("Voice API error:", error);
    return NextResponse.json({ error: "Failed to generate voice" }, { status: 500 });
  }
}
