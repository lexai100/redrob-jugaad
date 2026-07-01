'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
const ProctoringOverlay = dynamic(() => import('@/components/ProctoringOverlay'), { ssr: false });

type Track = 'Dev' | 'Design' | 'Content' | 'Marketing';

const TRACKS = [
  { id: 'Dev' as Track, icon: '💻', color: '#2A0E72', desc: 'Coding, DSA, web dev, APIs' },
  { id: 'Design' as Track, icon: '🎨', color: '#5E7D00', desc: 'UI/UX, brand kits, graphics' },
  { id: 'Content' as Track, icon: '🎬', color: '#C2410C', desc: 'Reels, writing, video editing' },
  { id: 'Marketing' as Track, icon: '📈', color: '#0369A1', desc: 'Growth, ads, social strategy' },
];

// ─── AI-RESISTANT DSA QUESTIONS ─────────────────────────────────────────────
// These are code-tracing & bug-finding questions — you can't just paste them into ChatGPT
// because the answer requires mentally executing specific code, not generating code.

const DEV_QUESTIONS = [
  {
    id: 'q1',
    type: 'trace',
    question: 'What does this Python function print when called as mystery([3, 1, 4, 1, 5, 9, 2, 6])?',
    code: `def mystery(arr):
    seen = set()
    result = []
    for x in arr:
        if x not in seen:
            seen.add(x)
            result.append(x)
    return result[-1] if result else None

print(mystery([3, 1, 4, 1, 5, 9, 2, 6]))`,
    options: ['6', '2', '9', 'None'],
    correct: 0,
    explanation: 'Iterates and keeps only first occurrences: [3,1,4,5,9,2,6]. Last element is 6.',
  },
  {
    id: 'q2',
    type: 'bug',
    question: 'This code is supposed to check if a string is a palindrome, but it has a bug. Which line is wrong?',
    code: `def is_palindrome(s):
    left, right = 0, len(s)          # Line A
    while left < right:
        if s[left] != s[right]:      # Line B
            return False
        left += 1
        right -= 1
    return True`,
    options: [
      'Line A: should be len(s) - 1',
      'Line B: should use s[left] == s[right]',
      'The while condition should be left <= right',
      'left and right should start at 1',
    ],
    correct: 0,
    explanation: 'right = len(s) causes IndexError on Line B. It should be len(s) - 1.',
  },
  {
    id: 'q3',
    type: 'complexity',
    question: 'What is the time complexity of this function?',
    code: `def process(nums):
    n = len(nums)
    count = 0
    for i in range(n):
        j = 1
        while j < n:
            count += nums[i] + nums[j]
            j *= 2
    return count`,
    options: ['O(n²)', 'O(n log n)', 'O(n)', 'O(log n)'],
    correct: 1,
    explanation: 'Outer for loop runs n times → O(n). Inner while loop doubles j each iteration so runs log₂(n) times → O(log n). Combined: O(n log n).',
  },
  {
    id: 'q4',
    type: 'output',
    question: 'What is the output of this JavaScript code?',
    code: `const arr = [1, 2, 3, 4, 5];
const result = arr
  .filter(x => x % 2 === 0)
  .map(x => x * x)
  .reduce((acc, x) => acc + x, 0);

console.log(result);`,
    options: ['20', '4', '16', 'Error'],
    correct: 0,
    explanation: 'filter → [2,4]. map → [4,16]. reduce → 0+4+16 = 20.',
  },
  {
    id: 'q5',
    type: 'trace',
    question: 'You are given this recursive function. What is f(5)?',
    code: `def f(n):
    if n <= 1:
        return n
    if n % 2 == 0:
        return f(n // 2) + 1
    return f(n - 1) + 2`,
    options: ['7', '5', '9', '6'],
    correct: 1,
    explanation: 'Trace: f(5)→f(4)+2, f(4)→f(2)+1, f(2)→f(1)+1=2, f(4)=3, f(5)=5. Answer: 5.',
  },
];

// ─── DOMAIN ASSESSMENT QUESTIONS ────────────────────────────────────────────
// Scenario-based, evaluates judgment not just knowledge

