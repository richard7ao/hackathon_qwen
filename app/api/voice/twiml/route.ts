import { NextRequest } from "next/server";
import { synthesizeSpeech, buildCallScript } from "@/lib/voice";

function xmlResponse(xml: string) {
  return new Response(xml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

/**
 * TwiML webhook Twilio fetches to control the call.
 * If an ?audio= URL is provided, play it directly; otherwise synthesize
 * the landlord script with Qwen3-TTS on demand.
 */
async function handle(req: NextRequest) {
  const url = new URL(req.url);
  const { searchParams } = url;
  const audio = searchParams.get("audio");

  let audioUrl = audio || "";

  if (!audioUrl) {
    const { spoken } = buildCallScript({
      renterName: searchParams.get("renterName") || "the renter",
      propertyTitle: searchParams.get("propertyTitle") || "your property",
      address: searchParams.get("address") || "the listed address",
      moveInDate: searchParams.get("moveInDate") || undefined,
    });
    try {
      const result = await synthesizeSpeech(spoken, "Cherry", "English");
      // Route through the header-repair proxy so Twilio can play it.
      audioUrl = `${url.origin}/api/voice/audio?src=${encodeURIComponent(result.audioUrl)}`;
    } catch {
      audioUrl = "";
    }
  }

  const escaped = audioUrl
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const body = audioUrl
    ? `<Play>${escaped}</Play>`
    : `<Say voice="Polly.Amy">Hi, this is RentalFinder AI calling about a viewing. We could not reach our voice service, please try again shortly.</Say>`;

  return xmlResponse(`<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`);
}

export async function GET(req: NextRequest) {
  return handle(req);
}

export async function POST(req: NextRequest) {
  return handle(req);
}
