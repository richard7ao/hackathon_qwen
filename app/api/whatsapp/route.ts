import { NextRequest, NextResponse } from "next/server";
import { sendSmsTemplate, sendWhatsAppTemplate, sendWhatsApp } from "@/lib/twilio";

/**
 * Notify the renter about a booked viewing via SMS + WhatsApp.
 *
 * On a Twilio TRIAL account, both channels can only deliver a predefined
 * template (fixed text). We send those and return the ACTUAL delivered body so
 * the browser shows exactly what the phone received (consistent). If the account
 * is upgraded, free-form with the real date/time is attempted first.
 */
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
    const customBody = `RentalFinder AI: Your viewing at ${propertyTitle || "the property"} is booked for ${when} at ${time || "2:00 PM"}. Address: ${address || ""}.`;

    const messages: { channel: string; body: string; delivered: boolean }[] = [];

    if (!to) {
      return NextResponse.json({ status: "unconfigured", messages: [] });
    }

    // --- SMS --- (trial: predefined template only; renders fixed reminder text)
    try {
      const sms = await sendSmsTemplate(to);
      messages.push({ channel: "SMS", body: sms.body || customBody, delivered: true });
    } catch {
      messages.push({ channel: "SMS", body: customBody, delivered: false });
    }

    // --- WhatsApp ---
    let waDelivered = false;
    // Try free-form (correct text) first — works inside a 24h session / upgraded account.
    try {
      const wa = await sendWhatsApp(to, customBody);
      messages.push({ channel: "WhatsApp", body: wa.body || customBody, delivered: true });
      waDelivered = true;
    } catch {
      // Fall back to the approved template (fixed text) so it still arrives.
      try {
        const wa = await sendWhatsAppTemplate(to);
        messages.push({ channel: "WhatsApp", body: wa.body || customBody, delivered: true });
        waDelivered = true;
      } catch {
        messages.push({ channel: "WhatsApp", body: customBody, delivered: false });
      }
    }

    const anyDelivered = messages.some((m) => m.delivered);
    const note = anyDelivered
      ? "Trial account: carriers deliver a fixed reminder template. Upgrade Twilio to send the exact date/time."
      : "Couldn't reach the phone — showing the message here instead.";

    return NextResponse.json({
      status: anyDelivered ? "sent" : "error",
      note,
      whatsappDelivered: waDelivered,
      messages,
    });
  } catch (error) {
    console.error("notify error:", error);
    return NextResponse.json({ status: "error", messages: [] }, { status: 500 });
  }
}
