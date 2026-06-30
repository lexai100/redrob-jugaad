// lib/scoring.ts
// Track record score update logic — runs after each milestone verdict

import { updateSkillProfile, getStudentProfile } from './store';

type MilestoneOutcome = 'approved-ontime' | 'approved-late' | 'needs-revision' | 'missed-deadline';

const SCORE_DELTAS: Record<MilestoneOutcome, number> = {
  'approved-ontime': 8,
  'approved-late': 4,
  'needs-revision': -3,
  'missed-deadline': -10,
};

export function updateTrackRecordScore(userId: string, outcome: MilestoneOutcome): number {
  const profile = getStudentProfile(userId);
  if (!profile) return 0;

  const delta = SCORE_DELTAS[outcome];
  const newScore = Math.max(0, Math.min(100, profile.trackRecordScore + delta));

  updateSkillProfile(userId, { trackRecordScore: newScore });
  return newScore;
}

export function determineOutcome(
  submittedAt: string,
  dueDate: string,
  approved: boolean
): MilestoneOutcome {
  if (!approved) return 'needs-revision';
  const submitted = new Date(submittedAt);
  const due = new Date(dueDate);
  return submitted <= due ? 'approved-ontime' : 'approved-late';
}

export const SCORE_DELTA_LABELS: Record<MilestoneOutcome, { label: string; color: string }> = {
  'approved-ontime': { label: '+8 pts', color: 'text-green-600' },
  'approved-late': { label: '+4 pts', color: 'text-yellow-600' },
  'needs-revision': { label: '-3 pts', color: 'text-orange-600' },
  'missed-deadline': { label: '-10 pts', color: 'text-red-600' },
};
