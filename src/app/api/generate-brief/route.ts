import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { rawInput } = await req.json();

    if (!rawInput || rawInput.trim().length < 5) {
      return NextResponse.json({ error: 'Task description too short' }, { status: 400 });
    }

    const systemPrompt = `You are an expert project scoping assistant for a micro-gig marketplace in India. 
    
Your job is to turn a rough task description from a small business owner into a clear, structured project brief.

Return ONLY valid JSON matching this exact schema — no markdown, no extra text:
{
  "title": "Short, clear project title (max 60 chars)",
  "scope": "2-3 sentence scope description explaining what the project entails",
  "deliverables": ["deliverable 1", "deliverable 2", "deliverable 3", "..."],
  "budget_range": "₹X,XXX – ₹X,XXX",
  "timeline": "X days",
  "acceptance_criteria": ["criterion 1", "criterion 2", "criterion 3", "..."]
}

Rules:
- deliverables: 3-6 items, specific and actionable
- budget_range: realistic for Indian freelance market, in INR
- timeline: realistic in days
- acceptance_criteria: 3-6 measurable, checkable items that define "done"
- All text in English, friendly and professional tone
- Amounts in Indian Rupees (₹)`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Create a structured brief for this task: "${rawInput}"` },
      ],
      temperature: 0.3,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content ?? '';

    // Extract JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const brief = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ brief });
  } catch (error) {
    console.error('Brief generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate brief. Please try again.' },
      { status: 500 }
    );
  }
}
