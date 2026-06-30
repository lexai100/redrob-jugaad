'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

export default function ActiveGigPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [tasks, setTasks] = useState<Record<string, any>>({});
  const [verifying, setVerifying] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissions, setSubmissions] = useState<Record<string, { text: string; link: string }>>({});
  const [scoreUpdate, setScoreUpdate] = useState<{ milestoneId: string; delta: string; newScore: number } | null>(null);

  const TASK_DATA: Record<string, any> = {
    t1: {
      title: 'Brand Identity Kit — ThreadHouse Streetwear',
      brief: { acceptance_criteria: ['Logo reflects urban/street culture aesthetic', 'Minimum 3 logo variants delivered', 'All files in vector format', 'Brand guide covers do\'s and don\'ts'] }
    },
    t4: {
      title: 'Instagram Growth Strategy — SpiceBox',
      brief: { acceptance_criteria: ['Calendar covers all 14 days', 'Each post has caption + hashtag set', 'Strategy doc explains growth logic', 'Hashtag sets researched for Indian food niche'] }
    },
  };

  useEffect(() => {
    loadMilestones();
  }, [studentId]);

  const loadMilestones = async () => {
    const res = await fetch(`/api/milestones?studentId=${studentId}`);
    const data = await res.json();
    setMilestones(data.milestones || []);
    // Fallback to seeded task data
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
    // Auto-verify
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
      }
      await loadMilestones();
    }
    setVerifying(null);
  };

  const statusColors: Record<string, string> = {
    pending: 'var(--gray-400)', submitted: '#4F46E5', approved: 'var(--green)', 'needs-revision': '#EA580C'
  };

  // Group by task
  const byTask: Record<string, any[]> = {};
  milestones.forEach(m => {
    if (!byTask[m.taskId]) byTask[m.taskId] = [];
    byTask[m.taskId].push(m);
  });

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 6, letterSpacing: '-0.02em' }}>Active Gigs</h1>
      <p style={{ color: 'var(--gray-600)', marginBottom: 28, fontSize: 15 }}>Submit milestones and watch AI verify your work in real time.</p>

      {/* Score update toast */}
      {scoreUpdate && (
        <div className="fade-up" style={{
          background: scoreUpdate.delta.startsWith('+') ? '#F0FDF4' : '#FEF2F2',
          border: `1px solid ${scoreUpdate.delta.startsWith('+') ? '#86EFAC' : '#FCA5A5'}`,
          borderRadius: 12, padding: '14px 20px', marginBottom: 20,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 24 }}>{scoreUpdate.delta.startsWith('+') ? '🎉' : '⚠️'}</span>
          <div>
            <p style={{ fontWeight: 700, color: scoreUpdate.delta.startsWith('+') ? 'var(--green)' : '#DC2626', marginBottom: 2 }}>
              Track-record score {scoreUpdate.delta} pts!
            </p>
            <p style={{ fontSize: 13, color: 'var(--gray-600)' }}>New score: <strong>{scoreUpdate.newScore}/100</strong></p>
          </div>
          <button onClick={() => setScoreUpdate(null)} style={{ marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--gray-400)' }}>×</button>
        </div>
      )}

      {Object.entries(byTask).map(([taskId, taskMilestones]) => (
        <div key={taskId} className="card fade-up" style={{ marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>
            {tasks[taskId]?.title || `Task ${taskId}`}
          </h2>
          <p style={{ fontSize: 12, color: 'var(--gray-400)', marginBottom: 20 }}>
            {taskMilestones.filter(m => m.status === 'approved').length}/{taskMilestones.length} milestones approved
          </p>

          {/* Timeline */}
          <div style={{ position: 'relative', paddingLeft: 32 }}>
            {taskMilestones.map((m, i) => (
              <div key={m.id} style={{ position: 'relative', marginBottom: i < taskMilestones.length - 1 ? 28 : 0 }}>
                {/* Timeline dot */}
                <div style={{
                  position: 'absolute', left: -32, top: 2,
                  width: 16, height: 16, borderRadius: '50%',
                  background: statusColors[m.status] || 'var(--gray-400)',
                  border: '2px solid white',
                  boxShadow: `0 0 0 2px ${statusColors[m.status] || 'var(--gray-400)'}40`,
                }} />
                {/* Connector */}
                {i < taskMilestones.length - 1 && (
                  <div style={{ position: 'absolute', left: -25, top: 18, width: 1, height: 'calc(100% + 12px)', background: 'var(--border)' }} />
                )}

                <div style={{ background: 'var(--gray-50)', borderRadius: 10, padding: '14px 16px', border: '1px solid var(--border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, flex: 1 }}>{m.title}</h3>
                    <span className={`chip chip-${m.status}`}>{m.status.replace('-', ' ')}</span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--gray-600)', marginBottom: 10 }}>{m.description}</p>

                  {/* AI Verdict */}
                  {m.aiVerdict && (
                    <div style={{
                      background: m.aiVerdict.approved ? '#F0FDF4' : '#FFF7ED',
                      border: `1px solid ${m.aiVerdict.approved ? '#86EFAC' : '#FED7AA'}`,
                      borderRadius: 8, padding: '10px 14px', marginBottom: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <span style={{ fontSize: 14 }}>{m.aiVerdict.approved ? '✅' : '⚠️'}</span>
                        <span style={{ fontSize: 12, fontWeight: 700, color: m.aiVerdict.approved ? 'var(--green)' : '#C2410C', fontFamily: "'Inter Tight', sans-serif" }}>
                          AI Verdict: {m.aiVerdict.approved ? 'Approved' : 'Needs Revision'}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: 'var(--gray-700)', lineHeight: 1.5 }}>{m.aiVerdict.reason}</p>
                    </div>
                  )}

                  {/* Submission form for pending/needs-revision */}
                  {(m.status === 'pending' || m.status === 'needs-revision') && (
                    <div style={{ marginTop: 12, background: 'white', borderRadius: 8, padding: '12px', border: '1px solid var(--border)' }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>
                        {m.status === 'needs-revision' ? '🔄 Submit revised work:' : 'Submit your work:'}
                      </p>
                      <textarea
                        className="textarea"
                        style={{ minHeight: 70, marginBottom: 8 }}
                        placeholder="Describe what you've done and what you're delivering..."
                        value={submissions[m.id]?.text || ''}
                        onChange={e => setSubmissions(prev => ({ ...prev, [m.id]: { ...prev[m.id], text: e.target.value } }))}
                      />
                      <input
                        className="input"
                        style={{ marginBottom: 10 }}
                        placeholder="Link to deliverable (optional — Google Drive, Figma, GitHub...)"
                        value={submissions[m.id]?.link || ''}
                        onChange={e => setSubmissions(prev => ({ ...prev, [m.id]: { ...prev[m.id], link: e.target.value } }))}
                      />
                      <button
                        className="btn-primary"
                        onClick={() => handleSubmit(m.id, m.taskId)}
                        disabled={submitting === m.id || verifying === m.id || !submissions[m.id]?.text?.trim()}
                        style={{ fontSize: 13, padding: '9px 18px' }}
                      >
                        {submitting === m.id || verifying === m.id ? (
                          <><div className="ai-loading-spinner" style={{ width: 14, height: 14, borderTopColor: 'white', borderColor: 'rgba(255,255,255,0.3)' }} />
                            {submitting === m.id ? 'Submitting...' : '🤖 AI verifying...'}</>
                        ) : 'Submit & AI Verify →'}
                      </button>
                    </div>
                  )}

                  {/* Re-verify submitted milestone */}
                  {m.status === 'submitted' && !m.aiVerdict && (
                    <button
                      className="btn-secondary"
                      onClick={() => handleVerify(m.id, m.taskId)}
                      disabled={verifying === m.id}
                      style={{ fontSize: 13, padding: '8px 16px', marginTop: 8 }}
                    >
                      {verifying === m.id ? (
                        <><div className="ai-loading-spinner" style={{ width: 14, height: 14 }} /> AI verifying...</>
                      ) : '🤖 Run AI Verification →'}
                    </button>
                  )}

                  {m.submissionLink && (
                    <a href={m.submissionLink} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--purple)', marginTop: 8, textDecoration: 'none' }}>
                      🔗 View submission
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
          <p style={{ color: 'var(--gray-600)', fontSize: 14, marginBottom: 20 }}>
            Once a business owner selects you, your milestones will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
