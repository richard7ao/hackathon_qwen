import { NextRequest, NextResponse } from "next/server";
import { sieClient } from "@/lib/sie";
import { synthesizeSpeech } from "@/lib/voice";

interface Turn {
  role: "user" | "assistant";
  content: string;
}

const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

function nextDateForWeekday(weekday?: string | null): string | null {
  if (!weekday) return null;
  const target = WEEKDAYS.indexOf(weekday.trim().toLowerCase());
  if (target < 0) return null;
  const d = new Date();
  let ahead = (target - d.getDay() + 7) % 7;
  if (ahead === 0) ahead = 7;
  d.setDate(d.getDate() + ahead);
  d.setHours(14, 0, 0, 0);
  return d.toISOString();
}

const TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "book_viewing",
      description:
        "Call this ONLY once the landlord has clearly agreed to a specific day and time for the viewing. Records the agreed slot and ends the call.",
      parameters: {
        type: "object",
        properties: {
          weekday: { type: "string", description: "Day of week agreed, e.g. 'Sunday'" },
          time: { type: "string", description: "Time agreed, e.g. '10:00 AM'" },
        },
        required: ["weekday", "time"],
      },
    },
  },
];

/**
 * Interactive voice call, tool-driven: Ava (AI) calls the landlord. While
 * negotiating she replies with speech; when a slot is agreed she emits a
 * `book_viewing` tool call carrying the date/time (used for WhatsApp + calendar).
 */
export async function POST(req: NextRequest) {
  try {
    const {
      history,
      property,
      renterName,
    }: { history: Turn[]; property?: { title?: string; address?: string }; renterName?: string } =
      await req.json();

    const title = property?.title || "the property";
    const address = property?.address || "the listed address";
    const renter = renterName || "my client";

    const system = `You are Ava, a friendly AI booking assistant for RentalFinder, phoning a LANDLORD to arrange a viewing of "${title}" at ${address} on behalf of a tenant called ${renter}. The person you speak to IS the landlord.
- Speak naturally and briefly (1-2 sentences), like a real phone call. You are the CALLER.
- If the call is just starting, introduce yourself, mention the property and ${renter}, and ask if it's still available.
- Work towards agreeing a specific viewing day and time. Propose a slot (e.g. "would Saturday at 2pm suit you?").
- As soon as the landlord agrees a concrete day AND time, call the book_viewing tool with that day and time. Do not keep chatting after they agree.
- Do not use emojis or markdown.`;

    const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: system },
    ];
    for (const t of history || []) messages.push({ role: t.role, content: t.content });
    if (!history || history.length === 0) {
      messages.push({ role: "user", content: "(call connected)" });
    }

    const completion = await sieClient.chat.completions.create({
      model: "Qwen/Qwen3.5-4B",
      messages,
      tools: TOOLS,
      tool_choice: "auto",
      temperature: 0.6,
      max_tokens: 300,
    });

    const msg = completion.choices[0]?.message;
    const toolCall = msg?.tool_calls?.[0];

    let reply = msg?.content?.trim() || "";
    let booking: { weekday: string; time: string; date: string | null } | null = null;

    // Guard against premature booking: only honour book_viewing if an actual
    // time was discussed in the conversation (Qwen-4B can call it too eagerly).
    const convoText = (history || []).map((t) => t.content).join(" ").toLowerCase();
    const hasTime = /(\d{1,2}\s*(am|pm)|\d{1,2}:\d{2}|noon|o'?clock|midday)/.test(convoText);

    if (toolCall && toolCall.type === "function" && toolCall.function?.name === "book_viewing" && hasTime) {
      let args: { weekday?: string; time?: string } = {};
      try {
        args = JSON.parse(toolCall.function.arguments || "{}");
      } catch {
        args = {};
      }
      const weekday = args.weekday || "Saturday";
      const time = args.time || "2:00 PM";
      booking = { weekday, time, date: nextDateForWeekday(weekday) };
      // Craft the spoken closing line for the tool result.
      reply = `Brilliant — that's the viewing booked for ${weekday} at ${time}. I'll confirm with ${renter} and send everything over now. Thanks so much for your time!`;
    } else if (toolCall && !reply) {
      // Model tried to book without a real time — steer back to proposing one.
      reply = "Great! When would suit you for a viewing? I could do this Saturday at 2pm, or whatever works for you.";
    }

    if (!reply) reply = "Sorry, could you say that again?";

    let audioUrl: string | undefined;
    try {
      const tts = await synthesizeSpeech(reply, "Cherry", "English");
      audioUrl = `/api/voice/audio?src=${encodeURIComponent(tts.audioUrl)}`;
    } catch {
      audioUrl = undefined;
    }

    return NextResponse.json({ reply, audioUrl, booking });
  } catch (error) {
    console.error("voice-chat error:", error);
    return NextResponse.json({ reply: "Sorry, the line dropped. Could you say that again?", booking: null }, { status: 200 });
  }
}