const DESIGN_QUESTIONS = [
  {
    q: 'A D2C snack brand targeting Gen Z asks you to redesign their logo. Their current logo is very formal and corporate. They want it to feel "fun but trustworthy." What is your FIRST step?',
    options: [
      'Open Figma and start exploring typography options',
      'Ask for existing brand assets, competitor logos, and a mood board from the founder',
      'Research color psychology for food brands',
      'Create 3 logo concepts and present them',
    ],
    correct: 1,
    explanation: 'Discovery first. Without understanding existing assets and competitive landscape, you risk going in the wrong direction entirely.',
  },
  {
    q: 'You are 80% through a UI design project when the client says "actually, can we change the color palette from blue to green?" What do you do?',
    options: [
      'Make the change immediately — client is always right',
      'Decline — the brief was already agreed upon',
      'Assess the scope change, update the brief, agree on revised timeline/budget if needed',
      'Change the primary color only and see if they notice the rest',
    ],
    correct: 2,
    explanation: 'Scope changes should be documented and re-agreed. Just saying yes without updating the brief leads to scope creep.',
  },
  {
    q: 'A client wants their landing page to have 12 different fonts because "each section should have its own personality." What do you say?',
    options: [
      'Do exactly what they say — it\'s their brand',
      'Explain that 2-3 fonts max creates visual hierarchy; more creates chaos and weakens brand identity',
      'Use all 12 but keep sizes very similar',
      'Use 12 fonts but only in headings',
    ],
    correct: 1,
    explanation: 'Good design judgment means pushing back respectfully with a clear rationale rooted in design principles.',
  },
];

const CONTENT_QUESTIONS = [
  {
    q: 'You\'re editing a 60-second Reel for a spice brand. The client sends raw footage — 18 minutes of cooking shots, no sound design, no script. What\'s your editing approach?',
    options: [
      'Cut everything into 3-second clips and add trending audio',
      'First identify the 3-5 hero moments in the footage, build narrative arc, THEN add sound',
      'Use all 18 minutes — more footage is better',
      'Ask client to reshoot with a script first',
    ],
    correct: 1,
    explanation: 'Story-first editing. Short-form content needs a clear emotional arc, not just rapid cuts. Identifying hero moments is step one.',
  },
  {
    q: 'A client\'s Instagram caption gets 200 views but 0 saves or shares. The hook is "Check out our new product!" What\'s the root problem?',
    options: [
      'The image is probably low quality',
      'The hook doesn\'t create curiosity, urgency, or value — there\'s no reason to stop scrolling',
      'They need to post more frequently',
      'The hashtags are wrong',
    ],
    correct: 1,
    explanation: 'Hook quality drives stop-rate. "Check out our product" gives the audience zero reason to engage. A hook must earn their attention in 1-2 seconds.',
  },
  {
    q: 'You are creating content for two different brands: a luxury perfume brand and a budget streetwear brand. Both want a video about "new arrivals." What is DIFFERENT about your approach?',
    options: [
      'Nothing — just change the products shown',
      'Tone, pacing, color grading, music style, and caption language — every element reflects brand identity',
      'Only the music should change',
      'Use slower cuts for luxury, faster for streetwear',
    ],
    correct: 1,
    explanation: 'Brand identity permeates every production decision. A luxury brand uses slow pans, silence, minimal text. Streetwear uses kinetic energy, bold typography, drop culture language.',
  },
];

const MARKETING_QUESTIONS = [
  {
    q: 'A food startup with ₹5,000 asks you "should we run Google Ads or Meta Ads?" What\'s your answer?',
    options: [
      'Google Ads — always better for e-commerce',
      'Meta Ads — better reach for the budget',
      'Depends: if they want demand capture (people already searching), Google. If they want demand creation (discovery), Meta. Ask what they need.',
      'Split 50/50',
    ],
    correct: 2,
    explanation: 'There is no universal answer. The right platform depends on the customer journey stage. Asking the right question is the skill.',
  },
  {
    q: 'You ran an Instagram campaign for a brand. Reach: 50,000. Link clicks: 200. Sales: 3. The client says "the campaign failed." How do you respond?',
    options: [
      'Agree and apologize',
      'Say the campaign succeeded — 50K reach is great',
      'Analyze the funnel: good reach, low CTR (0.4%) suggests creative issue; low conversion (1.5% of clicks) suggests landing page/offer issue. Present data and proposed fixes.',
      'Blame the Instagram algorithm',
    ],
    correct: 2,
    explanation: 'Data literacy and funnel thinking. A marketer\'s job is to diagnose which part of the funnel broke, not just report numbers.',
  },
  {
    q: 'A client wants to grow from 800 to 5,000 followers in 2 weeks organically. What do you tell them?',
    options: [
      'It\'s possible — you just need the right hashtags',
      'That\'s 525% growth in 14 days organically. Set realistic expectations: 2-3x growth is achievable organically; this target likely needs paid amplification or a viral moment.',
      'Impossible, give up',
      'Buy followers to get there faster',
    ],
    correct: 1,
    explanation: 'Integrity and expectation setting. Good marketers don\'t overpromise. They set realistic targets, explain what\'s achievable, and suggest the right levers.',
  },
];

