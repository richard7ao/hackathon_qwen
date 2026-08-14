import { NextRequest, NextResponse } from "next/server";
import { Message, Outreach } from "@/lib/types";
import { mockProperties } from "@/lib/mock-data";

const questions = [
  { key: "location", question: "Great! What's your budget per month?", parser: (msg: string) => msg.trim() },
  { key: "budget", question: "How many bedrooms do you need?", parser: (msg: string) => Number.parseInt(msg.replace(/\D/g, ""), 10) || 0 },
  { key: "bedrooms", question: "When do you need to move in? (e.g. Sep 1)", parser: (msg: string) => msg.trim() },
  { key: "moveInDate", question: "Any must-haves? (e.g. pet-friendly, parking, balcony)", parser: (msg: string) => msg.split(",").map((s) => s.trim()).filter(Boolean) },
];

function inferStep(history: Message[]): number {
  const answered = history.filter((m) => m.role === "user").length;
  return Math.min(answered, questions.length);
}

function findMatches(budget: number, bedrooms: number) {
  return mockProperties
    .filter((p) => p.price <= budget * 1.2 && p.bedrooms >= bedrooms)
    .sort((a, b) => a.price - b.price)
    .slice(0, 3);
}

export async function POST(req: NextRequest) {
  const { message, history }: { message: string; history: Message[] } = await req.json();

  const step = inferStep(history);
  const preferences: Record<string, string | number | string[]> = {};

  // Build preferences from prior answers.
  const userMessages = history.filter((m) => m.role === "user").map((m) => m.text);
  ["location", "budget", "bedrooms", "moveInDate", "mustHaves"].forEach((key, i) => {
    if (userMessages[i]) {
      if (key === "budget" || key === "bedrooms") {
        preferences[key] = Number.parseInt(userMessages[i].replace(/\D/g, ""), 10) || 0;
      } else if (key === "mustHaves") {
        preferences[key] = userMessages[i].split(",").map((s) => s.trim()).filter(Boolean);
      } else {
        preferences[key] = userMessages[i];
      }
    }
  });

  let reply = "";
  let properties: typeof mockProperties = [];
  let outreach: Outreach[] = [];
  let suggestions: string[] = [];
  let complete = false;

  if (step < questions.length) {
    const currentQuestion = questions[step];
    reply = currentQuestion.question;
    if (currentQuestion.key === "bedrooms") {
      suggestions = ["1", "2", "3+"];
    }
  } else {
    // Final recommendation + outreach.
    const budget = Number(preferences.budget) || 3500;
    const bedrooms = Number(preferences.bedrooms) || 1;
    properties = findMatches(budget, bedrooms);

    if (properties.length > 0) {
      reply = `I found ${properties.length} places that look like a fit. I’m reaching out to the landlords now to book viewings — you’ll see the status update live on the dashboard.`;

      const viewingTime = new Date();
      viewingTime.setDate(viewingTime.getDate() + 2);
      viewingTime.setHours(14, 0, 0, 0);

      outreach = properties.slice(0, 2).map((p, i) => ({
        id: `o${i + 1}`,
        propertyId: p.id,
        propertyTitle: p.title,
        channel: i === 0 ? "voice" : "email",
        status: i === 0 ? "confirmed" : "pending",
        scheduledAt: i === 0 ? viewingTime.toISOString() : undefined,
      }));

      if (outreach.length > 1) {
        outreach[1].status = "sent";
      }

      complete = true;
    } else {
      reply = "I didn’t find any matches with those criteria. Try raising your budget or reducing bedrooms?";
      suggestions = ["Raise budget", "Fewer bedrooms", "Different location"];
    }
  }

  return NextResponse.json({ reply, preferences, properties, outreach, suggestions, complete });
}
