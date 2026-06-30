'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function StudentProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [id]);

  const loadProfile = async () => {
    setLoading(true);
    const res = await fetch(`/api/students?userId=${id}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
  };

  const toggleAI = async () => {
    setToggling(true);
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'toggle-ai-match', userId: id, toggle: !data.profile.aiMatchToggle }),
    });
    await loadProfile();
    setToggling(false);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div className="ai-loading-spinner" />
    </div>
  );
  if (!data?.user) return <div style={{ padding: 40, textAlign: 'center' }}>Student not found</div>;

  const { user, profile } = data;

  const trackColors: Record<string, string> = {
    Dev: '#2A0E72', Design: '#5E7D00', Content: '#C2410C', Marketing: '#0369A1'
  };
  const trackColor = trackColors[profile?.track] || 'var(--purple)';
  const trackIcons: Record<string, string> = { Dev: '💻', Design: '🎨', Content: '🎬', Marketing: '📈' };

  const scorePercent = profile ? (profile.trackRecordScore / 100) * 100 : 0;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      {/* Profile Header */}
      <div className="card fade-up" style={{ marginBottom: 20, background: `linear-gradient(135deg, ${trackColor}0F 0%, white 60%)` }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          <div className="avatar avatar-lg" style={{ background: trackColor, width: 64, height: 64, fontSize: 20 }}>
            {user.avatar}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, letterSpacing: '-0.02em' }}>{user.name}</h1>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
              <span style={{ background: trackColor + '18', color: trackColor, fontSize: 12, fontWeight: 700, padding: '3px 10px', borderRadius: 20 }}>
                {trackIcons[profile?.track]} {profile?.track}
              </span>
              <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                {user.college} · Class of {user.gradYear}
              </span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {profile?.badges?.map((b: string) => (
                <span key={b} className="badge">🏆 {b}</span>
              ))}
            </div>
          </div>

          {/* AI Toggle */}
          <div style={{ background: 'var(--bg-3)', borderRadius: 12, padding: '14px 16px', minWidth: 180 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)', marginBottom: 10, fontFamily: "'Inter Tight', sans-serif" }}>
              AI Match Visibility
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                className={`toggle-track ${profile?.aiMatchToggle ? 'on' : ''}`}
                onClick={toggleAI}
                disabled={toggling}
              >
                <div className="toggle-thumb" />
              </button>
              <span style={{ fontSize: 13, fontWeight: 600, color: profile?.aiMatchToggle ? 'var(--green)' : 'var(--ink-4)' }}>
                {profile?.aiMatchToggle ? '✓ Active' : '⏸ Paused'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 8, lineHeight: 1.4 }}>
              {profile?.aiMatchToggle
                ? 'AI actively surfaces your profile for matching tasks.'
                : 'You\'ll get 24hr window notifications for strong matches.'}
            </p>
          </div>
        </div>
      </div>

      {/* Dual Score Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card fade-up" style={{ borderTop: '3px solid #4F46E5', animationDelay: '0.05s' }}>
          <div className="score-seed" style={{ marginBottom: 12 }}>🧪 Seed Score</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--seed-color)', fontFamily: "'Inter Tight', sans-serif", lineHeight: 1, marginBottom: 8 }}>
            {profile?.seedScore}<span style={{ fontSize: 20, color: 'var(--ink-4)' }}>/100</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            Set from your {profile?.track} track assessment. Reflects raw skill at time of joining.
          </p>
          <div style={{ marginTop: 12, height: 6, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${profile?.seedScore}%`, background: 'var(--seed-color)', borderRadius: 99 }} />
          </div>
        </div>

        <div className="card fade-up" style={{ borderTop: '3px solid var(--green)', animationDelay: '0.1s' }}>
          <div className="score-track" style={{ marginBottom: 12 }}>📈 Track-Record Score</div>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--track-color)', fontFamily: "'Inter Tight', sans-serif", lineHeight: 1, marginBottom: 8 }}>
            {profile?.trackRecordScore}<span style={{ fontSize: 20, color: 'var(--ink-4)' }}>/100</span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>
            Live score updated after every milestone. {profile?.completedGigs} gigs completed.
          </p>
          <div style={{ marginTop: 12, height: 6, background: 'var(--bg-4)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${profile?.trackRecordScore}%`, background: 'var(--green)', borderRadius: 99 }} />
          </div>
        </div>
      </div>

      {/* Score delta legend */}
      <div className="card fade-up" style={{ marginBottom: 20, animationDelay: '0.15s' }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>How your track-record score moves</h3>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          {[
            { label: 'Approved on-time', delta: '+8',  color: 'var(--green)',  bg: 'rgba(124,181,24,0.10)',  border: 'rgba(124,181,24,0.2)' },
            { label: 'Approved late',    delta: '+4',  color: '#FCD34D',       bg: 'rgba(245,158,11,0.10)', border: 'rgba(245,158,11,0.2)' },
            { label: 'Needs revision',   delta: '-3',  color: '#FB923C',       bg: 'rgba(234,88,12,0.10)',  border: 'rgba(234,88,12,0.2)' },
            { label: 'Missed deadline',  delta: '-10', color: '#F87171',       bg: 'rgba(220,38,38,0.10)',  border: 'rgba(220,38,38,0.2)' },
          ].map(item => (
            <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16, fontWeight: 800, color: item.color, fontFamily: "'Inter Tight', sans-serif" }}>{item.delta}</span>
              <span style={{ fontSize: 12, color: 'var(--ink-2)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Action links */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <Link href={`/student/${id}/gig`} className="btn-primary">📋 Active Gig</Link>
        <Link href="/leaderboard" className="btn-secondary">🏆 Leaderboard</Link>
        <Link href={`/student/${id}/notifications`} className="btn-secondary">🔔 Notifications</Link>
        <Link href={`/student/onboarding?track=${profile?.track}`} className="btn-ghost">↩ Re-take {profile?.track} Assessment</Link>
      </div>
    </div>
  );
}
