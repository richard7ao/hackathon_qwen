import { NextRequest, NextResponse } from "next/server";
import { sendWhatsApp, sendWhatsAppTemplate } from "@/lib/twilio";

// The fixed text of the approved Twilio sample template (used as a fallback
// when there is no open 24h session for free-form messages).
const TEMPLATE_TEXT =
  "Reminder: Appt Tue Oct 29, 3:00 PM. Reply C to confirm or R to reschedule. Test message from Twilio.";

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

    // The messages we DISPLAY are exactly the ones we actually deliver, so the
    // website matches the phone.
    const delivered: { kind: "confirmation" | "reminder" | "template"; body: string }[] = [];
    let status: "sent" | "template" | "unconfigured" | "error" = "sent";
    let note: string | null = null;

    if (!to) {
      status = "unconfigured";
    } else {
      // Prefer free-form (our exact wording) — works inside an open 24h session.
      let freeformOk = false;
      try {
        await sendWhatsApp(to, confirmation);
        delivered.push({ kind: "confirmation", body: confirmation });
        await sendWhatsApp(to, reminder);
        delivered.push({ kind: "reminder", body: reminder });
        freeformOk = true;
      } catch {
        freeformOk = false;
      }

      if (!freeformOk) {
        // No open session — fall back to the approved template so something
        // still lands on the phone, and DISPLAY that same text to match.
        try {
          await sendWhatsAppTemplate(to);
          delivered.length = 0;
          delivered.push({ kind: "template", body: TEMPLATE_TEXT });
          status = "template";
          note =
            "Sent Twilio's approved reminder template. To receive the exact tailored message, reply once to the WhatsApp number to open a session.";
        } catch (e) {
          status = "error";
          note = e instanceof Error ? e.message : "WhatsApp send failed";
        }
      }
    }

    return NextResponse.json({ status, note, messages: delivered });
  } catch (error) {
    console.error("WhatsApp API error:", error);
    return NextResponse.json({ status: "error", messages: [] }, { status: 500 });
  }
}
