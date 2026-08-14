import { NextRequest, NextResponse } from "next/server";

const DASHSCOPE =
  process.env.QWEN_DASHSCOPE_URL ||
  "https://ws-217y1bpliyzcf5nl.ap-southeast-1.maas.aliyuncs.com/api/v1";
const KEY = process.env.QWEN_API_KEY || "";

/**
 * Speech-to-text via Qwen3-ASR (Alibaba). Accepts a base64 WAV data URI from
 * the browser mic and returns the transcript.
 */
export async function POST(req: NextRequest) {
  try {
    const { audio }: { audio?: string } = await req.json();
    if (!audio) return NextResponse.json({ text: "" });
    if (!KEY) return NextResponse.json({ text: "" });

    const res = await fetch(`${DASHSCOPE}/services/aigc/multimodal-generation/generation`, {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "qwen3-asr-flash",
        input: { messages: [{ role: "user", content: [{ audio }] }] },
      }),
    });

    if (!res.ok) {
      return NextResponse.json({ text: "" });
    }
    const data = await res.json();
    const text =
      data?.output?.choices?.[0]?.message?.content?.find((c: { text?: string }) => c.text)?.text || "";
    return NextResponse.json({ text });
  } catch (error) {
    console.error("ASR error:", error);
    return NextResponse.json({ text: "" }, { status: 200 });
  }
}
