import { NextRequest, NextResponse } from "next/server";
import { chatCompletion, parseJson } from "@/lib/sie";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

interface Extracted {
  weekday?: string | null; // e.g. "Sunday"
  time?: string | null; // e.g. "10:00 AM"
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

/** Next future date (ISO) matching a weekday name; null if unknown. */
function nextDateForWeekday(weekday?: string | null): string | null {
  if (!weekday) return null;
  const target = WEEKDAYS.indexOf(weekday.trim().toLowerCase());
  if (target < 0) return null;
  const d = new Date();
  const today = d.getDay();
  let ahead = (target - today + 7) % 7;
  if (ahead === 0) ahead = 7; // always a future date
  d.setDate(d.getDate() + ahead);
  d.setHours(14, 0, 0, 0);
  return d.toISOString();
}

/**
 * Read the call transcript and extract the viewing day/time both sides agreed on.
 */
export async function POST(req: NextRequest) {
  try {
    const { history }: { history: Turn[] } = await req.json();

    const convo = (history || [])
      .map((t) => `${t.role === "assistant" ? "Ava" : "Landlord"}: ${t.content}`)
      .join("\n");

    const prompt = `From this phone call between Ava (a rental booking agent) and a landlord, extract the viewing appointment they agreed on.
Return ONLY JSON: {"weekday": "<day name or null>", "time": "<time like '10:00 AM' or null>"}.
If no specific day/time was agreed, use null.

Transcript:
${convo}`;

    const raw = await chatCompletion([{ role: "user", content: prompt }]);
    const parsed = parseJson<Extracted>(raw) || {};

    const date = nextDateForWeekday(parsed.weekday);
    const time = parsed.time && parsed.time.trim() ? parsed.time.trim() : null;

    return NextResponse.json({ weekday: parsed.weekday || null, date, time });
  } catch (error) {
    console.error("extract-viewing error:", error);
    return NextResponse.json({ weekday: null, date: null, time: null }, { status: 200 });
  }
}
