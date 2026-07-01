'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

// Realistic demo submissions for auto-fill
const DEMO_SUBMISSIONS: Record<string, { text: string; link: string }> = {
  default: {
    text: "I've completed the milestone as per the brief. Delivered 3 logo variants in SVG and PNG format — a primary wordmark, an icon-only version, and a compact badge variant. All files follow the brand guide I've created covering typography (Space Grotesk), color palette (#FF6B35 primary, #1A1A2E secondary), and do's and don'ts. The urban street aesthetic is maintained across all variants with a graffiti-inspired texture on the icon.",
    link: 'https://figma.com/demo-delivery-link',
  },
};

export default function ActiveGigPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any>>({});
  const [verifying, setVerifying] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, { text: string; link: string }>>({});
  const [scoreUpdate, setScoreUpdate] = useState<{ milestoneId: string; delta: string; newScore: number } | null>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [escrowReleased, setEscrowReleased] = useState<string | null>(null);

  const TASK_DATA: Record<string, any> = {
    t1: {
      title: 'Brand Identity Kit — ThreadHouse Streetwear',
      budget: '₹8,000',
      business: 'Rahul Sharma',
      brief: { acceptance_criteria: ["Logo reflects urban/street culture aesthetic", "Minimum 3 logo variants delivered", "All files in vector format", "Brand guide covers do's and don'ts"] }
    },
    t4: {
      title: 'Instagram Growth Strategy — SpiceBox',
      budget: '₹5,000',
      business: 'Priya Iyer',
      brief: { acceptance_criteria: ['Calendar covers all 14 days', 'Each post has caption + hashtag set', 'Strategy doc explains growth logic', 'Hashtag sets researched for Indian food niche'] }
    },
    t5: {
      title: 'Landing Page — ThreadHouse Streetwear',
      budget: '₹6,000–₹8,000',
      business: 'Rahul Sharma',
      brief: { acceptance_criteria: ['Works on mobile and desktop', 'WhatsApp button opens chat with pre-filled order message', 'Page loads under 3 seconds', 'Matches ThreadHouse brand colors', 'Deployed and publicly accessible link delivered'] }
    },
  };

  useEffect(() => {
    loadMilestones();
  }, [studentId]);

  const loadMilestones = async () => {
    const res = await fetch(`/api/milestones?studentId=${studentId}`);
    const data = await res.json();
    setMilestones(data.milestones || []);
    setTasks(TASK_DATA);
  };

  const handleSubmit = async (milestoneId: string, taskId: string) => {
    const sub = submissions[milestoneId];
    if (!sub?.text?.trim()) return;
    setSubmitting(milestoneId);
    await fetch('/api/milestones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'submit', milestoneId, submissionText: sub.text, submissionLink: sub.link }),
    });
    await loadMilestones();
    setSubmitting(null);
    handleVerify(milestoneId, taskId, sub.text);
  };

  const handleVerify = async (milestoneId: string, taskId: string, submissionOverride?: string) => {
    const milestone = milestones.find(m => m.id === milestoneId);
    const task = tasks[taskId];
    if (!milestone || !task) return;

    const submissionText = submissionOverride || milestone.submissionText || '';
    setVerifying(milestoneId);

    const res = await fetch('/api/verify-milestone', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submission: submissionText,
        acceptanceCriteria: task.brief?.acceptance_criteria || [],
        milestoneTitle: milestone.title,
        dueDate: milestone.dueDate,
        submittedAt: milestone.submittedAt || new Date().toISOString(),
      }),
    });
    const data = await res.json();
    if (data.verdict) {
      const applyRes = await fetch('/api/milestones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'apply-verdict',
          milestoneId,
          verdict: data.verdict,
          studentId,
          submittedAt: milestone.submittedAt || new Date().toISOString(),
        }),
      });
      const applyData = await applyRes.json();
      if (applyData.newTrackRecordScore !== undefined) {
        const deltaMap: Record<string, string> = { 'approved-ontime': '+8', 'approved-late': '+4', 'needs-revision': '-3', 'missed-deadline': '-10' };
        setScoreUpdate({ milestoneId, delta: deltaMap[applyData.outcome] || '+8', newScore: applyData.newTrackRecordScore });
        if (applyData.outcome?.startsWith('approved')) {
          setEscrowReleased(milestoneId);
          setTimeout(() => setEscrowReleased(null), 5000);
        }
      }
      await loadMilestones();
    }
    setVerifying(null);
  };

  // Auto-fill + submit demo for a milestone
  const runDemo = async (milestoneId: string, taskId: string) => {
    setDemoMode(true);
    const demo = DEMO_SUBMISSIONS.default;
    setSubmissions(prev => ({ ...prev, [milestoneId]: demo }));
    // Small delay so the judge sees the text fill in
    await new Promise(r => setTimeout(r, 800));
    await handleSubmit(milestoneId, taskId);
  };

  const statusColors: Record<string, string> = {
    pending: 'var(--ink-4)', submitted: '#4F46E5', approved: 'var(--green)', 'needs-revision': '#EA580C'
  };

  const byTask: Record<string, any[]> = {};
  milestones.forEach(m => {
    if (!byTask[m.taskId]) byTask[m.taskId] = [];
    byTask[m.taskId].push(m);
  });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>

      {/* Judge Demo Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(124,181,24,0.08) 0%, rgba(167,139,250,0.08) 100%)',
        border: '1px solid rgba(124,181,24,0.25)',
        borderRadius: 14, padding: '18px 22px', marginBottom: 28,
        display: 'flex', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: 28, flexShrink: 0 }}>🎬</div>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--green)', marginBottom: 4 }}>JUDGE DEMO MODE</div>
          <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.6, margin: 0 }}>
            This is the student's active gig dashboard. Click <strong style={{ color: 'var(--ink)' }}>"Run Demo →"</strong> on any pending milestone to auto-submit realistic work and watch AI verify it live — including the escrow release and Track-Record Score update.
          </p>
        </div>
      </div>

      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Active Gigs</h1>
      <p style={{ color: 'var(--ink-3)', marginBottom: 28, fontSize: 15 }}>Submit milestones → AI verifies → escrow releases → Track-Record Score updates.</p>

      {/* Escrow release animation */}
      {escrowReleased && (
        <div className="fade-up" style={{
          background: 'linear-gradient(135deg, rgba(124,181,24,0.1), rgba(124,181,24,0.05))',
          border: '1px solid rgba(124,181,24,0.4)',
          borderRadius: 12, padding: '16px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 14,
        }}>
          <div style={{ fontSize: 28 }}>🔐→💸</div>
          <div>
            <p style={{ fontWeight: 700, color: 'var(--green)', marginBottom: 3 }}>Escrow Released!</p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>Payment unlocked from escrow and sent to student wallet. Business is automatically notified.</p>
          </div>
        </div>
      )}

      {/* Score update toast */}
      {scoreUpdate && (
        <div className="fade-up" style={{
          background: scoreUpdate.delta.startsWith('+') ? 'rgba(124,181,24,0.08)' : 'rgba(239,68,68,0.08)',
          border: `1px solid ${scoreUpdate.delta.startsWith('+') ? 'rgba(124,181,24,0.3)' : 'rgba(239,68,68,0.3)'}`,
          borderRadius: 12, padding: '14px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>{scoreUpdate.delta.startsWith('+') ? '📈' : '⚠️'}</span>
          <div>
            <p style={{ fontWeight: 700, color: scoreUpdate.delta.startsWith('+') ? 'var(--green)' : '#F87171', marginBottom: 2 }}>
              Track-Record Score {scoreUpdate.delta} pts!
            </p>
            <p style={{ fontSize: 13, color: 'var(--ink-3)' }}>New score: <strong style={{ color: 'var(--ink)' }}>{scoreUpdate.newScore}/100</strong> — leaderboard rank updated.</p>
          </div>
          <button onClick={() => setScoreUpdate(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--ink-4)' }}>×</button>
        </div>
      )}

      {Object.entries(byTask).map(([taskId, taskMilestones]) => (
        <div key={taskId} className="card fade-up" style={{ marginBottom: 24 }}>

          {/* Task header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>{tasks[taskId]?.title || `Task ${taskId}`}</h2>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>👤 {tasks[taskId]?.business}</span>
                <span style={{ fontSize: 12, color: 'var(--green)', fontWeight: 700 }}>{tasks[taskId]?.budget} in escrow</span>
                <span style={{ fontSize: 12, color: 'var(--ink-4)' }}>{taskMilestones.filter(m => m.status === 'approved').length}/{taskMilestones.length} milestones done</span>
              </div>
            </div>
            {/* Milestone progress bar */}
            <div style={{ display: 'flex', gap: 4 }}>
              {taskMilestones.map((m, i) => (
                <div key={i} style={{ width: 28, height: 6, borderRadius: 3, background: m.status === 'approved' ? 'var(--green)' : m.status === 'submitted' ? '#4F46E5' : 'var(--border)' }} />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {taskMilestones.map((m, i) => (
              <div key={m.id} style={{ position: 'relative', marginBottom: i < taskMilestones.length - 1 ? 28 : 0 }}>
                <div style={{
                  position: 'absolute', left: -32, top: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: statusColors[m.status] || 'var(--border)',
                  border: '2.5px solid var(--bg)',
                  boxShadow: `0 0 0 2px ${statusColors[m.status] || 'var(--border)'}`,
                }} />
                {i < taskMilestones.length - 1 && (
                  <div style={{ position: 'absolute', left: -25, top: 18, width: 1, height: 'calc(100% + 12px)', background: 'var(--border)' }} />
                )}

                <div style={{ background: 'var(--bg-3)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{m.title}</h3>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                      background: m.status === 'approved' ? 'rgba(124,181,24,0.12)' : m.status === 'submitted' ? 'rgba(79,70,229,0.12)' : m.status === 'needs-revision' ? 'rgba(234,88,12,0.12)' : 'rgba(255,255,255,0.06)',
                      color: m.status === 'approved' ? 'var(--green)' : m.status === 'submitted' ? '#818CF8' : m.status === 'needs-revision' ? '#FB923C' : 'var(--ink-4)',
                      border: `1px solid ${m.status === 'approved' ? 'rgba(124,181,24,0.3)' : 'var(--border)'}`,
                    }}>{m.status.replace('-', ' ')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--ink-3)', marginBottom: 10 }}>{m.description}</p>
                  <p style={{ fontSize: 12, color: 'var(--ink-4)', marginBottom: 10 }}>📅 Due: {new Date(m.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>

                  {/* AI Verdict */}
                  {m.aiVerdict && (
                    <div style={{
                      background: m.aiVerdict.approved ? 'rgba(124,181,24,0.06)' : 'rgba(234,88,12,0.06)',
                      border: `1px solid ${m.aiVerdict.approved ? 'rgba(124,181,24,0.25)' : 'rgba(234,88,12,0.25)'}`,
                      borderRadius: 8, padding: '10px 14px', marginBottom: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{m.aiVerdict.approved ? '✅' : '⚠️'}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: m.aiVerdict.approved ? 'var(--green)' : '#FB923C' }}>
                          AI Verdict: {m.aiVerdict.approved ? 'Approved — Payment Released' : 'Needs Revision'}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--ink-3)', lineHeight: 1.5 }}>{m.aiVerdict.reason}</p>
                    </div>
                  )}

                  {/* Submission form for pending/needs-revision */}
                  {(m.status === 'pending' || m.status === 'needs-revision') && (
                    <div style={{ marginTop: 12, background: 'var(--bg-2)', borderRadius: 8, padding: '14px', border: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink-3)' }}>
                          {m.status === 'needs-revision' ? '🔄 Submit revised work:' : '📤 Submit your deliverable:'}
                        </p>
                        {/* Judge Demo shortcut */}
                        <button
                          onClick={() => runDemo(m.id, m.taskId)}
                          disabled={submitting === m.id || verifying === m.id}
                          style={{
                            padding: '5px 12px', background: 'rgba(124,181,24,0.12)',
                            border: '1px solid rgba(124,181,24,0.3)', borderRadius: 20,
                            color: 'var(--green)', fontSize: 11, fontWeight: 700,
                            cursor: 'pointer', letterSpacing: '0.02em',
                          }}
                        >
                          🎬 Run Demo →
                        </button>
                      </div>
                      <textarea
                        className="textarea"
                        style={{ minHeight: 80, marginBottom: 8, fontSize: 13 }}
                        placeholder="Describe what you've done and what you're delivering..."
                        value={submissions[m.id]?.text || ''}
                        onChange={e => setSubmissions(prev => ({ ...prev, [m.id]: { ...prev[m.id], text: e.target.value } }))}
                      />
                      <input
                        className="input"
                        style={{ marginBottom: 12 }}
                        placeholder="Link to deliverable (Figma, GitHub, Google Drive...)"
                        value={submissions[m.id]?.link || ''}
                        onChange={e => setSubmissions(prev => ({ ...prev, [m.id]: { ...prev[m.id], link: e.target.value } }))}
                      />
                      <button
                        className="btn-primary"
                        onClick={() => handleSubmit(m.id, m.taskId)}
                        disabled={submitting === m.id || verifying === m.id || !submissions[m.id]?.text?.trim()}
                        style={{ fontSize: 13, padding: '9px 18px', opacity: !submissions[m.id]?.text?.trim() ? 0.5 : 1 }}
                      >
                        {submitting === m.id || verifying === m.id ? (
                          <><div className="ai-loading-spinner" style={{ width: 14, height: 14, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)', display: 'inline-block', marginRight: 8 }} />
                            {submitting === m.id ? 'Submitting...' : '🤖 AI verifying...'}</>
                        ) : 'Submit & AI Verify →'}
                      </button>
                    </div>
                  )}

                  {m.status === 'submitted' && !m.aiVerdict && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleVerify(m.id, m.taskId)}
                      disabled={verifying === m.id}
                      style={{ fontSize: 13, padding: '8px 16px', marginTop: 8 }}
                    >
                      {verifying === m.id ? (
                        <><div className="ai-loading-spinner" style={{ width: 14, height: 14, display: 'inline-block', marginRight: 8 }} /> AI verifying...</>
                      ) : '🤖 Run AI Verification →'}
                    </button>
                  )}

                  {m.submissionLink && (
                    <a href={m.submissionLink} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--green)', marginTop: 8, textDecoration: 'none' }}>
                      🔗 View submitted deliverable ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {Object.keys(byTask).length === 0 && (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>No active gigs yet</h3>
          <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 20 }}>
            Once a business owner selects you, your milestones will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
