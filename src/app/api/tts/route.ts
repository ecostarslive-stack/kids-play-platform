import { NextRequest, NextResponse } from "next/server";

const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
const AZURE_REGION = process.env.AZURE_SPEECH_REGION ?? "eastus";
const GOOGLE_KEY = process.env.GOOGLE_TTS_API_KEY;

export async function POST(req: NextRequest) {
  const { provider = "azure", text, lang, voice, rate = 0.9, pitch = 1.1 } = await req.json() as {
    provider?: string;
    text: string;
    lang: string;
    voice: string;
    rate?: number;
    pitch?: number;
  };

  if (!text || !voice) {
    return NextResponse.json({ error: "Missing text or voice" }, { status: 400 });
  }

  if (provider === "google") {
    if (!GOOGLE_KEY) return NextResponse.json({ error: "Google TTS not configured" }, { status: 503 });
    return googleTTS(text, lang, voice, rate, pitch);
  }

  // Azure
  if (!AZURE_KEY) return NextResponse.json({ error: "Azure TTS not configured" }, { status: 503 });
  return azureTTS(text, voice, rate, pitch);
}

async function googleTTS(text: string, lang: string, voice: string, rate: number, pitch: number): Promise<NextResponse> {
  const url = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${GOOGLE_KEY}`;
  // Google pitch: semitones, range -20 to 20. Convert from 0.5-2.0 scale: (pitch-1)*10
  const pitchSemitones = Math.max(-20, Math.min(20, (pitch - 1) * 10));
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      input: { text },
      voice: { languageCode: lang, name: voice },
      audioConfig: {
        audioEncoding: "MP3",
        speakingRate: rate,
        pitch: pitchSemitones,
      },
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Google TTS error:", res.status, err);
    return NextResponse.json({ error: "Google TTS failed" }, { status: 502 });
  }

  const { audioContent } = await res.json() as { audioContent: string };
  const buffer = Buffer.from(audioContent, "base64");

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": "public, max-age=86400",
    },
  });
}

async function azureTTS(text: string, voice: string, rate: number, pitch: number): Promise<NextResponse> {
  const ratePercent = Math.round((rate - 1) * 100);
  const pitchPercent = Math.round((pitch - 1) * 100);
  const rateStr = ratePercent >= 0 ? `+${ratePercent}%` : `${ratePercent}%`;
  const pitchStr = pitchPercent >= 0 ? `+${pitchPercent}%` : `${pitchPercent}%`;

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="he-IL">
    <voice name="${voice}">
      <prosody rate="${rateStr}" pitch="${pitchStr}">${escapeXml(text)}</prosody>
    </voice>
  </speak>`;

  const azureRes = await fetch(`https://${AZURE_REGION}.tts.speech.microsoft.com/cognitiveservices/v1`, {
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": AZURE_KEY!,
      "Content-Type": "application/ssml+xml",
      "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
      "User-Agent": "kids-play-platform",
    },
    body: ssml,
  });

  if (!azureRes.ok) {
    return NextResponse.json({ error: "Azure TTS failed" }, { status: 502 });
  }

  return new NextResponse(await azureRes.arrayBuffer(), {
    headers: { "Content-Type": "audio/mpeg", "Cache-Control": "public, max-age=86400" },
  });
}

function escapeXml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}
