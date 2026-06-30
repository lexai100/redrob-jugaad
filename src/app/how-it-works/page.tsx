'use client';
import Link from 'next/link';

const STEPS_STUDENT = [
  {
    num: '01',
    icon: '🎯',
    title: 'Pick your track',
    desc: 'Choose Dev, Design, Content, or Marketing. This tells us where your skills live.',
  },
  {
    num: '02',
    icon: '📝',
    title: 'Take a 35-min assessment',
    desc: 'Part 1 is MCQ (quick thinking). Part 2 is a written response graded by AI — not just right/wrong answers. Your webcam is on to keep it honest.',
  },
  {
    num: '03',
    icon: '🌱',
    title: 'Get your Seed Score',
    desc: 'This is your starting reputation. It\'s set once and never changes — think of it like your entrance exam result.',
  },
  {
    num: '04',
    icon: '💼',
    title: 'Get matched to gigs',
    desc: 'AI finds tasks that match your skills and budget. Accept a gig, complete milestones, and get paid.',
  },
  {
    num: '05',
    icon: '📈',
    title: 'Build your Track Record',
    desc: 'Every milestone you deliver on time moves your Track-Record Score up. Miss deadlines? It drops. This is the score that gets you hired again.',
  },
];

const STEPS_BUSINESS = [
  {
    num: '01',
    icon: '✍️',
    title: 'Describe your task',
    desc: 'Tell us what you need in plain English. Our AI turns it into a structured brief automatically — budget, timeline, milestones.',
  },
  {
    num: '02',
    icon: '🤖',
    title: 'AI shortlists the best matches',
    desc: 'We rank verified students by skill track, budget fit, and delivery record. You see scores, not just CVs.',
  },
  {
    num: '03',
    icon: '🔐',
    title: 'Work with escrow protection',
    desc: 'Payment is held in escrow. It only releases after AI verifies each milestone was actually delivered.',
  },
  {
    num: '04',
    icon: '⭐',
    title: 'Build a talent pipeline',
    desc: 'Students who deliver well for you become your go-to talent. Their Track-Record Score proves they\'re reliable.',
  },
];

const SCORE_MOVES = [
  { event: 'Delivered on time', pts: '+8', color: '#22c55e' },
  { event: 'Delivered a bit late', pts: '+4', color: '#f59e0b' },
  { event: 'Needed revisions', pts: '−3', color: '#f97316' },
  { event: 'Missed deadline', pts: '−10', color: '#ef4444' },
];

