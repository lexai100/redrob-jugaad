// lib/matching.ts
// Deterministic matching score formula — transparent and visible in UI

import { SkillProfile, Task, Match } from './store';

export function computeMatchScore(
  profile: SkillProfile,
  task: Task,
  weightPreference: 'seedScore' | 'trackRecordScore' = 'trackRecordScore'
): { total: number; breakdown: Match['matchBreakdown'] } {
  // 1. Skill track match (0–40): does student's track match task's track?
  const skillTrackMatch = profile.track === task.track ? 40 : 0;

  // 2. Budget fit (0–20): estimate based on track record score proxy
  const budgetFit = Math.round((profile.trackRecordScore / 100) * 20);

  // 3. Track record component (0–25): weighted by business owner preference
  const scoreToUse = weightPreference === 'seedScore'
    ? profile.seedScore
    : profile.trackRecordScore;
  const trackRecord = Math.round((scoreToUse / 100) * 25);

  // 4. Availability (0–15): AI toggle + completed gigs as a proxy
  const toggleBonus = profile.aiMatchToggle ? 10 : 3;
  const gigBonus = Math.min(profile.completedGigs, 5);
  const availability = toggleBonus + gigBonus;

  const total = skillTrackMatch + budgetFit + trackRecord + availability;

  return {
    total: Math.min(total, 100),
    breakdown: { skillTrackMatch, budgetFit, trackRecord, availability },
  };
}

export function rankStudentsForTask(
  profiles: SkillProfile[],
  task: Task
): Array<SkillProfile & { matchScore: number; matchBreakdown: Match['matchBreakdown'] }> {
  return profiles
    .map(profile => {
      const { total, breakdown } = computeMatchScore(profile, task, task.weightPreference);
      return { ...profile, matchScore: total, matchBreakdown: breakdown };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
