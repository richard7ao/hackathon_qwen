import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech, buildCallScript } from "@/lib/voice";

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

    const { spoken, transcript } = buildCallScript({
      renterName: renterName || "the renter",
      propertyTitle: propertyTitle || "your property",
      address: address || "the listed address",
      moveInDate,
    });

    const { audioUrl } = await synthesizeSpeech(spoken, "Cherry", "English");

    return NextResponse.json({ audioUrl, transcript });
  } catch (error) {
    console.error("Voice API error:", error);
    return NextResponse.json(
      { error: "Failed to generate call audio" },
      { status: 500 },
    );
  }
}
