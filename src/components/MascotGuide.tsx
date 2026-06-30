'use client';
import { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const TIPS: Record<string, string> = {
  '/':                      "Aloha 🌺 Post a task or join as a student to get started!",
  '/business':              "Aloha 🌺 Describe your task in plain English — AI builds the brief!",
  '/business/shortlist':    "Aloha 🌺 These are your top matches — ranked by skill + budget fit!",
  '/student/onboarding':    "Aloha 🌺 Answer honestly — your Seed Score sticks with you forever!",
  '/leaderboard':           "Aloha 🌺 Top students get first dibs on the best gigs — keep climbing!",
  '/how-it-works':          "Aloha 🌺 Two scores: one for potential, one for what you actually deliver.",
};

export default function MascotGuide() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'hidden' | 'flying' | 'landing' | 'perched'>('hidden');
  const [dismissed, setDismissed] = useState(false);
  const [tipShown, setTipShown] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const tip = TIPS[pathname] || TIPS['/'];

  useEffect(() => {
    setDismissed(false);
    setTipShown(false);
    setPhase('flying');

    // landing approach
    timerRef.current = setTimeout(() => setPhase('landing'), 1800);
    // fully perched
    const t2 = setTimeout(() => { setPhase('perched'); setTipShown(true); }, 2600);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      clearTimeout(t2);
    };
  }, [pathname]);

  if (phase === 'hidden') return null;

  const isFlying = phase === 'flying';
  const isLanding = phase === 'landing';

  return (
    <>
      <style>{`
        /* ── 3D flight path: sweeps in from top-right, arcs down, banks left ── */
        @keyframes birdFlight3D {
          0%   {
            transform: translate(60vw, -120px) scale(0.3) rotateY(40deg) rotateZ(-15deg);
            opacity: 0;
          }
          15%  {
            transform: translate(30vw, -20px) scale(0.55) rotateY(20deg) rotateZ(-8deg);
            opacity: 1;
          }
          40%  {
            transform: translate(8vw, -60px) scale(0.8) rotateY(-10deg) rotateZ(5deg);
          }
          65%  {
            transform: translate(-2vw, -20px) scale(1.05) rotateY(-20deg) rotateZ(-3deg);
          }
          82%  {
            transform: translate(5px, -8px) scale(1.0) rotateY(0deg) rotateZ(2deg);
          }
          100% {
            transform: translate(0px, 0px) scale(1) rotateY(0deg) rotateZ(0deg);
          }
        }

        @keyframes birdLand {
          0%   { transform: translate(5px, -8px) scale(1.0) rotateZ(2deg); }
          40%  { transform: translate(0, -16px) scale(1.05) rotateZ(-1deg); }
          70%  { transform: translate(0, 2px) scale(0.97) rotateZ(0deg); }
          100% { transform: translate(0, 0px) scale(1) rotateZ(0deg); }
        }

        @keyframes wingFlap {
          0%, 100% { transform: scaleY(1); }
          30%      { transform: scaleY(0.8) translateY(3px); }
          60%      { transform: scaleY(1.05); }
        }

        @keyframes perchBob {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          40%      { transform: translateY(-5px) rotate(-1deg); }
          70%      { transform: translateY(-2px) rotate(1deg); }
        }

        @keyframes tipPop {
          from { opacity: 0; transform: scale(0.8) translateY(10px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(124,181,24,0.3), 0 6px 24px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 0 6px rgba(124,181,24,0.1), 0 6px 24px rgba(0,0,0,0.5); }
        }

        .bird-flying {
          animation:
            birdFlight3D 1.8s cubic-bezier(0.16, 1, 0.3, 1) forwards,
            wingFlap 0.28s linear infinite;
        }
        .bird-landing {
          animation:
            birdLand 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
            wingFlap 0.45s ease-out 2;
        }
        .bird-perched {
          animation: perchBob 2.8s ease-in-out infinite;
        }
        .bird-circle {
          animation: glowPulse 3s ease-in-out infinite;
        }
        .tip-pop {
          animation: tipPop 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>

      {/* Fixed anchor — bird lives here when perched */}
      <div style={{
        position: 'fixed', bottom: 24, right: 22, zIndex: 9999,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12,
        perspective: '800px',
      }}>

        {/* Speech bubble */}
        {tipShown && !dismissed && (
          <div className="tip-pop" style={{
            background: 'linear-gradient(135deg, #1A0060 0%, #0D0040 100%)',
            border: '1px solid rgba(124,181,24,0.4)',
            borderRadius: 16,
            padding: '14px 18px',
            maxWidth: 264,
            boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
            position: 'relative',
          }}>
            {/* Tail triangle */}
            <div style={{
              position: 'absolute', bottom: -8, right: 32,
              width: 0, height: 0,
              borderLeft: '8px solid transparent',
              borderRight: '8px solid transparent',
              borderTop: '8px solid #1A0060',
            }} />
            <p style={{ fontSize: 13, color: '#fff', lineHeight: 1.65, margin: 0 }}>{tip}</p>
            <button
              onClick={() => setDismissed(true)}
              style={{
                marginTop: 10, padding: '5px 16px',
                background: 'var(--green)', color: '#000',
                border: 'none', borderRadius: 6,
                fontSize: 12, fontWeight: 700, cursor: 'pointer',
                letterSpacing: '0.02em',
              }}
            >
              Got it ✓
            </button>
          </div>
        )}

        {/* Bird in circle */}
        <div
          className={`bird-circle ${isFlying ? 'bird-flying' : isLanding ? 'bird-landing' : 'bird-perched'}`}
          onClick={() => { setTipShown(t => !t); setDismissed(false); }}
          style={{
            width: 72, height: 72,
            borderRadius: '50%',
            background: 'linear-gradient(145deg, #1a1a2e 0%, #16213e 100%)',
            border: '2.5px solid rgba(124,181,24,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
            overflow: 'hidden',
          }}
        >
          <Image
            src="/mascot.png"
            alt="Aloha bird"
            width={58}
            height={58}
            style={{ objectFit: 'contain', marginTop: 4 }}
          />
        </div>
      </div>
    </>
  );
}
