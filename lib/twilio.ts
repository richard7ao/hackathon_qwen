const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "";
// WhatsApp sender (the account's WhatsApp-enabled number).
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+447460041934";
// Approved WhatsApp content template (for business-initiated messages).
const TWILIO_WHATSAPP_CONTENT_SID = process.env.TWILIO_WHATSAPP_CONTENT_SID || "";

export function twilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}

async function postMessage(form: URLSearchParams): Promise<string> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio is not configured");
  }
  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");
  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Twilio WhatsApp failed: ${res.status} ${text}`);
  }
  const data = await res.json();
  return data.sid as string;
}

function toWhatsApp(to: string): string {
  return to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
}

/** Send the approved WhatsApp template (business-initiated, always allowed). */
export async function sendWhatsAppTemplate(to: string): Promise<string> {
  if (!TWILIO_WHATSAPP_CONTENT_SID) throw new Error("No WhatsApp content template configured");
  const form = new URLSearchParams({
    To: toWhatsApp(to),
    From: TWILIO_WHATSAPP_FROM,
    ContentSid: TWILIO_WHATSAPP_CONTENT_SID,
  });
  return postMessage(form);
}

/** Send a free-form WhatsApp message (only delivers inside an open 24h session). */
export async function sendWhatsApp(to: string, body: string): Promise<string> {
  const form = new URLSearchParams({ To: toWhatsApp(to), From: TWILIO_WHATSAPP_FROM, Body: body });
  return postMessage(form);
}

/**
 * Resolve the public base URL Twilio should hit for the TwiML webhook.
 * Prefers an explicit APP_BASE_URL, then Vercel's deployment URL.
 */
export function publicBaseUrl(): string {
  if (process.env.APP_BASE_URL) return process.env.APP_BASE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export interface PlaceCallParams {
  to: string;
  /** Public TwiML URL that Twilio will fetch to control the call. */
  twimlUrl: string;
}

/**
 * Place an outbound call via the Twilio REST API using a TwiML Url.
 * Trial accounts require Url (inline Twiml is disallowed on trial).
 * Returns the Twilio call SID on success.
 */
export async function placeCall({ to, twimlUrl }: PlaceCallParams): Promise<string> {
  if (!twilioConfigured()) {
    throw new Error("Twilio is not configured");
  }

  const body = new URLSearchParams({
    To: to,
    From: TWILIO_FROM_NUMBER,
    Url: twimlUrl,
  });

  const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64");

  const response = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Calls.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: body.toString(),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Twilio call failed: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.sid as string;
}