// ─── SUBJECTIVE QUESTIONS PER TRACK ─────────────────────────────────────────
const SUBJECTIVE_QUESTIONS: Record<Track, { question: string; rubric: string; maxMarks: number; placeholder: string }> = {
  Dev: {
    question: 'You are building a URL shortener service like bit.ly that needs to handle 1 million URL shortenings per day. In 150-250 words, describe your high-level system design — specifically how you would generate short codes, where you would store them, and what your biggest concern about scale would be. Use your own reasoning, not textbook answers.',
    rubric: '1 mark: correctly identifies the need to generate unique short codes (hashing, counter, or random). 2 marks: proposes a concrete storage strategy (e.g., relational DB, key-value store) and explains WHY that choice fits the scale. 1 mark: identifies a real scale concern (collision, read/write ratio, cache invalidation) specific to this system. 1 mark: shows personal reasoning or trade-off thinking (e.g., "I would choose X over Y because...").',
    maxMarks: 5,
    placeholder: 'Describe your design reasoning... What storage would you use and why? What would you be most worried about at 1M requests/day?',
  },
  Design: {
    question: 'A client runs a 10-year-old family-owned bakery in Pune. They want to expand online and have asked you to redesign their brand identity. Their current brand uses Comic Sans, bright yellow, and a cartoon cupcake. In 150-250 words, walk through your thinking process: what would you keep, what would you change, and why? Show your judgment, not just design rules.',
    rubric: '1 mark: acknowledges what to KEEP (heritage, warmth, approachability) rather than scrapping everything. 2 marks: proposes specific, justified changes (font, color palette, or logo direction) with reasoning tied to the business goal. 1 mark: considers the target audience and online context specifically (not just general design principles). 1 mark: demonstrates personal design judgment or past experience shaping the recommendation.',
    maxMarks: 5,
    placeholder: 'Walk through your thinking... What stays? What changes? Why? What would you present to the client first?',
  },
  Content: {
    question: 'You have been given 45 seconds of raw footage: a founder talking about their product in a dimly lit room, shaky camera, no music. The client wants a polished Instagram Reel that gets saves. In 150-250 words, describe your editing strategy step by step — from selecting which parts of the footage to use, to what you would add in post. Be specific about your tools and choices.',
    rubric: '1 mark: starts with SELECTING the best moments from footage (not editing everything). 2 marks: describes specific post-production decisions (color grade, audio correction, music choice, captions) with reasoning. 1 mark: makes at least one specific choice about hook or CTA that serves the goal of getting SAVES specifically. 1 mark: demonstrates practical experience or personal editing instinct in the approach.',
    maxMarks: 5,
    placeholder: 'Walk through your edit step by step... What do you cut? What do you add? Why would this get saves?',
  },
  Marketing: {
    question: 'A D2C protein bar brand has ₹20,000 to spend on digital marketing this month. Their product costs ₹120, their average order value is ₹360, and they have never run paid ads before. In 150-250 words, tell them exactly how you would spend this budget, which platform you would use, and what metrics you would track to know if it worked. Show your strategic thinking.',
    rubric: '1 mark: asks about or acknowledges missing information (target audience, margin, ROAS target) before committing — or notes assumptions. 2 marks: recommends a specific platform with a clear rationale tied to the product category and first-time advertiser constraint. 1 mark: proposes specific metrics (CAC, ROAS, CTR, CPM) tied to the actual goal, not generic analytics. 1 mark: shows budget allocation thinking (e.g., testing budget vs. scaling budget) appropriate to ₹20K.',
    maxMarks: 5,
    placeholder: 'How would you spend ₹20,000? Which platform, which audience, what creative, and what metrics?',
  },
};

type GradeResult = {
  totalScore: number;
  breakdown: { criterion: string; maxMarks: number; awarded: number; feedback: string }[];
  overallFeedback: string;
  aiLikelihood: number;
  aiSignals: string;
  humanIndicators: string[];
  strengthsFound: string[];
};

function OnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preTrack = searchParams.get('track') as Track | null;

  const [step, setStep] = useState<'track' | 'assessment' | 'subjective' | 'result'>(preTrack ? 'assessment' : 'track');

  // ── Timer (seconds) ──────────────────────────────────────────────────────
  const MCQ_TIME = 20 * 60;   // 20 min
  const SUBJ_TIME = 15 * 60;  // 15 min
  const PENALTY_SECS = 3 * 60; // -3 min per violation
  const [timeLeft, setTimeLeft] = useState(MCQ_TIME);
  const timerRef2 = useRef<NodeJS.Timeout | null>(null);
  // Track whether each phase timer has been initialized so going BACK doesn't reset it
  const assessmentInitialized = useRef(false);
  const subjectiveInitialized = useRef(false);

  // ── Screen lock state ────────────────────────────────────────────────────
  const [lockWarning, setLockWarning] = useState('');
  const [violations, setViolations] = useState(0);
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(preTrack);
  const [devAnswers, setDevAnswers] = useState<Record<string, number>>({});
  const [domainAnswers, setDomainAnswers] = useState<number[]>([]);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const [mcqScore, setMcqScore] = useState(0);
  const [seedScore, setSeedScore] = useState(0);
  const [disqualified, setDisqualified] = useState(false);

  // Subjective phase
  const [subjAnswer, setSubjAnswer] = useState('');
  const [grading, setGrading] = useState(false);
  const [gradeResult, setGradeResult] = useState<GradeResult | null>(null);
  const [gradeError, setGradeError] = useState('');

  const getQuestions = () => {
    if (selectedTrack === 'Dev') return DEV_QUESTIONS;
    if (selectedTrack === 'Design') return DESIGN_QUESTIONS;
    if (selectedTrack === 'Content') return CONTENT_QUESTIONS;
    if (selectedTrack === 'Marketing') return MARKETING_QUESTIONS;
    return [];
  };

  const calcMcqScore = () => {
    if (selectedTrack === 'Dev') {
      const correct = DEV_QUESTIONS.filter(q => devAnswers[q.id] === q.correct).length;
      return Math.round(55 + (correct / DEV_QUESTIONS.length) * 45);
    } else {
      if (domainAnswers.length === 0) return 60;
      const correct = domainAnswers.filter((a, i) => a === getQuestions()[i]?.correct).length;
      return Math.round(55 + (correct / getQuestions().length) * 45);
    }
  };

  const submitSubjective = async () => {
    if (!selectedTrack || subjAnswer.trim().length < 50) return;
    setGrading(true); setGradeError('');
    const sq = SUBJECTIVE_QUESTIONS[selectedTrack];
    try {
      const res = await fetch('/api/grade-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: sq.question, rubric: sq.rubric, answer: subjAnswer, maxMarks: sq.maxMarks, track: selectedTrack }),
      });
      const data = await res.json();
      if (data.result) {
        setGradeResult(data.result);
        const mcq = calcMcqScore();
        setMcqScore(mcq);
        // Weighted: MCQ 60%, Subjective 40%
        const subjPct = (data.result.totalScore / sq.maxMarks);
        const final = Math.round(mcq * 0.6 + subjPct * 45 * 0.4 + 55 * 0.4);
        setSeedScore(Math.min(100, final));
        setStep('result');
      } else {
        setGradeError(data.error || 'Grading failed. Please try again.');
      }
    } catch { setGradeError('Network error. Please try again.'); }
    setGrading(false);
  };

  const allAnswered = selectedTrack === 'Dev'
    ? Object.keys(devAnswers).length >= DEV_QUESTIONS.length
    : domainAnswers.filter(a => a !== undefined).length >= getQuestions().length;

  const track = TRACKS.find(t => t.id === selectedTrack);

  // ── Timer tick — runs whenever exam is active ──────────────────────────
  useEffect(() => {
    if (step !== 'assessment' && step !== 'subjective') return;

    // Only set initial time the FIRST time each phase is entered
    if (step === 'assessment' && !assessmentInitialized.current) {
      assessmentInitialized.current = true;
      setTimeLeft(MCQ_TIME);
    }
    if (step === 'subjective' && !subjectiveInitialized.current) {
      subjectiveInitialized.current = true;
      setTimeLeft(SUBJ_TIME);
    }

    // Always (re)start the interval when re-entering an active phase
    if (timerRef2.current) clearInterval(timerRef2.current);
    timerRef2.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef2.current!); submitSubjective(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef2.current) clearInterval(timerRef2.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const isExamActive = step === 'assessment' || step === 'subjective';
  const timerCritical = timeLeft < 120; // < 2 min = red

  // ── Screen lock: fullscreen + tab/window switch detection ────────────────
  const enterFullscreen = () => {
    document.documentElement.requestFullscreen().catch(() => {});
  };

  useEffect(() => {
    if (!isExamActive) return;

    const onBlur = () => {
      setLockWarning('⚠️ Window switch detected! -3 minutes penalty.');
      setViolations(v => v + 1);
      setTimeLeft(t => Math.max(0, t - PENALTY_SECS));
      setTimeout(() => setLockWarning(''), 4000);
    };
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        setLockWarning('⚠️ Tab switch detected! -3 minutes penalty.');
        setViolations(v => v + 1);
        setTimeLeft(t => Math.max(0, t - PENALTY_SECS));
        setTimeout(() => setLockWarning(''), 4000);
      }
    };
    const onFullscreen = () => {
      if (!document.fullscreenElement) {
        setLockWarning('⚠️ Fullscreen exited! Returning you to fullscreen. -5 minutes penalty.');
        setViolations(v => v + 1);
        setTimeLeft(t => Math.max(0, t - 5 * 60));
        // Force re-entry immediately
        setTimeout(() => {
          document.documentElement.requestFullscreen().catch(() => {});
          setLockWarning('');
        }, 1500);
      }
    };

    // Screenshot / print blocking — instant disqualification
    const onKeyDown = (e: KeyboardEvent) => {
      const blocked =
        e.key === 'PrintScreen' ||
        (e.ctrlKey && e.key === 'p') ||
        (e.ctrlKey && e.key === 's') ||
        (e.ctrlKey && e.shiftKey && e.key === 'S') ||
        (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key));
      if (blocked) {
        e.preventDefault();
        e.stopPropagation();
        navigator.clipboard?.writeText('').catch(() => {});
        // TERMINATE assessment immediately
        if (timerRef2.current) clearInterval(timerRef2.current);
        setSeedScore(0);
        setMcqScore(0);
        setDisqualified(true);
        setStep('result');
        // Exit fullscreen so the disqualification screen shows clearly
        document.exitFullscreen?.().catch(() => {});
      }
    };

    window.addEventListener('blur', onBlur);
    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('fullscreenchange', onFullscreen);
    window.addEventListener('keydown', onKeyDown, true);
    return () => {
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('visibilitychange', onVisibility);
      document.removeEventListener('fullscreenchange', onFullscreen);
      window.removeEventListener('keydown', onKeyDown, true);
    };
  }, [isExamActive]);

  return (
    <div style={{ maxWidth: 720, margin: '0 auto', padding: '40px 24px' }}>

      {/* Screen lock violation flash banner */}
      {lockWarning && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
          background: '#DC2626', color: '#fff', textAlign: 'center',
          padding: '14px 24px', fontSize: 15, fontWeight: 700,
          animation: 'fadeIn 0.2s ease',
        }}>
          {lockWarning}
        </div>
      )}

      {/* Real MediaPipe proctoring */}
      <ProctoringOverlay active={isExamActive} />

      {/* Progress bar + timer */}
      {isExamActive && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 0, background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', marginBottom: 10 }}>
            {['Part 1: MCQ', 'Part 2: Written', 'Results'].map((label, i) => {
              const s = step as string;
              const active = (i === 0 && s === 'assessment') || (i === 1 && s === 'subjective') || (i === 2 && s === 'result');
              const done   = (i === 0 && s === 'subjective') || ((i <= 1) && s === 'result');
              return (
                <div key={label} style={{
                  flex: 1, padding: '10px 16px', fontSize: 12, fontWeight: 600, textAlign: 'center',
                  background: active ? 'var(--green)' : done ? 'rgba(124,181,24,0.15)' : 'transparent',
                  color: active ? '#000' : done ? 'var(--green)' : 'var(--ink-4)',
                  borderRight: i < 2 ? '1px solid var(--border)' : 'none', transition: 'all 0.3s',
                }}>{done ? '✓ ' : ''}{label}</div>
              );
            })}
          </div>
          {/* Timer row */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: timerCritical ? 'rgba(239,68,68,0.12)' : 'rgba(124,181,24,0.06)', borderRadius: 8, border: `1px solid ${timerCritical ? 'rgba(239,68,68,0.3)' : 'rgba(124,181,24,0.2)'}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 16 }}>{timerCritical ? '⏰' : '⏱️'}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: timerCritical ? '#F87171' : 'var(--green)', fontFamily: "'Courier New', monospace", letterSpacing: '0.05em' }}>{formatTime(timeLeft)}</span>
              <span style={{ fontSize: 11, color: 'var(--ink-4)' }}>remaining</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {violations > 0 && <span style={{ fontSize: 11, color: '#F87171', fontWeight: 600 }}>⚠️ {violations} violation{violations > 1 ? 's' : ''}</span>}
              <button onClick={enterFullscreen} style={{ fontSize: 11, padding: '4px 10px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 6, cursor: 'pointer', color: 'var(--ink-3)' }}>⛶ Fullscreen</button>
            </div>
          </div>
        </div>
      )}

      {/* Track picker */}
      {step === 'track' && (
        <div className="fade-up">
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Join a Skill Track</h1>
          <p style={{ color: 'var(--ink-3)', marginBottom: 28, fontSize: 15 }}>
            Pick your primary track. You'll take a two-part assessment to earn your Seed Score.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            {TRACKS.map(t => (
              <button key={t.id} onClick={() => setSelectedTrack(t.id)} style={{
                padding: 24, borderRadius: 14, border: '2px solid',
                borderColor: selectedTrack === t.id ? t.color : 'var(--border)',
                background: selectedTrack === t.id ? t.color + '0E' : 'var(--bg)',
                cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
              }}>
                <div style={{ fontSize: 36, marginBottom: 10 }}>{t.icon}</div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: t.color, marginBottom: 6 }}>{t.id}</h3>
                <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>{t.desc}</p>
              </button>
            ))}
          </div>
          {selectedTrack && (
            <button className="btn-primary" onClick={() => { setStep('assessment'); setTimeout(enterFullscreen, 300); }} style={{ width: '100%', justifyContent: 'center', fontSize: 15 }}>
              Start {selectedTrack} Assessment → (enters fullscreen)
            </button>
          )}
        </div>
      )}

      {/* Phase 1: MCQ Assessment */}
      {step === 'assessment' && selectedTrack && (
        <div className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: track?.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>
              {track?.icon}
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800 }}>{selectedTrack} Assessment — Part 1</h1>
              <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                {selectedTrack === 'Dev' ? 'Code tracing, bug finding & complexity — test understanding, not memorization' : 'Scenario-based — test your judgment, not just textbook knowledge'}
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#F87171' }}>
            📷 Assessment is proctored. Keep your face visible in the camera.
            {selectedTrack === 'Dev' && ' These questions require mental tracing — an AI cannot help you think through code execution.'}
          </div>

          {/* Dev MCQs */}
          {selectedTrack === 'Dev' && DEV_QUESTIONS.map((q, i) => (
            <div className="card" key={q.id} style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
                <span style={{ background: track?.color + '18', color: track?.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, flexShrink: 0, marginTop: 2 }}>
                  {q.type === 'trace' ? '🔍 TRACE' : q.type === 'bug' ? '🐛 BUG' : q.type === 'complexity' ? '⚡ COMPLEXITY' : '📤 OUTPUT'}
                </span>
                <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.5 }}>Q{i + 1}. {q.question}</p>
              </div>
              <pre style={{ background: '#0D0D0D', color: '#A3E635', borderRadius: 8, padding: '14px 16px', fontSize: 12, lineHeight: 1.8, marginBottom: 14, overflowX: 'auto', fontFamily: "'Courier New', monospace", border: '1px solid var(--border)' }}>{q.code}</pre>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {q.options.map((opt, optIdx) => {
                  const isSelected = devAnswers[q.id] === optIdx;
                  const isRevealed = revealed[i];
                  const isCorrect = optIdx === q.correct;
                  return (
                    <button key={optIdx} onClick={() => {
                      if (revealed[i]) return; // locked after first answer
                      setDevAnswers(prev => ({ ...prev, [q.id]: optIdx }));
                      setRevealed(prev => ({ ...prev, [i]: true }));
                    }} style={{
                      padding: '10px 14px', borderRadius: 8, border: '1.5px solid',
                      borderColor: isRevealed ? (isCorrect ? 'var(--green)' : isSelected ? '#DC2626' : 'var(--border)') : (isSelected ? track?.color : 'var(--border)'),
                      background: isRevealed ? (isCorrect ? 'rgba(124,181,24,0.1)' : isSelected ? 'rgba(220,38,38,0.1)' : 'var(--bg)') : (isSelected ? track?.color + '18' : 'var(--bg)'),
                      color: isRevealed ? (isCorrect ? 'var(--green)' : isSelected ? '#F87171' : 'var(--ink)') : (isSelected ? track?.color : 'var(--ink)'),
                      cursor: isRevealed ? 'not-allowed' : 'pointer', textAlign: 'left', fontSize: 13,
                      fontWeight: isSelected ? 600 : 400, transition: 'all 0.15s',
                      pointerEvents: isRevealed ? 'none' : 'auto',
                    }}>{String.fromCharCode(65 + optIdx)}. {opt}</button>
                  );
                })}
              </div>
              {revealed[i] && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 8, fontSize: 13, color: 'var(--ink-3)' }}>💡 {q.explanation}</div>
              )}
            </div>
          ))}

          {/* Domain MCQs */}
          {selectedTrack !== 'Dev' && getQuestions().map((q: any, i) => (
            <div className="card" key={i} style={{ marginBottom: 16 }}>
              <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.6, marginBottom: 14 }}>
                <span style={{ color: track?.color, fontFamily: "'Inter Tight', sans-serif" }}>Scenario {i + 1}.</span> {q.q}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {q.options.map((opt: string, optIdx: number) => {
                  const isSelected = domainAnswers[i] === optIdx;
                  const isRevealed = revealed[i];
                  const isCorrect = optIdx === q.correct;
                  return (
                    <button key={optIdx} onClick={() => {
                      if (revealed[i]) return; // locked after first answer
                      const updated = [...domainAnswers]; updated[i] = optIdx;
                      setDomainAnswers(updated);
                      setRevealed(prev => ({ ...prev, [i]: true }));
                    }} style={{
                      padding: '11px 14px', borderRadius: 8, border: '1.5px solid',
                      borderColor: isRevealed ? (isCorrect ? 'var(--green)' : isSelected ? '#DC2626' : 'var(--border)') : (isSelected ? track?.color : 'var(--border)'),
                      background: isRevealed ? (isCorrect ? 'rgba(124,181,24,0.1)' : isSelected ? 'rgba(220,38,38,0.1)' : 'var(--bg)') : (isSelected ? track?.color + '0E' : 'var(--bg)'),
                      color: isRevealed ? (isCorrect ? 'var(--green)' : isSelected ? '#F87171' : 'var(--ink)') : (isSelected ? track?.color : 'var(--ink)'),
                      cursor: isRevealed ? 'not-allowed' : 'pointer', textAlign: 'left', fontSize: 13,
                      fontWeight: isSelected ? 600 : 400, transition: 'all 0.15s',
                      pointerEvents: isRevealed ? 'none' : 'auto',
                    }}>{opt}</button>
                  );
                })}
              </div>
              {revealed[i] && (
                <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--bg-3)', borderRadius: 8, fontSize: 13, color: 'var(--ink-3)' }}>💡 {q.explanation}</div>
              )}
            </div>
          ))}

          <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
            {!preTrack && <button className="btn-secondary" onClick={() => setStep('track')}>← Back</button>}
            <button
              className="btn-primary"
              onClick={() => setStep('subjective')}
              disabled={!allAnswered}
              style={{ flex: 1, justifyContent: 'center', fontSize: 15, opacity: allAnswered ? 1 : 0.5 }}
            >
              {allAnswered ? 'Continue to Part 2: Written Response →' : 'Answer all questions to continue'}
            </button>
          </div>
        </div>
      )}

      {/* Phase 2: Subjective */}
      {step === 'subjective' && selectedTrack && (() => {
        const sq = SUBJECTIVE_QUESTIONS[selectedTrack];
        return (
          <div className="fade-up">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: track?.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{track?.icon}</div>
              <div>
                <h1 style={{ fontSize: 22, fontWeight: 800 }}>{selectedTrack} Assessment — Part 2</h1>
                <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Written response · AI-graded with rubric · Authenticity checked</p>
              </div>
            </div>

            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
                <span style={{ background: track?.color + '18', color: track?.color, fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6 }}>✍️ SUBJECTIVE · {sq.maxMarks} marks</span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>150–250 words · graded by AI rubric</span>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.7, marginBottom: 16, color: 'var(--ink)' }}>{sq.question}</p>
              <textarea
                className="textarea"
                value={subjAnswer}
                onChange={e => setSubjAnswer(e.target.value)}
                placeholder={sq.placeholder}
                rows={10}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                <span style={{ fontSize: 12, color: subjAnswer.split(' ').filter(Boolean).length < 50 ? '#F87171' : 'var(--green)' }}>
                  {subjAnswer.split(' ').filter(Boolean).length} words {subjAnswer.split(' ').filter(Boolean).length < 150 ? '(min 150)' : '✓'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>Answer in your own words — AI checks writing authenticity</span>
              </div>
            </div>

            {gradeError && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 12, fontSize: 13, color: '#F87171' }}>
                {gradeError}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setStep('assessment')}>← Back to Part 1</button>
              <button
                className="btn-primary"
                onClick={submitSubjective}
                disabled={grading || subjAnswer.split(' ').filter(Boolean).length < 50}
                style={{ flex: 1, justifyContent: 'center', fontSize: 15, opacity: grading || subjAnswer.split(' ').filter(Boolean).length < 50 ? 0.6 : 1 }}
              >
                {grading ? (
                  <><div className="ai-loading-spinner" style={{ borderTopColor: '#000' }} />  AI is grading...</>
                ) : subjAnswer.split(' ').filter(Boolean).length < 50 ? 'Write at least 50 words' : 'Submit & Get Seed Score →'}
              </button>
            </div>
          </div>
        );
      })()}

      {/* Result */}
      {step === 'result' && (
        <div className="fade-up">

          {/* ── DISQUALIFIED ── */}
          {disqualified ? (
            <div style={{ textAlign: 'center', padding: '40px 24px' }}>
              <div style={{
                background: 'rgba(220,38,38,0.08)', border: '2px solid rgba(220,38,38,0.4)',
                borderRadius: 16, padding: '40px 32px', marginBottom: 28,
              }}>
                <div style={{ fontSize: 56, marginBottom: 16 }}>🚫</div>
                <h1 style={{ fontSize: 26, fontWeight: 800, color: '#F87171', marginBottom: 12 }}>Assessment Terminated</h1>
                <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 8 }}>
                  A screenshot attempt was detected during your assessment.
                </p>
                <p style={{ fontSize: 15, color: 'var(--ink-3)', lineHeight: 1.7, marginBottom: 24 }}>
                  Your session has been flagged and your Seed Score has been set to <strong style={{ color: '#F87171' }}>0</strong>. This will appear on your Redrob profile as a <strong style={{ color: '#F87171' }}>proctoring violation</strong>.
                </p>
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginBottom: 20 }}>
                  <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '16px 28px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Seed Score</div>
                    <div style={{ fontSize: 44, fontWeight: 800, color: '#F87171', fontFamily: "'Inter Tight', sans-serif" }}>0</div>
                  </div>
                  <div style={{ background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)', borderRadius: 12, padding: '16px 28px', textAlign: 'center' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6 }}>Status</div>
                    <div style={{ fontSize: 16, fontWeight: 800, color: '#F87171', fontFamily: "'Inter Tight', sans-serif", marginTop: 8 }}>⛔ Flagged</div>
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--ink-4)', lineHeight: 1.6 }}>
                  Assessments are proctored for fairness to all students. Violations are recorded and cannot be appealed.
                </p>
              </div>
              <button className="btn-secondary" onClick={() => router.push('/')} style={{ fontSize: 14 }}>
                ← Back to Home
              </button>
            </div>
          ) : (
            <>

          {/* Score display */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 28 }}>
            <div style={{ flex: 1, background: 'var(--seed-bg)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div className="score-seed" style={{ marginBottom: 10 }}>🧪 Seed Score</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--seed-color)', fontFamily: "'Inter Tight', sans-serif", lineHeight: 1 }}>{seedScore}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--track-bg)', border: '1px solid rgba(124,181,24,0.2)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
              <div className="score-track" style={{ marginBottom: 10 }}>📈 Track Record</div>
              <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--track-color)', fontFamily: "'Inter Tight', sans-serif", lineHeight: 1 }}>{seedScore}</div>
            </div>
          </div>

          {/* AI rubric grading result */}
          {gradeResult && (
            <div className="card" style={{ marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700 }}>✍️ Written Response Breakdown</h3>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span style={{
                    background: gradeResult.aiLikelihood > 60 ? 'rgba(239,68,68,0.1)' : 'rgba(124,181,24,0.1)',
                    color: gradeResult.aiLikelihood > 60 ? '#F87171' : 'var(--green)',
                    border: `1px solid ${gradeResult.aiLikelihood > 60 ? 'rgba(239,68,68,0.3)' : 'rgba(124,181,24,0.3)'}`,
                    fontSize: 11, fontWeight: 700, padding: '3px 9px', borderRadius: 6,
                  }}>
                    {gradeResult.aiLikelihood < 30 ? '🧑 Likely Human' : gradeResult.aiLikelihood > 60 ? '🤖 AI Flagged' : '⚠️ Uncertain'}
                    {' '}({gradeResult.aiLikelihood}% AI)
                  </span>
                </div>
              </div>

              {/* Per-criterion breakdown */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {gradeResult.breakdown?.map((b, i) => (
                  <div key={i} style={{ background: 'var(--bg-3)', borderRadius: 8, padding: '12px 14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)' }}>{b.criterion}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: b.awarded >= b.maxMarks * 0.7 ? 'var(--green)' : b.awarded > 0 ? 'var(--amber)' : '#F87171' }}>
                        {b.awarded}/{b.maxMarks}
                      </span>
                    </div>
                    <div style={{ height: 4, background: 'var(--bg-4)', borderRadius: 99, marginBottom: 6 }}>
                      <div style={{ height: '100%', width: `${(b.awarded / b.maxMarks) * 100}%`, background: 'var(--green)', borderRadius: 99, transition: 'width 0.5s ease' }} />
                    </div>
                    <p style={{ fontSize: 12, color: 'var(--ink-3)', lineHeight: 1.5 }}>{b.feedback}</p>
                  </div>
                ))}
              </div>

              <div style={{ padding: '12px 14px', background: 'var(--bg-3)', borderRadius: 8, borderLeft: '3px solid var(--green)', marginBottom: 12 }}>
                <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.6 }}>{gradeResult.overallFeedback}</p>
              </div>

              {gradeResult.aiSignals && (
                <p style={{ fontSize: 12, color: 'var(--ink-4)', fontStyle: 'italic' }}>🔍 Authenticity note: {gradeResult.aiSignals}</p>
              )}
            </div>
          )}

          <p style={{ fontSize: 13, color: 'var(--ink-4)', marginBottom: 20, textAlign: 'center' }}>Track-Record Score updates after every verified gig milestone.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
            <button className="btn-primary" onClick={() => router.push('/student/s1')} style={{ fontSize: 15, padding: '12px 28px' }}>View Profile →</button>
            <button className="btn-secondary" onClick={() => router.push('/leaderboard')} style={{ fontSize: 15 }}>See Leaderboard</button>
          </div>
            </>
          )}
        </div>
      )}

    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}><div className="ai-loading-spinner" /></div>}>
      <OnboardingInner />
    </Suspense>
  );
}
