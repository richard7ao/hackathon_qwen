const DASHSCOPE_URL =
  process.env.QWEN_DASHSCOPE_URL ||
  "https://ws-217y1bpliyzcf5nl.ap-southeast-1.maas.aliyuncs.com/api/v1";
const QWEN_API_KEY = process.env.QWEN_API_KEY || "";

export interface TTSResult {
  audioUrl: string;
  expiresAt: number;
}

/**
 * Generate speech with Qwen3-TTS via the Alibaba Model Studio DashScope endpoint.
 * Returns a temporary audio URL (valid ~24h).
 */
export async function synthesizeSpeech(
  text: string,
  voice = "Cherry",
  languageType = "English",
): Promise<TTSResult> {
  if (!QWEN_API_KEY) {
    throw new Error("QWEN_API_KEY is not set");
  }

  const response = await fetch(
    `${DASHSCOPE_URL}/services/aigc/multimodal-generation/generation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${QWEN_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen3-tts-flash",
        input: { text, voice, language_type: languageType },
      }),
    },
  );

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Qwen3-TTS failed: ${response.status} ${body}`);
  }

  const data = await response.json();
  const audio = data?.output?.audio;
  if (!audio?.url) {
    throw new Error(`Qwen3-TTS returned no audio URL: ${JSON.stringify(data)}`);
  }

  return { audioUrl: audio.url, expiresAt: audio.expires_at };
}

export interface CallLine {
  speaker: "agent" | "landlord";
  text: string;
}

/**
 * Build a realistic landlord call script for the voice agent.
 */
export function buildCallScript(params: {
  renterName: string;
  propertyTitle: string;
  address: string;
  moveInDate?: string;
}): { spoken: string; transcript: CallLine[] } {
  const { renterName, propertyTitle, address, moveInDate } = params;

  const transcript: CallLine[] = [
    {
      speaker: "landlord",
      text: "Hello?",
    },
    {
      speaker: "agent",
      text: `Hi there, this is Ava calling from RentalFinder AI on behalf of ${renterName}. I'm reaching out about your listing, ${propertyTitle} on ${address}.`,
    },
    {
      speaker: "landlord",
      text: "Oh yes, it's still available.",
    },
    {
      speaker: "agent",
      text: `Wonderful. ${renterName} is very interested${moveInDate ? ` and hoping to move in around ${moveInDate}` : ""}. Could we book a viewing this week? They're flexible on timing.`,
    },
    {
      speaker: "landlord",
      text: "Saturday at 2 PM works for me.",
    },
    {
      speaker: "agent",
      text: "Saturday at 2 PM is perfect. I'll confirm that with them right now and send you a calendar invite. Thank you so much for your time — have a great day!",
    },
  ];

  // The agent's spoken lines, stitched into one utterance for TTS.
  const spoken = transcript
    .filter((line) => line.speaker === "agent")
    .map((line) => line.text)
    .join(" ");

  return { spoken, transcript };
}
