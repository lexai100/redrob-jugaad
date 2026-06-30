import { NextResponse } from 'next/server';

// Uses Gemini Flash free tier (15 req/min) for visual proctoring audit
// Falls back gracefully if GEMINI_API_KEY is not set
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

export async function POST(req: Request) {
  try {
    const { imageBase64 } = await req.json();
    if (!imageBase64) return NextResponse.json({ suspicious: false, reason: 'No image' });

    // Graceful fallback: if no Gemini key, skip silently
    if (!GEMINI_API_KEY) {
      return NextResponse.json({ suspicious: false, reason: 'Gemini API not configured — MediaPipe only mode' });
    }

    const payload = {
      contents: [{
        parts: [
          {
            text: `You are an AI exam proctor. Look at this webcam screenshot of a student taking an online assessment.

Answer ONLY with a JSON object in this exact format:
{"suspicious": true/false, "reason": "<15 words max explaining what you see>", "confidence": "high/medium/low"}

Flag as suspicious (suspicious: true) ONLY if you can clearly see:
- A mobile phone being held or visible below/beside the face
- Physical notes, papers, or a notebook being referenced
- Another person visible in the frame
- The student is clearly not looking at the screen and appears to be reading something

Do NOT flag for:
- Normal typing posture (head slightly down, eyes on keyboard)
- Brief glances away
- Adjusting seating position
- Normal blinking or eye movement

Be conservative — false positives are more harmful than false negatives.`
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageBase64,
            }
          }
        ]
      }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 100,
        responseMimeType: 'application/json',
      }
    };

    const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error('Gemini error:', res.status, await res.text());
      return NextResponse.json({ suspicious: false, reason: 'Gemini API error' });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    const result = JSON.parse(text);

    return NextResponse.json({
      suspicious: result.suspicious === true,
      reason: result.reason || 'No issues detected',
      confidence: result.confidence || 'low',
    });

  } catch (err: any) {
    console.error('Proctor snapshot error:', err);
    // Always fail open — don't block students if API fails
    return NextResponse.json({ suspicious: false, reason: 'API error — skipping audit' });
  }
}
