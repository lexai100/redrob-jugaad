'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';

const TRACKS = [
  { id: 'Dev',       icon: '💻', accent: '#A3E635', desc: 'Code · DSA · APIs' },
  { id: 'Design',    icon: '🎨', accent: '#818CF8', desc: 'UI/UX · Brand Kits' },
  { id: 'Content',   icon: '🎬', accent: '#F97316', desc: 'Reels · Writing' },
  { id: 'Marketing', icon: '📈', accent: '#38BDF8', desc: 'Growth · Ads' },
];

const LIVE_FEED = [
  { icon: '✅', text: "Arjun's logo milestone approved — ₹800 released", track: 'Design', color: '#818CF8' },
  { icon: '🎯', text: 'New match: Instagram Reels for Masala startup — ₹1,200', track: 'Content', color: '#F97316' },
  { icon: '🏆', text: 'Priya climbed to #3 on Dev leaderboard', track: 'Dev', color: '#A3E635' },
  { icon: '⚡', text: 'AI brief generated in 3.8s for "fix login bug"', track: 'Dev', color: '#A3E635' },
  { icon: '🎯', text: 'New match: Brand Identity for Chai brand — ₹2,500', track: 'Design', color: '#818CF8' },
  { icon: '✅', text: "Rahul's reel approved — portfolio entry created", track: 'Content', color: '#F97316' },
  { icon: '📊', text: 'Sneha earned 94 Seed Score on Marketing track', track: 'Marketing', color: '#38BDF8' },
];

const STEPS = [
  { num: '01', icon: '🎙️', title: 'Describe the task',       desc: 'Plain English — AI handles the rest.' },
  { num: '02', icon: '🤖', title: 'AI structures the brief',  desc: 'Scope, budget, timeline, acceptance criteria.' },
  { num: '03', icon: '🎯', title: 'Ranked student shortlist', desc: 'Best-matched students in seconds.' },
  { num: '04', icon: '📋', title: 'Milestone-based work',     desc: 'Small deliverables, not one risky handoff.' },
  { num: '05', icon: '✅', title: 'AI verifies each step',    desc: 'Every milestone checked against the brief.' },
  { num: '06', icon: '🏆', title: 'Pay & build portfolio',    desc: 'Verified resume entry on approval.' },
];

