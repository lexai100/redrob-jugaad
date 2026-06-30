'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

export default function NotificationsPage() {
  const { id: studentId } = useParams<{ id: string }>();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, [studentId]);

  const loadNotifications = async () => {
    const res = await fetch(`/api/students?userId=${studentId}&type=notifications`);
    const data = await res.json();
    setNotifications(data.notifications || []);
    setLoading(false);
  };

  const handleAct = async (notificationId: string, accept: boolean) => {
    await fetch('/api/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'act-notification', userId: studentId, notificationId }),
    });
    await loadNotifications();
  };

  const getTimeRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${mins}m remaining`;
  };

  const getProgressPercent = (createdAt: string, expiresAt: string) => {
    const total = new Date(expiresAt).getTime() - new Date(createdAt).getTime();
    const elapsed = Date.now() - new Date(createdAt).getTime();
    return Math.min(100, (elapsed / total) * 100);
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <Link href={`/student/${studentId}`} style={{ color: 'var(--gray-400)', fontSize: 13, textDecoration: 'none' }}>← Profile</Link>
        <span style={{ color: 'var(--gray-400)' }}>›</span>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.02em' }}>Notifications</h1>
      </div>

      <div className="card-tinted" style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <span style={{ fontSize: 20 }}>ℹ️</span>
          <div>
            <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>AI Match Grace Period</p>
            <p style={{ fontSize: 13, color: 'var(--gray-600)', lineHeight: 1.5 }}>
              When your AI toggle is <strong>off</strong>, you still get notified for strong matches. You have <strong>24 hours</strong> to accept before the window closes.
              Urgent tasks skip this window — they go live immediately.
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 48 }}><div className="ai-loading-spinner" style={{ margin: '0 auto' }} /></div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ fontSize: 36, marginBottom: 12 }}>🔔</p>
          <h3 style={{ fontWeight: 700, marginBottom: 8 }}>All clear!</h3>
          <p style={{ color: 'var(--gray-600)', fontSize: 14 }}>No pending match notifications. Turn on AI matching to get found faster.</p>
        </div>
      ) : (
        notifications.map(notif => {
          const expired = new Date(notif.expiresAt).getTime() < Date.now();
          const progress = getProgressPercent(notif.createdAt, notif.expiresAt);

          return (
            <div key={notif.id} className="card fade-up" style={{ marginBottom: 16, opacity: expired || notif.acted ? 0.6 : 1 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: notif.acted ? 'var(--card-tint)' : 'var(--purple)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 18, flexShrink: 0,
                }}>
                  {notif.acted ? '✓' : '🎯'}
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 10, color: 'var(--ink)' }}>
                    {notif.message}
                  </p>

                  {/* Time remaining bar */}
                  {!expired && !notif.acted && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 12, color: progress > 75 ? '#DC2626' : 'var(--gray-600)', fontWeight: progress > 75 ? 700 : 400 }}>
                          ⏱️ {getTimeRemaining(notif.expiresAt)}
                        </span>
                        <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
                          {new Date(notif.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <div style={{ height: 4, background: 'var(--card-tint)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', width: `${progress}%`,
                          background: progress > 75 ? '#DC2626' : 'var(--purple)',
                          borderRadius: 99, transition: 'width 0.3s',
                        }} />
                      </div>
                    </div>
                  )}

                  {!notif.acted && !expired && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn-primary" style={{ fontSize: 13, padding: '8px 16px' }} onClick={() => handleAct(notif.id, true)}>
                        ✓ Accept Match
                      </button>
                      <button className="btn-ghost" onClick={() => handleAct(notif.id, false)}>
                        Decline
                      </button>
                    </div>
                  )}
                  {notif.acted && (
                    <span style={{ fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>✓ Responded</span>
                  )}
                  {expired && !notif.acted && (
                    <span style={{ fontSize: 13, color: '#DC2626', fontWeight: 600 }}>⏰ Window expired</span>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
