'use client';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

type LeaderboardEntry = {
  userId: string;
  track: string;
  seedScore: number;
  trackRecordScore: number;
  completedGigs: number;
  badges: string[];
  user: { name: string; college: string; gradYear: number; avatar: string };
};

const TRACKS = ['Dev', 'Design', 'Content', 'Marketing'];
const TRACK_ICONS: Record<string, string> = { Dev: '💻', Design: '🎨', Content: '🎬', Marketing: '📈' };
const TRACK_COLORS: Record<string, string> = { Dev: '#2A0E72', Design: '#5E7D00', Content: '#C2410C', Marketing: '#0369A1' };

export default function LeaderboardClient() {
  const searchParams = useSearchParams();
  const [activeTrack, setActiveTrack] = useState(searchParams.get('track') || 'Design');
  const [sortBy, setSortBy] = useState<'trackRecordScore' | 'seedScore'>('trackRecordScore');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, [activeTrack]);

  const loadLeaderboard = async () => {
    setLoading(true);
    const res = await fetch(`/api/students?userId=s1&type=leaderboard&track=${activeTrack}`);
    const data = await res.json();
    setLeaderboard(data.leaderboard || []);
    setLoading(false);
  };

  const sorted = [...leaderboard].sort((a, b) => b[sortBy] - a[sortBy]);
  const color = TRACK_COLORS[activeTrack];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 8 }}>🏆 Skill Track Leaderboard</h1>
        <p style={{ color: 'var(--ink-3)', fontSize: 16 }}>Live rankings updated after every milestone. Proof beats a one-time test.</p>
      </div>

      {/* Track selector */}
      <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
        {TRACKS.map(t => (
          <button key={t} onClick={() => setActiveTrack(t)} style={{
            padding: '10px 20px', borderRadius: 24, border: '2px solid',
            borderColor: activeTrack === t ? TRACK_COLORS[t] : 'var(--border)',
            background: activeTrack === t ? TRACK_COLORS[t] + '22' : 'var(--bg-2)',
            color: activeTrack === t ? '#fff' : 'var(--ink-3)',
            fontWeight: 700, fontSize: 14, cursor: 'pointer',
            fontFamily: "'Inter Tight', sans-serif", transition: 'all 0.15s',
          }}>
            {TRACK_ICONS[t]} {t}
          </button>
        ))}
      </div>

      {/* Sort toggle */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 28 }}>
        <button onClick={() => setSortBy('trackRecordScore')} style={{
          padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
          borderColor: sortBy === 'trackRecordScore' ? 'var(--green)' : 'var(--border)',
          background: sortBy === 'trackRecordScore' ? 'rgba(124,181,24,0.12)' : 'var(--bg-2)',
          color: sortBy === 'trackRecordScore' ? 'var(--green)' : 'var(--ink-3)',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>📈 Sort by Track Record</button>
        <button onClick={() => setSortBy('seedScore')} style={{
          padding: '7px 16px', borderRadius: 8, border: '1.5px solid',
          borderColor: sortBy === 'seedScore' ? '#A78BFA' : 'var(--border)',
          background: sortBy === 'seedScore' ? 'rgba(167,139,250,0.12)' : 'var(--bg-2)',
          color: sortBy === 'seedScore' ? '#A78BFA' : 'var(--ink-3)',
          fontWeight: 600, fontSize: 13, cursor: 'pointer',
        }}>🧪 Sort by Seed Score</button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><div className="ai-loading-spinner" style={{ margin: '0 auto' }} /></div>
      ) : (
        <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
          <div style={{
            background: color, padding: '14px 24px',
            display: 'grid', gridTemplateColumns: '48px 1fr 110px 110px 80px',
            gap: 12, alignItems: 'center',
          }}>
            {['Rank', 'Student', 'Track Record', 'Seed Score', 'Gigs'].map((h, i) => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.8)', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: i > 1 ? 'center' : 'left' }}>{h}</span>
            ))}
          </div>

          {sorted.map((entry, idx) => (
            <div key={entry.userId} className="fade-in" style={{
              padding: '16px 24px',
              display: 'grid', gridTemplateColumns: '48px 1fr 110px 110px 80px',
              gap: 12, alignItems: 'center',
              borderBottom: '1px solid var(--border)',
              background: idx === 0 ? color + '06' : 'transparent',
              animationDelay: `${idx * 0.03}s`,
            }}>
              <div style={{ textAlign: 'center' }}>
                {idx < 3
                  ? <span style={{ fontSize: 22 }}>{['🥇', '🥈', '🥉'][idx]}</span>
                  : <span style={{ fontWeight: 700, color: 'var(--ink-4)', fontSize: 15 }}>#{idx + 1}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="avatar avatar-sm" style={{ background: color }}>{entry.user?.avatar}</div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--ink)' }}>{entry.user?.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>{entry.user?.college}</div>
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--green)', fontFamily: "'Inter Tight', sans-serif" }}>{entry.trackRecordScore}</div>
                <div style={{ height: 3, background: 'var(--card-tint)', borderRadius: 99, marginTop: 4 }}>
                  <div style={{ height: '100%', width: `${entry.trackRecordScore}%`, background: 'var(--green)', borderRadius: 99 }} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#4F46E5', fontFamily: "'Inter Tight', sans-serif" }}>{entry.seedScore}</div>
                <div style={{ height: 3, background: 'var(--card-tint)', borderRadius: 99, marginTop: 4 }}>
                  <div style={{ height: '100%', width: `${entry.seedScore}%`, background: '#4F46E5', borderRadius: 99 }} />
                </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--ink-3)' }}>{entry.completedGigs}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card-tinted" style={{ marginTop: 24 }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--ink-4)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>🔍 Why these scores?</p>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>
          <strong>Seed Score</strong>: Set once from the track assessment.<br />
          <strong>Track-Record Score</strong>: Updates after every milestone — <span style={{ color: 'var(--green)' }}>+8 on-time</span>, +4 late, <span style={{ color: '#EA580C' }}>-3 revision</span>, -10 missed.<br />
          Business owners choose which to weight higher per task.
        </p>
      </div>
    </div>
  );
}