export default function LandingPage() {
  const [feedIdx, setFeedIdx] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setFeedIdx(i => (i + 1) % LIVE_FEED.length);
        setVisible(true);
      }, 400);
    }, 3000);
    return () => clearInterval(t);
  }, []);

  const feed = LIVE_FEED[feedIdx];

  return (
    <div style={{ background: '#0A0A0A' }}>
      <style>{`
        @keyframes floatA { 0%,100%{transform:translateY(0px) rotate(0deg);} 50%{transform:translateY(-18px) rotate(2deg);} }
        @keyframes floatB { 0%,100%{transform:translateY(0px) rotate(0deg);} 50%{transform:translateY(-12px) rotate(-2deg);} }
        @keyframes floatC { 0%,100%{transform:translateY(0px);} 50%{transform:translateY(-22px);} }
        @keyframes gradientShift { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
        @keyframes gridFade { from{opacity:0;} to{opacity:1;} }
        @keyframes feedIn { from{opacity:0;transform:translateY(8px);} to{opacity:1;transform:translateY(0);} }
        @keyframes feedOut { from{opacity:1;transform:translateY(0);} to{opacity:0;transform:translateY(-8px);} }
        .feed-item { animation: feedIn 0.4s ease both; }
        .feed-item-out { animation: feedOut 0.3s ease both; }
        .float-a { animation: floatA 6s ease-in-out infinite; }
        .float-b { animation: floatB 5s ease-in-out infinite 1s; }
        .float-c { animation: floatC 7s ease-in-out infinite 0.5s; }
        .hero-grid {
          background-image: linear-gradient(rgba(124,181,24,0.06) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(124,181,24,0.06) 1px, transparent 1px);
          background-size: 60px 60px;
          animation: gridFade 1.5s ease both;
        }
      `}</style>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="hero-grid" style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        position: 'relative', overflow: 'hidden',
        padding: '100px 24px 60px',
      }}>
        {/* Ambient glows */}
        <div style={{ position: 'absolute', top: '15%', left: '8%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,181,24,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '40%', right: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(129,140,248,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '30%', width: 500, height: 200, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,181,24,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

        {/* Live ticker */}
        <div style={{ marginBottom: 36, height: 36, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            background: 'rgba(124,181,24,0.12)', border: '1px solid rgba(124,181,24,0.25)',
            borderRadius: 99, padding: '4px 12px', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)', display: 'inline-block', animation: 'pulse 1.5s infinite' }} />
            <span style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.06em' }}>LIVE</span>
          </div>
          <div key={feedIdx} className={visible ? 'feed-item' : 'feed-item-out'} style={{
            fontSize: 12, color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6,
          }}>
            <span style={{ color: feed.color }}>{feed.icon}</span>
            <span>{feed.text}</span>
            <span style={{ background: feed.color + '18', color: feed.color, fontSize: 10, fontWeight: 700, padding: '1px 7px', borderRadius: 4 }}>{feed.track}</span>
          </div>
        </div>

        {/* Headline */}
        <div style={{ textAlign: 'center', maxWidth: 780 }}>
          <h1 style={{
            fontSize: 'clamp(44px, 7vw, 80px)',
            fontWeight: 900, lineHeight: 1.0,
            letterSpacing: '-0.04em',
            marginBottom: 24, color: '#fff',
            fontFamily: "'Inter Tight', sans-serif",
          }}>
            India's gig economy,<br />
            <span style={{
              background: 'linear-gradient(90deg, #7CB518 0%, #A3E635 50%, #7CB518 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              animation: 'gradientShift 3s linear infinite',
            }}>finally verified.</span>
          </h1>
          <p style={{ fontSize: 'clamp(18px, 2.5vw, 26px)', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '-0.01em', marginBottom: 16, fontFamily: "'Inter Tight', sans-serif" }}>
            Real gigs.&nbsp;&nbsp;Real students.&nbsp;&nbsp;<span style={{ color: 'var(--green)' }}>Real results.</span>
          </p>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7, marginBottom: 40, maxWidth: 520, margin: '0 auto 40px' }}>
            Small businesses post tasks in plain language. College students get matched, assessed, and paid — with AI verifying every milestone.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 56 }}>
            <Link href="/business" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>Post a Task →</Link>
            <Link href="/student/onboarding" className="btn-secondary" style={{ fontSize: 16, borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Join as Student</Link>
          </div>
        </div>

        {/* Floating metric cards */}
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { v: '63M+', l: 'Small businesses in India', icon: '🏪', cls: 'float-a' },
            { v: '40M+', l: 'College students', icon: '🎓', cls: 'float-b' },
            { v: '< 5s',  l: 'AI brief generation', icon: '⚡', cls: 'float-c' },
            { v: '4',     l: 'Skill tracks', icon: '🎯', cls: 'float-a' },
          ].map(s => (
            <div key={s.v} className={s.cls} style={{
              background: 'rgba(255,255,255,0.04)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, padding: '20px 28px',
              textAlign: 'center', minWidth: 140,
            }}>
              <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', fontFamily: "'Inter Tight', sans-serif", lineHeight: 1 }}>{s.v}</div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* Bottom fade */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 120, background: 'linear-gradient(transparent, var(--bg))', pointerEvents: 'none' }} />
      </section>

      {/* ── TRUST & VERIFICATION ── */}
      <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)', padding: '72px 48px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Built on Trust</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16, lineHeight: 1.2 }}>Every claim is verified.<br />No exceptions.</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
              <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
                Assessments are <strong style={{ color: 'var(--ink-2)' }}>webcam-monitored</strong> to keep them honest.
              </p>
              <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
                Written answers are <strong style={{ color: 'var(--ink-2)' }}>scored by AI on a rubric</strong> — not just keywords.
              </p>
              <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
                Payment only releases <strong style={{ color: 'var(--ink-2)' }}>after work is verified</strong>.
              </p>
            </div>
            <Link href="/student/onboarding" className="btn-primary" style={{ fontSize: 14 }}>Try the Assessment →</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { icon: '📸', title: 'Monitored Assessments', body: 'Your webcam stays on during the test. Suspicious behaviour is flagged automatically — keeping scores trustworthy for everyone.', dot: '#818CF8' },
              { icon: '📝', title: 'AI-Graded Written Answers', body: 'Written responses are graded against a clear rubric by AI — not just pattern-matched. You get a fair, consistent score every time.', dot: '#A3E635' },
              { icon: '🔐', title: 'Pay Only for Delivered Work', body: 'Payment is held safely and released only after the submitted milestone is verified as complete. No disputes, no ghosting.', dot: '#F97316' },
            ].map((n, i) => (
              <div key={i} style={{
                background: 'var(--bg-3)', border: '1px solid var(--border)',
                borderLeft: `3px solid ${n.dot}`,
                borderRadius: 10, padding: '16px 18px',
                display: 'flex', alignItems: 'flex-start', gap: 14,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{n.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--ink)', marginBottom: 4 }}>{n.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.6 }}>{n.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ marginBottom: 52 }}>
          <p style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>How It Works</p>
          <h2 style={{ fontSize: 36, fontWeight: 800 }}>From idea to delivered work in one flow</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
          {STEPS.map((s, i) => (
            <div key={s.num} style={{
              padding: '28px 32px',
              borderTop: '1px solid var(--border)',
              borderLeft: i % 3 !== 0 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ fontSize: 11, color: 'var(--ink-4)', fontWeight: 700, marginBottom: 12, letterSpacing: '0.05em' }}>STEP {s.num}</div>
              <div style={{ fontSize: 26, marginBottom: 10 }}>{s.icon}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCORE SYSTEM ── */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '80px 48px', background: 'var(--bg-2)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>The Score System</p>
            <h2 style={{ fontSize: 36, fontWeight: 800 }}>Two scores. One truth.</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', marginTop: 12 }}>A one-time test can be gamed. Real delivery can't.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, maxWidth: 860, margin: '0 auto' }}>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderTop: '3px solid #A78BFA', borderRadius: 14, padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🧪</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#A78BFA' }}>Seed Score</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Set once · Never changes</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8, marginBottom: 16 }}>
                Your <strong style={{ color: '#A78BFA' }}>starting potential</strong>. Measured once at onboarding via an AI-resistant, rubric-graded assessment. It's your raw aptitude — honest and hard to fake.
              </p>
              <div style={{ padding: '10px 14px', background: 'rgba(167,139,250,0.07)', borderRadius: 8, fontSize: 13, color: 'var(--ink-3)' }}>
                💡 Like an entrance exam — honest, one-time, unfakeable.
              </div>
            </div>
            <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderTop: '3px solid var(--green)', borderRadius: 14, padding: 32 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(124,181,24,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>📈</div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--green)' }}>Track-Record Score</div>
                  <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>Live · Updates after every gig</div>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.8, marginBottom: 16 }}>
                Your <strong style={{ color: 'var(--green)' }}>proven delivery</strong>. Every milestone you complete moves this score. Consistent on-time work builds a reputation that gets you hired again.
              </p>
              <div style={{ padding: '10px 14px', background: 'rgba(124,181,24,0.07)', borderRadius: 8, fontSize: 13, color: 'var(--ink-3)' }}>
                💡 Like a GPA that actually reflects what you deliver.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRACKS ── */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '80px 48px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
          <div>
            <p style={{ fontSize: 11, color: 'var(--green)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Skill Tracks</p>
            <h2 style={{ fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Four tracks.<br />One platform.</h2>
            <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 28 }}>Join a track, pass the assessment, earn a Seed Score. Every gig you complete moves your Track-Record Score.</p>
            <Link href="/student/onboarding" className="btn-primary">Take the Assessment →</Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {TRACKS.map(t => (
              <div key={t.id} style={{
                padding: '20px', background: 'var(--bg-2)', border: '1px solid var(--border)',
                borderRadius: 12, borderTop: `2px solid ${t.accent}`, transition: 'all 0.15s',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-3)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'var(--bg-2)'; }}
              >
                <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: t.accent, marginBottom: 4, fontFamily: "'Inter Tight', sans-serif" }}>{t.id}</div>
                <div style={{ fontSize: 12, color: 'var(--ink-4)' }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ borderTop: '1px solid var(--border)', padding: '80px 48px', textAlign: 'center', background: 'var(--bg-2)' }}>
        <h2 style={{ fontSize: 40, fontWeight: 800, marginBottom: 14 }}>Ready to see it live?</h2>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 32 }}>No signup. No setup. Just click and watch the AI work.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/business" className="btn-primary" style={{ fontSize: 16, padding: '14px 32px' }}>Post a Task →</Link>
          <Link href="/student/s1" className="btn-secondary" style={{ fontSize: 16 }}>View Student Profile</Link>
          <Link href="/leaderboard" className="btn-secondary" style={{ fontSize: 16 }}>See Leaderboard</Link>
        </div>
      </section>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>Redrob Jugaad · India Runs Hackathon 2026</span>
        <span style={{ fontSize: 13, color: 'var(--ink-4)' }}>Powered by Groq · LLaMA 3.3 70B</span>
      </footer>
    </div>
  );
}
