import { NextRequest, NextResponse } from "next/server";

/**
 * Azure Neural TTS proxy
 *
 * Env vars required (set in Vercel or .env.local):
 *   AZURE_SPEECH_KEY    — your Azure Speech resource key
 *   AZURE_SPEECH_REGION — e.g. "eastus" or "westeurope"
 *
 * POST /api/tts
 * Body: { text, lang, voice, rate, pitch }
 * Returns: audio/mpeg stream
 */

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION ?? "eastus";

export async function POST(req: NextRequest) {
  if (!AZURE_KEY) {
    return NextResponse.json({ error: "Azure TTS not configured" }, { status: 503 });
  }

  const { text, voice, rate = 0.9, pitch = 1.1 } = await req.json() as {
    text: string;
    lang: string;
    voice: string;
    rate?: number;
    pitch?: number;
  };

  if (!text || !voice) {
    return NextResponse.json({ error: "Missing text or voice" }, { status: 400 });
  }

  // Build SSML — Azure Neural TTS uses SSML for fine-grained control
  const ratePercent = Math.round((rate - 1) * 100); // 0.9 → -10%
  const pitchPercent = Math.round((pitch - 1) * 100); // 1.1 → +10%
  const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
  const pitchStr = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="he-IL">
    <voice name="${voice}">
      <prosody rate="${rateStr}" pitch="${pitchStr}">${escapeXml(text)}</prosody>
    </voice>
  </speak>`;

  const azureUrl = `https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`;

  const azureRes = await fetch(azureUrl, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "kids-play-platform",
    },
    body: ssml,
  });

  if (!azureRes.ok) {
    const errText = await azureRes.text();
    console.error("Azure TTS error:", azureRes.status, errText);
    return NextResponse.json({ error: "Azure TTS failed" }, { status: 502 });
  }

  const audioBuffer = await azureRes.arrayBuffer();

  return new NextResponse(audioBuffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400", // cache audio for 24h
    },
  });
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
