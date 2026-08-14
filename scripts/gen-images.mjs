// One-off image generator for the landing page using Alibaba Qwen-Image.
// Usage: node scripts/gen-images.mjs
import fs from "node:fs";
import path from "node:path";

const API_KEY = process.env.QWEN_API_KEY;
const DASHSCOPE =
  process.env.QWEN_DASHSCOPE_URL ||
  "https://ws-217y1bpliyzcf5nl.ap-southeast-1.maas.aliyuncs.com/api/v1";

if (!API_KEY) {
  console.error("QWEN_API_KEY not set");
  process.exit(1);
}

const OUT_DIR = path.join(process.cwd(), "public", "generated");
fs.mkdirSync(OUT_DIR, { recursive: true });

const STYLE =
  "Clean modern flat vector illustration, soft shadows, generous white background, " +
  "cohesive palette built around forest green (#2e7d5b) with warm sand accents, " +
  "friendly and trustworthy, no text, high detail, professional product marketing illustration.";

const images = [
  {
    name: "hero",
    size: "1328*1328",
    prompt:
      "Isometric illustration of a small friendly city block of apartment buildings, " +
      "a smartphone showing a chat conversation floating above, a calendar with a booked viewing, " +
      "and a phone-call icon connecting them. A happy young professional stands with a coffee. " +
      STYLE,
  },
  {
    name: "problem",
    size: "1328*1328",
    prompt:
      "Illustration of a stressed young professional at a desk overwhelmed by dozens of unread messages, " +
      "email envelopes, missed call bubbles, and sticky notes flying around, showing the pain of chasing landlords. " +
      STYLE,
  },
  {
    name: "voice",
    size: "1328*1328",
    prompt:
      "Illustration of an AI voice agent as a friendly glowing green sound-wave orb wearing a subtle headset, " +
      "making a phone call to a landlord, speech bubbles and a confirmed calendar viewing appearing. " +
      STYLE,
  },
];

async function generate({ name, prompt, size }) {
  console.log(`Generating ${name}…`);
  const res = await fetch(
    `${DASHSCOPE}/services/aigc/multimodal-generation/generation`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "qwen-image-3.0",
        input: { messages: [{ role: "user", content: [{ text: prompt }] }] },
        parameters: { size },
      }),
    },
  );

  if (!res.ok) {
    console.error(`  ${name} failed: ${res.status} ${await res.text()}`);
    return;
  }

  const data = await res.json();
  const url = data?.output?.choices?.[0]?.message?.content?.find((c) => c.image)?.image;
  if (!url) {
    console.error(`  ${name}: no image url. ${JSON.stringify(data).slice(0, 300)}`);
    return;
  }

  const img = await fetch(url);
  const buf = Buffer.from(await img.arrayBuffer());
  const out = path.join(OUT_DIR, `${name}.png`);
  fs.writeFileSync(out, buf);
  console.log(`  saved ${out} (${(buf.length / 1024).toFixed(0)} KB)`);
}

for (const img of images) {
  // eslint-disable-next-line no-await-in-loop
  await generate(img);
}

console.log("Done.");
