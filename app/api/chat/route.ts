import { NextRequest, NextResponse } from "next/server";
import { Message, Outreach, Property } from "@/lib/types";
import { properties as mockProperties } from "@/lib/listings";
import { chatCompletion, encode, cosineSimilarity, parseJson } from "@/lib/sie";

interface ExtractedPreferences {
  location?: string;
  budget?: number;
  bedrooms?: number;
  moveInDate?: string;
  mustHaves?: string[];
  isComplete?: boolean;
  reply?: string;
}

interface ChatResponse {
  reply: string;
  preferences: Record<string, string | number | string[]>;
  properties: Property[];
  outreach: Outreach[];
  suggestions: string[];
  complete: boolean;
}

const SYSTEM_PROMPT = `You are RentalFinder AI, a warm, natural rental assistant chatting with someone looking for a flat in London. Talk like a real person — vary your wording, react to what they say, and be genuinely helpful. This is a conversation, not a form.

Across the chat, gather these fields when they come up naturally:
- location (area/neighbourhood)
- budget (monthly rent in GBP £, a number)
- bedrooms (a number; a studio = 0)
- moveInDate (free text like "ASAP" or "Sep 1")
- mustHaves (array of strings, e.g. ["pet-friendly","parking","balcony"]) — optional

Behaviour:
- React to the specifics they mention (e.g. if they say "somewhere lively" or "near the tube", acknowledge it).
- Ask for at most one missing thing at a time, conversationally — don't interrogate.
- Infer values when obvious (e.g. "around 2k" → budget 2000; "one bed" → bedrooms 1).
- Once you have at least location, budget and bedrooms, set isComplete=true and say you're searching now.

Return ONLY a JSON object with keys: location, budget, bedrooms, moveInDate, mustHaves, isComplete, reply.
- "reply" is your natural conversational message to show the user (1-2 sentences, friendly, specific to what they said).
- Omit or null any field you don't know yet. mustHaves must be an array.`;

function getCombinedPreferenceText(prefs: ExtractedPreferences) {
  const parts = [
    prefs.location ? `Location: ${prefs.location}` : "",
    prefs.budget ? `Budget: £${prefs.budget}` : "",
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
      (p) => `${p.title}. ${p.address}. £${p.price} per month. ${p.bedrooms} bed, ${p.bathrooms} bath. ${p.propertyType || ""}. Available ${p.availableFrom}.`,
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
        reply: "Got it. Which area of London are you looking in?",
        preferences: {},
        properties: [],
        outreach: [],
        suggestions: ["Hackney, London", "Islington, London", "Camden, London", "Southwark, London"],
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
    let reply = parsed.reply || "Tell me a bit more about what you're after.";

    const hasCore = Boolean(parsed.location && parsed.budget && parsed.bedrooms);

    if (parsed.isComplete && hasCore) {
      properties = await findMatches(parsed);

      if (properties.length > 0) {
        reply =
          parsed.reply ||
          `I found ${properties.length} places that look like a fit — take a look in Viewed properties.`;
        outreach = buildOutreach(properties);
        complete = true;
      } else {
        reply =
          "I couldn't find matches with those exact criteria — want to raise the budget a touch or try a nearby area?";
        suggestions = ["Raise budget", "Fewer bedrooms", "Different area"];
      }
    } else {
      // Offer quick-reply chips for whichever core field is still missing.
      if (!parsed.location) suggestions = ["Hackney, London", "Islington, London", "Camden, London", "Southwark, London"];
      else if (!parsed.budget) suggestions = ["£1,500", "£2,000", "£2,500", "£3,000"];
      else if (parsed.bedrooms === undefined || parsed.bedrooms === null) suggestions = ["Studio", "1", "2", "3+"];
      else if (!parsed.moveInDate) suggestions = ["ASAP", "Sep 1", "Oct 1"];
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
