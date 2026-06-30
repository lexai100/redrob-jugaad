import { NextRequest, NextResponse } from 'next/server';
import { tasks, users, skillProfiles, matches, milestones } from '@/lib/store';
import { rankStudentsForTask } from '@/lib/matching';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const taskId = searchParams.get('taskId');

  if (taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return NextResponse.json({ error: 'Task not found' }, { status: 404 });

    const taskMatches = matches.filter(m => m.taskId === taskId);
    const enrichedMatches = taskMatches.map(match => {
      const student = users.find(u => u.id === match.studentId);
      const profile = skillProfiles.find(p => p.userId === match.studentId);
      return { ...match, student, profile };
    });

    return NextResponse.json({ task, matches: enrichedMatches, milestones: milestones.filter(m => m.taskId === taskId) });
  }

  return NextResponse.json({ tasks });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action } = body;

  if (action === 'get-shortlist') {
    const { taskData } = body;
    const ranked = rankStudentsForTask(skillProfiles, taskData);
    const enriched = ranked.map(r => ({
      ...r,
      user: users.find(u => u.id === r.userId),
    }));
    return NextResponse.json({ shortlist: enriched });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
