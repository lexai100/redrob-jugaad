import { NextRequest, NextResponse } from 'next/server';
import { milestones, tasks, skillProfiles, updateMilestone, updateSkillProfile, addMilestone, addNotification, notifications } from '@/lib/store';
import { determineOutcome, updateTrackRecordScore } from '@/lib/scoring';

// Milestone templates per track
const MILESTONE_TEMPLATES: Record<string, { title: string; description: string; dayOffset: number }[]> = {
  Design: [
    { title: 'Moodboard & initial concepts', description: 'Share 3 direction moodboards with color palette options and reference styles.', dayOffset: 2 },
    { title: 'Final design files', description: 'Deliver all final files in required formats (SVG, PNG, PDF) as per brief.', dayOffset: 4 },
    { title: 'Brand assets & handoff', description: 'Complete brand guide, social media assets, and source files zipped for delivery.', dayOffset: 6 },
  ],
  Dev: [
    { title: 'Wireframe + project setup', description: 'Share wireframe/prototype and confirm tech stack. Set up repo and deployment skeleton.', dayOffset: 2 },
    { title: 'Core build — responsive UI', description: 'Build the main UI, all sections working correctly on mobile and desktop.', dayOffset: 4 },
    { title: 'Final deployment + handoff', description: 'Deploy to production, share public link, deliver source code and documentation.', dayOffset: 6 },
  ],
  Content: [
    { title: 'Script & storyboard', description: 'Share scripts/storyboards for all content pieces. Get approval before production.', dayOffset: 2 },
    { title: 'Draft content delivery', description: 'Share first draft of all content pieces for review and feedback.', dayOffset: 4 },
    { title: 'Final edited delivery', description: 'Final content files in all required formats, delivered via Drive link.', dayOffset: 6 },
  ],
  Marketing: [
    { title: 'Strategy document + research', description: 'Competitor analysis, target audience breakdown, and growth strategy document.', dayOffset: 1 },
    { title: 'Content calendar & templates', description: 'Full content calendar with captions, hashtags, and posting schedule.', dayOffset: 2 },
    { title: 'Final delivery + handoff', description: 'All files as editable Google Sheets + PDF. Final review checklist included.', dayOffset: 3 },
  ],
};

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
  const { action, milestoneId, submissionText, submissionLink, verdict, studentId, submittedAt, taskId, taskTitle, track } = body;

  // ── ASSIGN GIG: create milestones + notification for a student ──
  if (action === 'assign-gig') {
    if (!studentId || !taskId || !track) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Don't double-assign — check if milestones already exist for this student+task
    const existing = milestones.filter(m => m.studentId === studentId && m.taskId === taskId);
    if (existing.length > 0) {
      return NextResponse.json({ success: true, alreadyExists: true, milestones: existing });
    }

    const templates = MILESTONE_TEMPLATES[track] || MILESTONE_TEMPLATES['Dev'];
    const now = Date.now();
    const createdMilestones = templates.map((tpl, i) => ({
      id: `dyn-${taskId}-${studentId}-m${i + 1}`,
      taskId,
      studentId,
      title: tpl.title,
      description: tpl.description,
      status: 'pending' as const,
      dueDate: new Date(now + tpl.dayOffset * 24 * 60 * 60 * 1000).toISOString(),
    }));

    createdMilestones.forEach(m => addMilestone(m));

    // Create notification for the student
    const notifId = `notif-${taskId}-${studentId}`;
    const alreadyNotified = notifications.find(n => n.id === notifId);
    if (!alreadyNotified) {
      addNotification({
        id: notifId,
        studentId,
        taskId,
        message: `🎉 You've been selected for a gig: "${taskTitle || 'New Task'}". Check your Active Gig dashboard to see the milestone breakdown and get started.`,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(now + 7 * 24 * 60 * 60 * 1000).toISOString(),
        acted: false,
      });
    }

    return NextResponse.json({ success: true, milestones: createdMilestones });
  }

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
