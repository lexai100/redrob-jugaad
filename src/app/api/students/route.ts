import { NextRequest, NextResponse } from 'next/server';
import { users, skillProfiles, notifications, updateSkillProfile, updateNotification } from '@/lib/store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const type = searchParams.get('type');

  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

  const user = users.find(u => u.id === userId);
  const profile = skillProfiles.find(p => p.userId === userId);

  if (type === 'notifications') {
    const userNotifications = notifications.filter(n => n.studentId === userId);
    return NextResponse.json({ notifications: userNotifications });
  }

  if (type === 'leaderboard') {
    const track = searchParams.get('track') || profile?.track;
    const trackProfiles = skillProfiles
      .filter(p => p.track === track)
      .map(p => ({ ...p, user: users.find(u => u.id === p.userId) }))
      .sort((a, b) => b.trackRecordScore - a.trackRecordScore);
    return NextResponse.json({ leaderboard: trackProfiles });
  }

  return NextResponse.json({ user, profile });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, userId, toggle, notificationId } = body;

  if (action === 'toggle-ai-match') {
    updateSkillProfile(userId, { aiMatchToggle: toggle });
    return NextResponse.json({ success: true });
  }

  if (action === 'act-notification') {
    updateNotification(notificationId, { acted: true });
    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
