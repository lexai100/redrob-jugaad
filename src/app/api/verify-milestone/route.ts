import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { submission, acceptanceCriteria, milestoneTitle, dueDate, submittedAt } = await req.json();

    const systemPrompt = `You are an AI quality reviewer for a micro-gig marketplace. 
    
Your job is to evaluate whether a student's milestone submission meets the specified acceptance criteria.

Be fair but rigorous. A submission passes if it genuinely addresses the acceptance criteria based on what's described.
If the submission text/link description suggests the work was done, give benefit of the doubt for a prototype demo.

Return ONLY valid JSON — no markdown, no extra text:
{
  "approved": true or false,
  "reason": "2-3 sentence explanation of the verdict, mentioning specific criteria that were or weren't met"
}`;

    const userPrompt = `
Milestone: "${milestoneTitle}"

Acceptance Criteria:
${acceptanceCriteria.map((c: string, i: number) => `${i + 1}. ${c}`).join('\n')}

Student's Submission:
"${submission}"

Evaluate whether this submission meets the acceptance criteria.`;

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.2,
      max_tokens: 300,
    });

    const content = completion.choices[0]?.message?.content ?? '';

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in response');
    }

    const verdict = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ verdict });
  } catch (error) {
    console.error('Milestone verification error:', error);
    return NextResponse.json(
      { error: 'Failed to verify milestone. Please try again.' },
      { status: 500 }
    );
  }
}
