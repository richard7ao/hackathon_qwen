import OpenAI from "openai";

const SIE_BASE_URL = process.env.SIE_BASE_URL || "https://api.superlinked.com";
const SIE_API_KEY = process.env.SIE_API_KEY || "";

if (!SIE_API_KEY) {
  throw new Error("SIE_API_KEY is not set in environment");
}

export const sieClient = new OpenAI({
  apiKey: SIE_API_KEY,
  baseURL: `${SIE_BASE_URL}/v1`,
});

/**
 * Encode texts into dense embeddings using SIE.
 */
export async function encode(texts: string[]) {
  const response = await sieClient.embeddings.create({
    model: "Qwen/Qwen3-Embedding-4B",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

/**
 * Cosine similarity between two vectors.
 */
export function cosineSimilarity(a: number[], b: number[]) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Generate a chat completion via SIE (Qwen 3.5 4B for speed).
 */
export async function chatCompletion(messages: { role: "system" | "user" | "assistant"; content: string }[]) {
  const response = await sieClient.chat.completions.create({
    model: "Qwen/Qwen3.5-4B",
    messages,
    temperature: 0.7,
    max_tokens: 512,
  });

  return response.choices[0]?.message?.content || "";
}

/**
 * Parse structured JSON from model output safely.
 */
export function parseJson<T>(text: string): T | null {
  try {
    const cleaned = text.replace(/^```json\s*|\s*```$/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return null;
  }
}
