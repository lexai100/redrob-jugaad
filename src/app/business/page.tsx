'use client';
import Link from 'next/link';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Brief = {
  title: string;
  scope: string;
  deliverables: string[];
  budget_range: string;
  timeline: string;
  acceptance_criteria: string[];
};

type Step = 'input' | 'brief';
type GigType = 'remote' | 'in-person' | 'hybrid';

export default function BusinessPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('input');
  const [rawInput, setRawInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [editableBrief, setEditableBrief] = useState<Brief | null>(null);
  const [track, setTrack] = useState('Design');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const [gigType, setGigType] = useState<GigType>('remote');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const EXAMPLE_TASKS = [
    "I need a logo and brand kit for my streetwear brand. Urban, bold, for young Indians.",
    "Create 5 Instagram Reels for my food startup showing cooking process with our spices.",
    "Build a simple landing page with product showcase and WhatsApp order button.",
    "Instagram growth strategy + 2 weeks content calendar for my brand (800 followers now).",
  ];

  const TRACKS = [
    { id: 'Dev', icon: '💻', color: '#2A0E72' },
    { id: 'Design', icon: '🎨', color: '#5E7D00' },
    { id: 'Content', icon: '🎬', color: '#C2410C' },
    { id: 'Marketing', icon: '📈', color: '#0369A1' },
  ];

  const GIG_TYPES: { id: GigType; icon: string; label: string; desc: string }[] = [
    { id: 'remote', icon: '🌐', label: 'Remote', desc: 'Work delivered online' },
    { id: 'in-person', icon: '📍', label: 'In-Person', desc: 'Student visits your location' },
    { id: 'hybrid', icon: '🔀', label: 'Hybrid', desc: 'Mix of both' },
  ];

  const startVoice = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported. Please use Chrome.');
      return;
    }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.lang = 'en-IN';
    recognition.interimResults = true;
    recognition.onresult = (e: any) => {
      const transcript = Array.from(e.results).map((r: any) => r[0].transcript).join('');
      setRawInput(transcript);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  };

  const stopVoice = () => { recognitionRef.current?.stop(); setIsListening(false); };

  const generateBrief = async () => {
    if (!rawInput.trim()) return;
    setIsGenerating(true);
    try {
      const res = await fetch('/api/generate-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rawInput }),
      });
      const data = await res.json();
      if (data.brief) {
        setEditableBrief(data.brief);
        setStep('brief');
      }
    } catch { alert('Failed to generate brief. Please try again.'); }
    finally { setIsGenerating(false); }
  };

  const postTask = () => {
    if (!editableBrief) return;
    const taskId = 'task-' + Date.now();
    sessionStorage.setItem('pendingTask', JSON.stringify({
      id: taskId, businessOwnerId: 'b1', rawInput,
      brief: editableBrief, track,
      budgetRange: editableBrief.budget_range,
      urgency, gigType, status: 'open',
      weightPreference: 'trackRecordScore',
      createdAt: new Date().toISOString(),
    }));
    router.push(`/business/shortlist?taskId=${taskId}`);
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 40 }}>
        {[
          { key: 'input', label: 'Describe Task', num: 1 },
          { key: 'brief', label: 'Review Brief', num: 2 },
          { key: 'shortlist', label: 'Match Students', num: 3 },
        ].map((s, i) => (
          <div key={s.key} style={{ display: 'flex', alignItems: 'center', flex: i < 2 ? 1 : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div className={`step-dot ${step === s.key ? 'active' : (step === 'brief' && s.key === 'input') ? 'done' : 'pending'}`}>
                {step === 'brief' && s.key === 'input' ? '✓' : s.num}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: step === s.key ? 'var(--purple)' : 'var(--ink-4)', fontFamily: "'Inter Tight', sans-serif", whiteSpace: 'nowrap' }}>
                {s.label}
              </span>
            </div>
            {i < 2 && <div style={{ flex: 1, height: 1, background: 'var(--border)', margin: '0 12px' }} />}
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 'input' && (
        <div className="fade-up">
          <h1 style={{ fontSize: 30, fontWeight: 800, marginBottom: 8, letterSpacing: '-0.02em' }}>Post a Task</h1>
          <p style={{ color: 'var(--ink-3)', marginBottom: 28, fontSize: 15 }}>
            Describe what you need in plain language. AI turns it into a structured brief instantly.
          </p>

          <div className="card" style={{ marginBottom: 20 }}>
            <label className="label">What do you need help with?</label>
            <div style={{ position: 'relative' }}>
              <textarea
                className="textarea"
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                placeholder="E.g., I need a logo for my new chai startup. Should feel premium but desi. Works on packaging and social media..."
                rows={5}
              />
              <button
                onClick={isListening ? stopVoice : startVoice}
                style={{
                  position: 'absolute', right: 12, bottom: 12,
                  width: 36, height: 36, borderRadius: '50%',
                  background: isListening ? '#EF4444' : 'var(--purple)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  animation: isListening ? 'pulse-ring 1.5s infinite' : 'none',
                  transition: 'background 0.2s',
                }}
                title={isListening ? 'Stop recording' : 'Speak your task (Chrome only)'}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                  <path d="M8 1a2 2 0 0 1 2 2v4a2 2 0 1 1-4 0V3a2 2 0 0 1 2-2z"/>
                  <path d="M4.5 8a3.5 3.5 0 0 0 7 0h1a4.5 4.5 0 0 1-9 0h1z"/>
                  <line x1="8" y1="13" x2="8" y2="15" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
            </div>
            {isListening && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, color: '#EF4444', fontSize: 13 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444', animation: 'pulse-ring 1s infinite' }} />
                Listening... speak now
              </div>
            )}

            {/* Track */}
            <div style={{ marginTop: 20 }}>
              <div className="label" style={{ marginBottom: 10 }}>Skill track needed</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {TRACKS.map(t => (
                  <button key={t.id} onClick={() => setTrack(t.id)} style={{
                    padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
                    borderColor: track === t.id ? t.color : 'var(--border)',
                    background: track === t.id ? t.color + '12' : 'var(--bg)',
                    color: track === t.id ? t.color : 'var(--ink-3)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer',
                    fontFamily: "'Inter Tight', sans-serif", transition: 'all 0.15s',
                  }}>
                    {t.icon} {t.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Remote / In-Person */}
            <div style={{ marginTop: 16 }}>
              <div className="label" style={{ marginBottom: 10 }}>Gig type</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {GIG_TYPES.map(g => (
                  <button key={g.id} onClick={() => setGigType(g.id)} style={{
                    padding: '8px 16px', borderRadius: 10, border: '1.5px solid',
                    borderColor: gigType === g.id ? 'var(--purple)' : 'var(--border)',
                    background: gigType === g.id ? 'var(--card-tint)' : 'var(--bg)',
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <span style={{ fontSize: 16 }}>{g.icon}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: gigType === g.id ? 'var(--purple)' : 'var(--ink)' }}>{g.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--ink-4)' }}>{g.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Urgency */}
            <div style={{ marginTop: 16 }}>
              <div className="label" style={{ marginBottom: 10 }}>Urgency</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(['normal', 'urgent'] as const).map(u => (
                  <button key={u} onClick={() => setUrgency(u)} style={{
                    padding: '7px 16px', borderRadius: 20, border: '1.5px solid',
                    borderColor: urgency === u ? (u === 'urgent' ? '#DC2626' : 'var(--purple)') : 'var(--border)',
                    background: urgency === u ? (u === 'urgent' ? '#FEE2E2' : 'var(--card-tint)') : 'var(--bg)',
                    color: urgency === u ? (u === 'urgent' ? '#DC2626' : 'var(--purple)') : 'var(--ink-3)',
                    fontWeight: 600, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {u === 'urgent' ? '🔥 Urgent' : '📅 Normal'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Examples */}
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, color: 'var(--ink-4)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              Try an example ↓
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {EXAMPLE_TASKS.map((ex, i) => (
                <button key={i} onClick={() => setRawInput(ex)} style={{
                  padding: '6px 12px', background: 'var(--bg)', border: '1px solid var(--border)',
                  borderRadius: 8, fontSize: 12, color: 'var(--ink-3)', cursor: 'pointer',
                  textAlign: 'left', maxWidth: 220, lineHeight: 1.4, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--purple-muted)'; e.currentTarget.style.color = 'var(--purple)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink-3)'; }}
                >
                  {ex.substring(0, 60)}...
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={generateBrief}
            disabled={!rawInput.trim() || isGenerating}
            style={{ width: '100%', justifyContent: 'center', fontSize: 16, padding: '14px', opacity: !rawInput.trim() ? 0.5 : 1 }}>
            {isGenerating ? (
              <><div className="ai-loading-spinner" style={{ borderTopColor: 'var(--bg-2)', borderColor: 'rgba(255,255,255,0.3)' }} />AI is building your brief...</>
            ) : '🤖 Generate Brief with AI →'}
          </button>
        </div>
      )}

      {/* STEP 2 — Brief Review */}
      {step === 'brief' && editableBrief && (
        <div className="fade-up">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--green)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✨</div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>AI-Generated Brief</h1>
              <p style={{ fontSize: 14, color: 'var(--ink-3)' }}>All fields are editable. Acceptance criteria are what AI will check against.</p>
            </div>
          </div>

          {/* Gig type badge */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            <span style={{ background: 'var(--card-tint)', color: 'var(--purple)', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
              {gigType === 'remote' ? '🌐 Remote' : gigType === 'in-person' ? '📍 In-Person' : '🔀 Hybrid'}
            </span>
            <span style={{ background: urgency === 'urgent' ? '#FEE2E2' : 'var(--card-tint)', color: urgency === 'urgent' ? '#DC2626' : 'var(--purple)', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20 }}>
              {urgency === 'urgent' ? '🔥 Urgent' : '📅 Normal'}
            </span>
          </div>

          <div className="card" style={{ marginBottom: 14 }}>
            <label className="label">Title</label>
            <input className="input" value={editableBrief.title} onChange={e => setEditableBrief({ ...editableBrief, title: e.target.value })} />
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <label className="label">Scope</label>
            <textarea className="textarea" style={{ minHeight: 80 }} value={editableBrief.scope} onChange={e => setEditableBrief({ ...editableBrief, scope: e.target.value })} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
            <div className="card">
              <label className="label">💰 Budget Range</label>
              <input className="input" value={editableBrief.budget_range} onChange={e => setEditableBrief({ ...editableBrief, budget_range: e.target.value })} />
            </div>
            <div className="card">
              <label className="label">⏱️ Timeline</label>
              <input className="input" value={editableBrief.timeline} onChange={e => setEditableBrief({ ...editableBrief, timeline: e.target.value })} />
            </div>
          </div>
          <div className="card" style={{ marginBottom: 14 }}>
            <label className="label">📦 Deliverables</label>
            {editableBrief.deliverables.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--green)', fontWeight: 700 }}>✓</span>
                <input className="input" value={d} onChange={e => {
                  const u = [...editableBrief.deliverables]; u[i] = e.target.value;
                  setEditableBrief({ ...editableBrief, deliverables: u });
                }} />
              </div>
            ))}
          </div>
          <div className="card" style={{ marginBottom: 24 }}>
            <label className="label">✅ Acceptance Criteria <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>(AI checks these on milestone submission)</span></label>
            {editableBrief.acceptance_criteria.map((c, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 8, alignItems: 'center' }}>
                <span style={{ color: 'var(--purple)', fontSize: 13, fontWeight: 700 }}>{i + 1}.</span>
                <input className="input" value={c} onChange={e => {
                  const u = [...editableBrief.acceptance_criteria]; u[i] = e.target.value;
                  setEditableBrief({ ...editableBrief, acceptance_criteria: u });
                }} />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-secondary" onClick={() => setStep('input')} style={{ flex: 1, justifyContent: 'center' }}>← Edit Task</button>
            <button className="btn-primary" onClick={postTask} style={{ flex: 2, justifyContent: 'center', fontSize: 16 }}>Post Task & Find Students →</button>
          </div>
        </div>
      )}
    </div>
  );
}
