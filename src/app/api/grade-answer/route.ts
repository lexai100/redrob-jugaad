import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const { question, rubric, answer, maxMarks, track } = await req.json();

    if (!answer || answer.trim().length < 10) {
      return NextResponse.json({ error: 'Answer too short' }, { status: 400 });
    }

    const prompt = `You are an expert ${track || 'technical'} assessor AND an AI-writing detection specialist for a hiring platform. Grade the student answer AND assess whether it was written by an AI.

QUESTION:
${question}

GRADING RUBRIC (total: ${maxMarks} marks):
${rubric}

STUDENT'S ANSWER:
${answer}

Respond ONLY with a valid JSON object in this exact format:
{
  "totalScore": <number, 0 to ${maxMarks}>,
  "breakdown": [
    { "criterion": "<criterion name>", "maxMarks": <number>, "awarded": <number>, "feedback": "<brief feedback>" }
  ],
  "overallFeedback": "<2-3 sentences of constructive feedback>",
  "aiLikelihood": <number 0-100, probability this was AI-generated — be STRICT and ACCURATE>,
  "aiSignals": "<brief explanation of why you think it is human or AI written, max 40 words>",
  "humanIndicators": ["<list of 1-3 phrases or patterns that indicate human authorship>"],
  "strengthsFound": ["<1-2 things the student got right>"]
}

Scoring rules:
- Be fair but rigorous. Partial credit is fine.
- Award 0 for criteria not addressed at all.

AI LIKELIHOOD SCORING — be strict and calibrated:
Score 80-100 (Clearly AI) if you see 3+ of:
  • Perfect paragraph structure with no rambling
  • Uses phrases like "it is important to", "it is worth noting", "in conclusion", "leveraging", "robust solution"
  • No personal voice, anecdotes, hesitation, or self-reference
  • Every point is comprehensively addressed with no gaps
  • Reads like a textbook or Stack Overflow answer
  • Uses em dashes, colons, or bullet points in a very structured way
  • No typos, no colloquialisms, no filler words
  • Mentions multiple specific technologies in a single paragraph (Redis, NoSQL, KGS, etc.) — shows breadth but no depth of personal experience

Score 50-79 (Uncertain) if:
  • Some structure but also some personal voice or imprecision
  • Mostly correct but misses something a real expert would mention

Score 0-49 (Likely Human) if:
  • Personal examples, typos, informal phrasing, unique opinionated framing
  • Addresses some rubric points but misses others (humans don't answer perfectly)
  • Uses casual language or conversational tone`;


    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const raw = completion.choices[0]?.message?.content || '{}';
    const result = JSON.parse(raw);

    return NextResponse.json({ result });
  } catch (err: any) {
    console.error('Grade error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
