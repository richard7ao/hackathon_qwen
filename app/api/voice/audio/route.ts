import { NextRequest } from "next/server";

/**
 * Proxy + repair the Qwen3-TTS WAV so Twilio can play it.
 * Qwen streams the WAV with placeholder RIFF/data chunk sizes, which Twilio's
 * player rejects. We fetch the bytes, rewrite the size fields to the real
 * lengths, and serve as clean audio/wav over https.
 */
export async function GET(req: NextRequest) {
  const src = new URL(req.url).searchParams.get("src");
  if (!src) return new Response("missing src", { status: 400 });

  const upstream = await fetch(src);
  if (!upstream.ok) {
    return new Response(`upstream ${upstream.status}`, { status: 502 });
  }

  const buf = Buffer.from(await upstream.arrayBuffer());

  // Only patch if it's a RIFF/WAVE file.
  if (buf.length > 44 && buf.toString("ascii", 0, 4) === "RIFF") {
    // RIFF chunk size = total file length - 8.
    buf.writeUInt32LE(buf.length - 8, 4);

    // Find the "data" subchunk and set its size to the remaining bytes.
    let offset = 12;
    while (offset + 8 <= buf.length) {
      const chunkId = buf.toString("ascii", offset, offset + 4);
      const chunkSize = buf.readUInt32LE(offset + 4);
      if (chunkId === "data") {
        const realDataSize = buf.length - (offset + 8);
        buf.writeUInt32LE(realDataSize, offset + 4);
        break;
      }
      // Advance past this chunk (guard against bogus sizes).
      const advance = chunkSize > 0 && chunkSize < buf.length ? chunkSize : 0;
      offset += 8 + advance;
      if (advance === 0) break;
    }
  }

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": "audio/wav",
      "Content-Length": String(buf.length),
      "Cache-Control": "no-store",
    },
  });
}