export default function HowItWorksPage() {
  return (
    <div style={{ background: 'var(--bg)', color: 'var(--ink)', minHeight: '100vh' }}>

      {/* Hero */}
      <section style={{ padding: '72px 24px 56px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--green)', marginBottom: 14 }}>How It Works</p>
        <h1 style={{ fontSize: 44, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 16, lineHeight: 1.1 }}>
          Simple for students.<br />Powerful for businesses.
        </h1>
        <p style={{ fontSize: 18, color: 'var(--ink-3)', maxWidth: 520, margin: '0 auto 32px' }}>
          No CV games. No fake portfolios. Just verified skills and real delivery history.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/student/onboarding" className="btn-primary" style={{ fontSize: 15, padding: '12px 28px' }}>I'm a Student →</Link>
          <Link href="/business" className="btn-secondary" style={{ fontSize: 15, padding: '12px 28px' }}>I'm a Business →</Link>
        </div>
      </section>

      <div style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px' }}>

        {/* For Students */}
        <section style={{ padding: '64px 0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(124,181,24,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🎓</div>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>For Students — 5 steps to your first gig</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS_STUDENT.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', gap: 20, paddingBottom: 32, position: 'relative' }}>
                {/* Line */}
                {i < STEPS_STUDENT.length - 1 && (
                  <div style={{ position: 'absolute', left: 19, top: 44, width: 2, bottom: 0, background: 'var(--border)' }} />
                )}
                {/* Circle */}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1 }}>
                  {s.icon}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--green)', letterSpacing: '0.08em', marginBottom: 4 }}>STEP {s.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* For Businesses */}
        <section style={{ padding: '64px 0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 36 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(167,139,250,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🏢</div>
            <h2 style={{ fontSize: 26, fontWeight: 800 }}>For Businesses — hire in 4 steps</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {STEPS_BUSINESS.map((s, i) => (
              <div key={s.num} style={{ display: 'flex', gap: 20, paddingBottom: 32, position: 'relative' }}>
                {i < STEPS_BUSINESS.length - 1 && (
                  <div style={{ position: 'absolute', left: 19, top: 44, width: 2, bottom: 0, background: 'var(--border)' }} />
                )}
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-3)', border: '2px solid #A78BFA', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0, zIndex: 1 }}>
                  {s.icon}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#A78BFA', letterSpacing: '0.08em', marginBottom: 4 }}>STEP {s.num}</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 6 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7 }}>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* The Two Scores — plain English */}
        <section style={{ padding: '64px 0 48px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>The two scores, explained simply</h2>
          <p style={{ color: 'var(--ink-3)', fontSize: 15, marginBottom: 36 }}>Every student has two numbers. Here's what they actually mean.</p>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {/* Seed Score */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderTop: '3px solid #A78BFA', borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>🌱</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#A78BFA', marginBottom: 6 }}>SEED SCORE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Your starting point</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 16 }}>
                Think of it like a college entrance exam — taken once, honest, hard to fake. It reflects your raw potential based on a proctored assessment.
              </p>
              <div style={{ padding: '10px 14px', background: 'rgba(167,139,250,0.08)', borderRadius: 8, fontSize: 13, color: '#A78BFA', fontWeight: 600 }}>
                Set once · Never changes
              </div>
            </div>

            {/* Track-Record Score */}
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderTop: '3px solid var(--green)', borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>📈</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 6 }}>TRACK-RECORD SCORE</div>
              <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>Your delivery reputation</h3>
              <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 16 }}>
                This moves every time you complete a milestone. Deliver on time consistently and it climbs. This is the number businesses actually care about.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {SCORE_MOVES.map(m => (
                  <div key={m.event} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: 'var(--bg-3)', borderRadius: 8 }}>
                    <span style={{ fontSize: 13, color: 'var(--ink-3)' }}>{m.event}</span>
                    <span style={{ fontSize: 14, fontWeight: 800, color: m.color, fontFamily: "'Inter Tight', sans-serif" }}>{m.pts}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <div style={{ height: 1, background: 'var(--border)' }} />

        {/* FAQ */}
        <section style={{ padding: '64px 0 80px' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32 }}>Quick answers</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { q: 'Can I retake the assessment?', a: 'No — your Seed Score is locked after your first attempt. This is what makes it trustworthy. You can still improve your Track-Record Score infinitely through real work.' },
              { q: 'How does proctoring work?', a: 'Your webcam stays on during the assessment. We use MediaPipe to check gaze direction and head pose in real time. If we detect sustained phone use or tab switching, time is deducted.' },
              { q: 'When does payment release?', a: 'Payment is held in escrow and only releases after our AI verifies the milestone was delivered. Businesses are protected, and students are guaranteed payment for real work.' },
              { q: 'What if my submitted work needs changes?', a: 'Minor revisions are part of the process. If a milestone needs revision, your Track-Record Score drops by 3 points. Missing a deadline entirely drops it by 10.' },
              { q: 'Is this only for Indian students?', a: 'Right now we\'re focused on Indian students and small businesses, but the platform is built to scale globally. Real Gigs. Real Students. Real Results.' },
            ].map((item, i) => (
              <div key={i} style={{ background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px' }}>
                <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 8, color: 'var(--ink)' }}>{item.q}</p>
                <p style={{ fontSize: 14, color: 'var(--ink-3)', lineHeight: 1.7 }}>{item.a}</p>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* CTA */}
      <section style={{ borderTop: '1px solid var(--border)', background: 'var(--bg-2)', padding: '64px 24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 12 }}>Ready to jump in?</h2>
        <p style={{ fontSize: 16, color: 'var(--ink-3)', marginBottom: 28 }}>No signup needed to explore. Just click and see it work.</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/student/onboarding" className="btn-primary" style={{ fontSize: 15, padding: '13px 28px' }}>Take the Assessment →</Link>
          <Link href="/business" className="btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>Post a Task →</Link>
          <Link href="/leaderboard" className="btn-secondary" style={{ fontSize: 15, padding: '13px 28px' }}>See Leaderboard</Link>
        </div>
      </section>
    </div>
  );
}
