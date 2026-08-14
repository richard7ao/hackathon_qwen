import { NextRequest, NextResponse } from "next/server";
import { Message, Outreach, Property } from "@/lib/types";
import { mockProperties } from "@/lib/mock-data";
import { chatCompletion, encode, cosineSimilarity, parseJson } from "@/lib/sie";

interface ExtractedPreferences {
  location?: string;
  budget?: number;
  bedrooms?: number;
  moveInDate?: string;
  mustHaves?: string[];
  isComplete?: boolean;
  nextQuestion?: string;
}

interface ChatResponse {
  reply: string;
  preferences: Record<string, string | number | string[]>;
  properties: Property[];
  outreach: Outreach[];
  suggestions: string[];
  complete: boolean;
}

const SYSTEM_PROMPT = `You are RentalFinder AI, a friendly rental assistant. Your job is to interview the user and collect exactly these fields:
- location (city/neighborhood)
- budget (monthly rent in USD, as a number)
- bedrooms (number)
- moveInDate (free-text date like "Sep 1")
- mustHaves (array of strings, e.g. ["pet-friendly", "parking"])

Conversation flow:
1. Start by asking for location.
2. After each answer, acknowledge warmly and ask for the next missing field in this order: budget, bedrooms, moveInDate, mustHaves.
3. When all fields are collected, set isComplete=true and say you are finding matches and reaching out to landlords.

Rules:
- Be concise, friendly, and trustworthy.
- Never ask for more than one thing at a time.
- Infer reasonable values from the user's message when possible.
- Return ONLY a JSON object with keys: location, budget, bedrooms, moveInDate, mustHaves, isComplete, nextQuestion.
- If a field is unknown, omit it or set to null. mustHaves should be an array.
- nextQuestion is the question you will ask the user next (or an empty string if isComplete=true).`;

function getCombinedPreferenceText(prefs: ExtractedPreferences) {
  const parts = [
    prefs.location ? `Location: ${prefs.location}` : "",
    prefs.budget ? `Budget: $${prefs.budget}` : "",
    prefs.bedrooms ? `Bedrooms: ${prefs.bedrooms}` : "",
    prefs.moveInDate ? `Move-in: ${prefs.moveInDate}` : "",
    prefs.mustHaves?.length ? `Must-haves: ${prefs.mustHaves.join(", ")}` : "",
  ];
  return parts.filter(Boolean).join(". ");
}

async function findMatches(prefs: ExtractedPreferences): Promise<Property[]> {
  if (!prefs.location || !prefs.budget || !prefs.bedrooms) {
    return [];
  }

  try {
    const userText = getCombinedPreferenceText(prefs);
    const propertyTexts = mockProperties.map(
      (p) => `${p.title}. ${p.address}. $${p.price} per month. ${p.bedrooms} bed, ${p.bathrooms} bath. Available ${p.availableFrom}.`,
    );

    const allEmbeddings = await encode([userText, ...propertyTexts]);
    const userVector = allEmbeddings[0];
    const propertyVectors = allEmbeddings.slice(1);

    const scored = mockProperties.map((property, index) => ({
      property,
      score: cosineSimilarity(userVector, propertyVectors[index]),
    }));

    // Also enforce hard constraints.
    const filtered = scored
      .filter(({ property }) => property.price <= prefs.budget! * 1.15 && property.bedrooms >= prefs.bedrooms!)
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ property }) => property);

    return filtered;
  } catch (error) {
    // Fall back to rule-based matching if SIE embeddings fail.
    return mockProperties
      .filter((p) => p.price <= (prefs.budget || 99999) * 1.15 && p.bedrooms >= (prefs.bedrooms || 1))
      .slice(0, 3);
  }
}

function buildOutreach(properties: Property[]): Outreach[] {
  const viewingTime = new Date();
  viewingTime.setDate(viewingTime.getDate() + 2);
  viewingTime.setHours(14, 0, 0, 0);

  return properties.slice(0, 2).map((p, i) => ({
    id: `o${i + 1}`,
    propertyId: p.id,
    propertyTitle: p.title,
    channel: i === 0 ? "voice" : "email",
    status: i === 0 ? "confirmed" : "sent",
    scheduledAt: i === 0 ? viewingTime.toISOString() : undefined,
  }));
}

export async function POST(req: NextRequest) {
  try {
    const { message, history }: { message: string; history: Message[] } = await req.json();

    const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
      { role: "system", content: SYSTEM_PROMPT },
    ];

    for (const msg of history) {
      chatMessages.push({
        role: msg.role === "bot" ? "assistant" : "user",
        content: msg.text,
      });
    }

    chatMessages.push({ role: "user", content: message });

    const raw = await chatCompletion(chatMessages);
    const parsed = parseJson<ExtractedPreferences>(raw);

    if (!parsed) {
      // If the model returns malformed JSON, fall back to a generic response.
      return NextResponse.json<ChatResponse>({
        reply: "Got it. Can you tell me which city or neighborhood you’re looking in?",
        preferences: {},
        properties: [],
        outreach: [],
        suggestions: ["San Francisco", "New York", "Austin"],
        complete: false,
      });
    }

    const preferences: Record<string, string | number | string[]> = {};
    if (parsed.location) preferences.location = parsed.location;
    if (parsed.budget) preferences.budget = parsed.budget;
    if (parsed.bedrooms) preferences.bedrooms = parsed.bedrooms;
    if (parsed.moveInDate) preferences.moveInDate = parsed.moveInDate;
    if (parsed.mustHaves && parsed.mustHaves.length > 0) preferences.mustHaves = parsed.mustHaves;

    let properties: Property[] = [];
    let outreach: Outreach[] = [];
    let suggestions: string[] = [];
    let complete = false;
    let reply = parsed.nextQuestion || "Got it. What's next?";

    if (parsed.isComplete) {
      properties = await findMatches(parsed);

      if (properties.length > 0) {
        reply = `I found ${properties.length} places that look like a fit. I’m reaching out to the landlords now to book viewings — you’ll see the status update live on the dashboard.`;
        outreach = buildOutreach(properties);
        complete = true;
      } else {
        reply = "I didn’t find any matches with those criteria. Try raising your budget or reducing bedrooms?";
        suggestions = ["Raise budget", "Fewer bedrooms", "Different location"];
      }
    } else {
      // Provide quick-reply chips for common values based on the next question.
      const q = (parsed.nextQuestion || "").toLowerCase();
      if (q.includes("bedroom")) suggestions = ["1", "2", "3+"];
      if (q.includes("budget")) suggestions = ["$2,500", "$3,000", "$3,500", "$4,000"];
      if (q.includes("location")) suggestions = ["San Francisco", "New York", "Austin"];
      if (q.includes("date")) suggestions = ["ASAP", "Sep 1", "Oct 1"];
    }

    return NextResponse.json<ChatResponse>({
      reply,
      preferences,
      properties,
      outreach,
      suggestions,
      complete,
    });
  } catch (error) {
    console.error("Chat API error:", error);
    return NextResponse.json<ChatResponse>({
      reply: "Sorry, I hit a snag. Can you try that again?",
      preferences: {},
      properties: [],
      outreach: [],
      suggestions: [],
      complete: false,
    });
  }
}
