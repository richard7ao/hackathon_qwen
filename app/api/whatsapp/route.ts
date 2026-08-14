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
    const when = date
      ? new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })
      : "soon";

    const confirmation = `✅ RentalFinder AI: Your viewing at ${propertyTitle || "the property"} is booked for ${when} at ${time || "2:00 PM"}. Address: ${address || ""}. Good luck!`;
    const reminder = `⏰ Reminder: your viewing at ${propertyTitle || "the property"} is in 1 hour (${time || "2:00 PM"}). Address: ${address || ""}. See you there!`;

    // We only ever send/display our own correct message (never the generic
    // static template). Free-form WhatsApp delivers inside an open 24h session.
    const messages = [
      { kind: "confirmation" as const, body: confirmation },
      { kind: "reminder" as const, body: reminder },
    ];

    let status: "sent" | "needs_session" | "unconfigured" | "error" = "sent";
    let note: string | null = null;

    if (!to) {
      status = "unconfigured";
    } else {
      try {
        await sendWhatsApp(to, confirmation);
        await sendWhatsApp(to, reminder);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "";
        // 63016 = message outside the 24h session window (needs a template).
        if (msg.includes("63016") || msg.includes("session")) {
          status = "needs_session";
          note = "Shown here for the demo. To receive it on your phone, send any WhatsApp to the RentalFinder number first (opens a 24h window).";
        } else {
          status = "error";
          note = "Couldn't reach WhatsApp — showing the message here instead.";
        }
      }
    }

    return NextResponse.json({ status, note, messages });
  } catch (error) {
    console.error("WhatsApp API error:", error);
    return NextResponse.json({ status: "error", messages: [] }, { status: 500 });
  }
}
