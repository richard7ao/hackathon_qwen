import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp } from "@/lib/twilio";

export async function POST(req: NextRequest) {
  try {
    const {
      phoneNumber,
      propertyTitle,
      address,
      date,
      time,
    }: {
      phoneNumber?: string;
      propertyTitle?: string;
      address?: string;
      date?: string;
      time?: string;
    } = await req.json();

    const to = phoneNumber || process.env.DEMO_CALL_TO || "";
    const when = date ? new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" }) : "soon";

    const confirmation = `✅ RentalFinder AI: Your viewing at ${propertyTitle || "the property"} is booked for ${when} at ${time || "2:00 PM"}. Address: ${address || ""}. Good luck!`;
    const reminder = `⏰ Reminder: your viewing at ${propertyTitle || "the property"} is in 1 hour (${time || "2:00 PM"}). Address: ${address || ""}. See you there!`;

    let confirmationSid: string | null = null;
    let reminderSid: string | null = null;
    let status: "sent" | "unconfigured" | "error" = "sent";
    let errorMessage: string | null = null;

    if (!to) {
      status = "unconfigured";
    } else {
      try {
        confirmationSid = await sendWhatsApp(to, confirmation);
        // Simulated "in 1 hour" reminder — sent immediately for the demo.
        reminderSid = await sendWhatsApp(to, reminder);
      } catch (e) {
        status = "error";
        errorMessage = e instanceof Error ? e.message : "WhatsApp send failed";
      }
    }

    return NextResponse.json({
      status,
      confirmationSid,
      reminderSid,
      errorMessage,
      messages: [
        { kind: "confirmation", body: confirmation },
        { kind: "reminder", body: reminder },
      ],
    });
  } catch (error) {
    console.error("WhatsApp API error:", error);
    return NextResponse.json({ status: "error", messages: [] }, { status: 500 });
  }
}
