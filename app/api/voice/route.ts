import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech, buildCallScript } from "@/lib/voice";
import { placeCall, twilioConfigured, publicBaseUrl } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  try {
    const {
      renterName,
      propertyTitle,
      address,
      moveInDate,
      call,
      phoneNumber,
    }: {
      renterName?: string;
      propertyTitle?: string;
      address?: string;
      moveInDate?: string;
      call?: boolean;
      phoneNumber?: string;
    } = await req.json();

    const { spoken, transcript } = buildCallScript({
      renterName: renterName || "the renter",
      propertyTitle: propertyTitle || "your property",
      address: address || "the listed address",
      moveInDate,
    });

    // Generate the human voice with Qwen3-TTS (Alibaba Cloud).
    const { audioUrl } = await synthesizeSpeech(spoken, "Cherry", "English");

    // Optionally place a real outbound call via Twilio (Url-based for trial accounts).
    let callSid: string | null = null;
    let callStatus: "placed" | "skipped" | "unconfigured" = "skipped";

    if (call) {
      const to = phoneNumber || process.env.DEMO_CALL_TO || "";
      if (!twilioConfigured() || !to) {
        callStatus = "unconfigured";
      } else {
        const twimlUrl = `${publicBaseUrl()}/api/voice/twiml?audio=${encodeURIComponent(audioUrl)}`;
        callSid = await placeCall({ to, twimlUrl });
        callStatus = "placed";
      }
    }

    return NextResponse.json({ audioUrl, transcript, callSid, callStatus });
  } catch (error) {
    console.error("Voice API error:", error);
    return NextResponse.json({ error: "Failed to generate/place call" }, { status: 500 });
  }
}
