'use client';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { SkillProfile, User } from '@/lib/store';

type RankedStudent = SkillProfile & {
  matchScore: number;
  matchBreakdown: { skillTrackMatch: number; budgetFit: number; trackRecord: number; availability: number };
  user: User;
};

export default function ShortlistClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const taskId = searchParams.get('taskId');

  const [students, setStudents] = useState<RankedStudent[]>([]);
  const [filtered, setFiltered] = useState<RankedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCollege, setFilterCollege] = useState('');
  const [filterGradYear, setFilterGradYear] = useState('');
  const [filterMinScore, setFilterMinScore] = useState(0);
  const [weightPref, setWeightPref] = useState<'seedScore' | 'trackRecordScore'>('trackRecordScore');
  const [taskData, setTaskData] = useState<any>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem('pendingTask');
    const task = pending ? JSON.parse(pending) : null;

    if (task) {
      setTaskData(task);
      loadShortlist(task);
    } else {
      const defaultTask = {
        id: 't3', track: 'Dev', budgetRange: '₹2,000 – ₹3,500',
        urgency: 'normal', weightPreference: 'seedScore',
        brief: { title: 'Landing Page — ThreadHouse', acceptance_criteria: [] },
        status: 'open',
      };
      setTaskData(defaultTask);
      loadShortlist(defaultTask);
    }
  }, []);

  const loadShortlist = async (task: any) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-shortlist', taskData: task }),
      });
      const data = await res.json();
      if (data.shortlist) {
        setStudents(data.shortlist);
        setFiltered(data.shortlist);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = [...students];
    if (filterCollege) result = result.filter(s => s.user?.college?.toLowerCase().includes(filterCollege.toLowerCase()));
    if (filterGradYear) result = result.filter(s => String(s.user?.gradYear) === filterGradYear);
    if (filterMinScore > 0) result = result.filter(s => s.trackRecordScore >= filterMinScore);
    setFiltered(result);
  }, [filterCollege, filterGradYear, filterMinScore, students]);

  const trackColors: Record<string, string> = {
    Dev: '#2A0E72', Design: '#5E7D00', Content: '#C2410C', Marketing: '#0369A1'
  };

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <Link href="/business" style={{ color: 'var(--ink-4)', fontSize: 13, textDecoration: 'none' }}>← Post Task</Link>
          <span style={{ color: 'var(--ink-4)' }}>›</span>
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>Matched Shortlist</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>
          {taskData?.brief?.title || 'Student Shortlist'}
        </h1>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`chip chip-${taskData?.status || 'open'}`}>{taskData?.status || 'open'}</span>
          {taskData?.urgency === 'urgent' && <span className="chip chip-urgent">🔥 Urgent</span>}
          <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{filtered.length} students matched</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: 24, alignItems: 'start' }}>
        {/* Filters sidebar */}
        <div className="card" style={{ position: 'sticky', top: 84 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>Filters</h3>

          <div style={{ marginBottom: 16 }}>
            <label className="label">College</label>
            <input className="input" placeholder="Search college..." value={filterCollege} onChange={e => setFilterCollege(e.target.value)} />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label className="label">Grad Year</label>
            <select className="select" style={{ width: '100%' }} value={filterGradYear} onChange={e => setFilterGradYear(e.target.value)}>
              <option value="">All years</option>
              <option>2025</option>
              <option>2026</option>
            </select>
          </div>

          <div style={{ marginBottom: 20 }}>
            <label className="label">Min Track-Record Score: {filterMinScore}</label>
            <input type="range" min={0} max={100} value={filterMinScore}
              onChange={e => setFilterMinScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--purple)' }}
            />
          </div>

          <div className="divider" />

          <div>
            <label className="label" style={{ marginBottom: 10 }}>Weight matching toward</label>
            {(['trackRecordScore', 'seedScore'] as const).map(w => (
              <button key={w} onClick={() => setWeightPref(w)} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                width: '100%', padding: '8px 10px', marginBottom: 6,
                background: weightPref === w ? 'var(--card-tint)' : 'transparent',
                border: '1.5px solid', borderColor: weightPref === w ? 'var(--purple)' : 'var(--border)',
                borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600,
                color: weightPref === w ? 'var(--purple)' : 'var(--ink-3)',
                fontFamily: "'Inter Tight', sans-serif", transition: 'all 0.15s',
              }}>
                <span>{w === 'trackRecordScore' ? '📈' : '🧪'}</span>
                {w === 'trackRecordScore' ? 'Track Record' : 'Seed Score'}
              </button>
            ))}
          </div>

          {(filterCollege || filterGradYear || filterMinScore > 0) && (
            <button className="btn-ghost" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }}
              onClick={() => { setFilterCollege(''); setFilterGradYear(''); setFilterMinScore(0); }}>
              Clear filters
            </button>
          )}
        </div>

        {/* Student cards */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: 60 }}>
              <div className="ai-loading-spinner" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--ink-3)' }}>AI is ranking students...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ fontSize: 32, marginBottom: 10 }}>🔍</p>
              <p style={{ color: 'var(--ink-3)' }}>No students match these filters.</p>
            </div>
          ) : (
            filtered.map((student, idx) => (
              <StudentCard key={student.userId} student={student} rank={idx + 1} trackColors={trackColors} taskData={taskData} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function StudentCard({ student, rank, trackColors, taskData }: any) {
  const [expanded, setExpanded] = useState(false);
  const [assigned, setAssigned] = useState(false);
  const color = trackColors[student.track] || 'var(--purple)';
  const isArjun = student.userId === 's1';

  return (
    <div className="card fade-up" style={{ marginBottom: 16, animationDelay: `${rank * 0.05}s`, cursor: 'pointer' }} onClick={() => setExpanded(!expanded)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: rank <= 3 ? 'var(--purple)' : 'var(--card-tint)',
          color: rank <= 3 ? 'white' : 'var(--ink-3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 800, fontSize: 14, flexShrink: 0,
          fontFamily: "'Inter Tight', sans-serif",
        }}>
          {rank <= 3 ? ['🥇', '🥈', '🥉'][rank - 1] : `#${rank}`}
        </div>
        <div className="avatar" style={{ background: color }}>{student.user?.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>{student.user?.name}</h3>
            <span style={{ background: color + '18', color, fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20 }}>{student.track}</span>
            {!student.aiMatchToggle && <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>⏸️ Paused</span>}
          </div>
          <div style={{ fontSize: 12, color: 'var(--ink-3)', marginBottom: 8 }}>
            {student.user?.college} · Class of {student.user?.gradYear} · {student.completedGigs} gigs
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span className="score-seed">🧪 Seed: {student.seedScore}</span>
            <span className="score-track">📈 Track: {student.trackRecordScore}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="match-bar-track" style={{ flex: 1 }}>
              <div className="match-bar-fill" style={{ width: `${student.matchScore}%` }} />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--purple)', fontFamily: "'Inter Tight', sans-serif", flexShrink: 0 }}>
              {student.matchScore}% match
            </span>
          </div>
        </div>
        <div style={{ color: 'var(--ink-4)', fontSize: 20, flexShrink: 0 }}>{expanded ? '▲' : '▼'}</div>
      </div>

      {expanded && (
        <div className="fade-in" style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>🔍 Match Breakdown</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
              {[
                { label: 'Skill Match', val: student.matchBreakdown.skillTrackMatch, max: 40 },
                { label: 'Budget Fit', val: student.matchBreakdown.budgetFit, max: 20 },
                { label: 'Track Record', val: student.matchBreakdown.trackRecord, max: 25 },
                { label: 'Availability', val: student.matchBreakdown.availability, max: 15 },
              ].map(b => (
                <div key={b.label} style={{ background: 'var(--card-tint)', borderRadius: 8, padding: '10px 12px', textAlign: 'center' }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--purple)', fontFamily: "'Inter Tight', sans-serif" }}>{b.val}<span style={{ fontSize: 11, color: 'var(--ink-4)' }}>/{b.max}</span></div>
                  <div style={{ fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}>{b.label}</div>
                </div>
              ))}
            </div>
          </div>
          {student.badges?.length > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Badges</p>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {student.badges.map((b: string) => <span key={b} className="badge">🏆 {b}</span>)}
              </div>
            </div>
          )}

          {/* Gig assigned confirmation */}
          {assigned && isArjun && (
            <div className="fade-up" style={{
              background: 'rgba(124,181,24,0.08)', border: '1px solid rgba(124,181,24,0.3)',
              borderRadius: 12, padding: '16px 18px', marginBottom: 12,
            }}>
              <p style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>✅ Gig assigned to {student.user?.name}!</p>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 12 }}>
                ₹6,000–₹8,000 locked in escrow. Arjun has been notified and can see the milestone breakdown in his dashboard.
              </p>
              <Link
                href={`/student/${student.userId}/gig`}
                className="btn-primary"
                style={{ fontSize: 13, padding: '9px 18px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                onClick={e => e.stopPropagation()}
              >
                👀 See Arjun's Active Gig →
              </Link>
            </div>
          )}

          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <Link href={`/student/${student.userId}`} className="btn-secondary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={e => e.stopPropagation()}>
              View Profile
            </Link>
            {!assigned && (
              <button
                className="btn-primary"
                style={{ fontSize: 13, padding: '8px 16px' }}
                onClick={e => { e.stopPropagation(); setAssigned(true); }}
              >
                ✓ Assign Gig
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
