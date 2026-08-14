const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM_NUMBER = process.env.TWILIO_FROM_NUMBER || "";
// Twilio WhatsApp sandbox sender by default.
const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || "whatsapp:+14155238886";

export function twilioConfigured(): boolean {
  return Boolean(TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN && TWILIO_FROM_NUMBER);
}

/**
 * Send a WhatsApp message via the Twilio Messages API (sandbox on trial).
 * The recipient must have joined the sandbox first. Returns the message SID.
 */
export async function sendWhatsApp(to: string, body: string): Promise<string> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
    throw new Error("Twilio is not configured");
  }
  const toWa = to.startsWith("whatsapp:") ? to : `whatsapp:${to}`;
  const form = new URLSearchParams({ To: toWa, From: TWILIO_WHATSAPP_FROM, Body: body });
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
