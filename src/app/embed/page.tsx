'use client';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

const TRACKS = [
  { id: 'Dev', icon: '💻', color: '#7C3AED' },
  { id: 'Design', icon: '🎨', color: '#5E7D00' },
  { id: 'Content', icon: '🎬', color: '#C2410C' },
  { id: 'Marketing', icon: '📈', color: '#0369A1' },
];

function EmbedInner() {
  const searchParams = useSearchParams();
  const role = searchParams.get('role') || 'student';
  const isStudent = role === 'student';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg)',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'Inter', sans-serif",
    }}>
      {/* Header strip */}
      <div style={{
        background: 'var(--bg-2)',
        borderBottom: '1px solid var(--border)',
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
      }}>
        {/* rJ logo */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <div style={{ background: '#000', border: '1px solid #333', borderRadius: '5px 0 0 5px', padding: '3px 7px', fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 800, color: '#fff' }}>r</div>
          <div style={{ background: '#7CB518', borderRadius: '0 5px 5px 0', padding: '3px 7px', fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 800, color: '#000' }}>J</div>
        </div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', lineHeight: 1 }}>Redrob Jugaad</div>
          <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>Powered by Redrob App Store</div>
        </div>
        {/* Role pill */}
        <div style={{ marginLeft: 'auto', padding: '3px 10px', borderRadius: 20, background: isStudent ? 'rgba(124,181,24,0.12)' : 'rgba(167,139,250,0.12)', border: `1px solid ${isStudent ? '#7CB518' : '#A78BFA'}`, fontSize: 11, fontWeight: 700, color: isStudent ? '#7CB518' : '#A78BFA' }}>
          {isStudent ? 'Student' : 'Business'}
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '28px 20px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {isStudent ? (
          <>
            {/* Student view */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Get Started</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>Turn your skills into a verified track record.</h1>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>Pick a track, take a 35-min proctored assessment, and get matched to real paid gigs.</p>
            </div>

            {/* Track grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {TRACKS.map(t => (
                <Link key={t.id} href={`/student/onboarding?track=${t.id}`} target="_blank" style={{
                  padding: '14px', background: 'var(--bg-2)', border: '1px solid var(--border)',
                  borderTop: `2px solid ${t.color}`, borderRadius: 10, textDecoration: 'none',
                  transition: 'background 0.15s', display: 'block',
                }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'var(--bg-2)')}
                >
                  <div style={{ fontSize: 22, marginBottom: 6 }}>{t.icon}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)' }}>{t.id}</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)', marginTop: 2 }}>Take assessment →</div>
                </Link>
              ))}
            </div>

            {/* Stats row */}
            <div style={{ display: 'flex', gap: 0, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              {[
                { num: '40M+', label: 'Students in India' },
                { num: '2 Scores', label: 'Seed + Track Record' },
                { num: '4 Tracks', label: 'Dev, Design & more' },
              ].map((s, i) => (
                <div key={s.label} style={{ flex: 1, padding: '12px 10px', textAlign: 'center', borderLeft: i > 0 ? '1px solid var(--border)' : 'none' }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'var(--green)', fontFamily: "'Inter Tight', sans-serif" }}>{s.num}</div>
                  <div style={{ fontSize: 10, color: 'var(--ink-4)', marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            <Link href="/student/onboarding" target="_blank" style={{
              display: 'block', textAlign: 'center', padding: '13px',
              background: 'var(--green)', borderRadius: 10, color: '#000',
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
              fontFamily: "'Inter Tight', sans-serif",
            }}>
              Start Assessment →
            </Link>
          </>
        ) : (
          <>
            {/* Business view */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8 }}>Hire Smart</p>
              <h1 style={{ fontSize: 22, fontWeight: 800, lineHeight: 1.2, marginBottom: 8 }}>Verified student talent for every task.</h1>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>Describe what you need. AI finds the best match. Pay only for delivered work.</p>
            </div>

            {/* Feature cards */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: '🤖', title: 'AI Brief Generator', body: 'Describe your task in plain English — we turn it into a structured brief automatically.' },
                { icon: '📊', title: 'Verified Score Profiles', body: 'Every student has a Seed Score (aptitude) and Track-Record Score (delivery history).' },
                { icon: '🔐', title: 'Escrow Protection', body: 'Payment releases only after the milestone is verified as delivered. No disputes.' },
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, padding: '14px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10 }}>
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{f.body}</div>
                  </div>
                </div>
              ))}
            </div>

            <Link href="/business" target="_blank" style={{
              display: 'block', textAlign: 'center', padding: '13px',
              background: '#A78BFA', borderRadius: 10, color: '#000',
              fontWeight: 800, fontSize: 14, textDecoration: 'none',
              fontFamily: "'Inter Tight', sans-serif",
            }}>
              Post a Task →
            </Link>
          </>
        )}
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 10, color: 'var(--ink-4)' }}>Real Gigs. Real Students. Real Results.</span>
        <Link href="/" target="_blank" style={{ fontSize: 10, color: 'var(--green)', textDecoration: 'none', fontWeight: 600 }}>Open full site ↗</Link>
      </div>
    </div>
  );
}

export default function EmbedPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg)' }}>
        <div style={{ width: 24, height: 24, border: '2px solid var(--border)', borderTopColor: 'var(--green)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      </div>
    }>
      <EmbedInner />
    </Suspense>
  );
}
