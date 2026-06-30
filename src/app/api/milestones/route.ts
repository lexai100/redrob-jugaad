import { NextRequest, NextResponse } from 'next/server';
import { milestones, tasks, skillProfiles, updateMilestone, updateSkillProfile } from '@/lib/store';
import { determineOutcome, updateTrackRecordScore } from '@/lib/scoring';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');
  const studentId = searchParams.get('studentId');

  let result = milestones;
  if (taskId) result = result.filter(m => m.taskId === taskId);
  if (studentId) result = result.filter(m => m.studentId === studentId);

  return NextResponse.json({ milestones: result });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, milestoneId, submissionText, submissionLink, verdict, studentId, submittedAt } = body;

  if (action === 'submit') {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

    updateMilestone(milestoneId, {
      status: 'submitted',
      submissionText,
      submissionLink,
      submittedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  }

  if (action === 'apply-verdict') {
    const milestone = milestones.find(m => m.id === milestoneId);
    if (!milestone) return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });

    const newStatus = verdict.approved ? 'approved' : 'needs-revision';
    updateMilestone(milestoneId, {
      status: newStatus,
      aiVerdict: verdict,
    });

    // Update track record score if approved
    if (verdict.approved && studentId) {
      const outcome = determineOutcome(
        submittedAt || new Date().toISOString(),
        milestone.dueDate,
        true
      );
      const newScore = updateTrackRecordScore(studentId, outcome);
      return NextResponse.json({ success: true, newTrackRecordScore: newScore, outcome });
    }

    if (!verdict.approved && studentId) {
      const newScore = updateTrackRecordScore(studentId, 'needs-revision');
      return NextResponse.json({ success: true, newTrackRecordScore: newScore, outcome: 'needs-revision' });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
