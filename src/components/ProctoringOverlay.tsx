'use client';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useProctoringEngine } from '@/hooks/useProctoringEngine';
import type { ProctoringSnapshot } from '@/hooks/useProctoringEngine';

interface Props {
  active: boolean; // only run when assessment is in progress
}

const GAZE_ICON: Record<ProctoringSnapshot['gazeDir'], string> = {
  center: '👁️ Center',
  left:   '👀← Left',
  right:  '→👀 Right',
  up:     '↑ Up',
  down:   '📱 Down',
};

const HEAD_ICON: Record<ProctoringSnapshot['headPose'], string> = {
  forward: '🎯 Forward',
  left:    '← Turned',
  right:   '→ Turned',
  down:    '↓ Tilted',
};

export default function ProctoringOverlay({ active }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [camReady, setCamReady] = useState(false);
  const [camError, setCamError] = useState('');
  const [showLog, setShowLog] = useState(false);

  const snap = useProctoringEngine(active && camReady ? videoRef : { current: null });

  // Start camera
  const startCam = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 200, height: 150, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setCamReady(true);
      }
    } catch {
      setCamError('Camera denied');
    }
  }, []);

  useEffect(() => {
    if (active) startCam();
    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach(t => t.stop());
      }
    };
  }, [active, startCam]);

  if (!active) return null;

  const hasAlert = snap.faceCount === 0 || snap.faceCount > 1 ||
    snap.gazeDir !== 'center' || snap.headPose !== 'forward';

  return (
    <>
      <style>{`
        @keyframes alertPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(239,68,68,0.5); }
          50%       { box-shadow: 0 0 0 8px rgba(239,68,68,0); }
        }
        .proctor-alert { animation: alertPulse 1.5s infinite; }

        @keyframes logSlide {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        .log-slide { animation: logSlide 0.2s ease; }
      `}</style>

      <div style={{
        position: 'fixed', top: 72, right: 20, zIndex: 1000,
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
        fontFamily: "'Inter Tight', sans-serif",
      }}>

        {/* Violation log panel */}
        {showLog && snap.flags.length > 0 && (
          <div className="log-slide" style={{
            background: 'var(--bg-2)', border: '1px solid var(--border)',
            borderRadius: 10, padding: 12, width: 240,
            maxHeight: 240, overflowY: 'auto',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink-4)', marginBottom: 8, letterSpacing: '0.06em' }}>
              VIOLATION LOG ({snap.flagCount})
            </div>
            {snap.flags.map(f => (
              <div key={f.id} style={{
                display: 'flex', gap: 7, alignItems: 'flex-start',
                padding: '6px 0', borderBottom: '1px solid var(--border)',
              }}>
                <span style={{ fontSize: 13, flexShrink: 0 }}>{f.icon}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 11, color: f.severity === 'alert' ? '#F87171' : '#FCD34D', fontWeight: 600, margin: 0 }}>{f.message}</p>
                  <p style={{ fontSize: 10, color: 'var(--ink-4)', margin: 0 }}>{f.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Main proctoring widget */}
        <div style={{
          background: 'var(--bg-2)',
          border: `1px solid ${hasAlert && !snap.loading ? 'rgba(239,68,68,0.5)' : 'var(--green)'}`,
          borderRadius: 12, overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.6)',
          width: 200,
        }} className={hasAlert && !snap.loading && snap.ready ? 'proctor-alert' : ''}>

          {/* Camera feed */}
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              muted
              playsInline
              style={{ width: '100%', height: 150, objectFit: 'cover', transform: 'scaleX(-1)', display: 'block' }}
            />

            {/* Loading overlay */}
            {snap.loading && camReady && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.8)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                <div className="ai-loading-spinner" />
                <p style={{ fontSize: 10, color: 'var(--ink-3)' }}>Loading AI models…</p>
              </div>
            )}

            {/* Cam error */}
            {camError && (
              <div style={{
                position: 'absolute', inset: 0, background: 'rgba(8,8,8,0.9)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <p style={{ fontSize: 11, color: '#F87171', textAlign: 'center', padding: 8 }}>📵 {camError}</p>
              </div>
            )}

            {/* Face count badge */}
            {snap.ready && (
              <div style={{
                position: 'absolute', top: 6, left: 6,
                background: snap.faceCount === 1 ? 'rgba(0,0,0,0.75)' : 'rgba(220,38,38,0.85)',
                borderRadius: 6, padding: '2px 7px', fontSize: 10, fontWeight: 700,
                color: snap.faceCount === 1 ? 'var(--green)' : '#fff',
              }}>
                {snap.faceCount === 0 ? '⚠ NO FACE' : snap.faceCount === 1 ? '✓ 1 FACE' : `⚠ ${snap.faceCount} FACES`}
              </div>
            )}
          </div>

          {/* Status indicators */}
          <div style={{ padding: '8px 10px', background: 'var(--bg-3)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <span style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: snap.ready ? (hasAlert ? '#EF4444' : 'var(--green)') : '#888',
                  animation: snap.ready && !hasAlert ? 'pulse 2s infinite' : 'none',
                }} />
                <span style={{ fontSize: 10, fontWeight: 700, color: snap.ready ? (hasAlert ? '#F87171' : 'var(--green)') : 'var(--ink-4)', letterSpacing: '0.04em' }}>
                  {snap.loading ? 'INITIALISING' : snap.ready ? (hasAlert ? 'VIOLATION' : 'PROCTORED') : 'STANDBY'}
                </span>
              </div>
              {snap.flagCount > 0 && (
                <button
                  onClick={() => setShowLog(v => !v)}
                  style={{
                    background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                    color: '#F87171', borderRadius: 5, padding: '1px 7px', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                  }}
                >
                  {snap.flagCount} flags {showLog ? '▾' : '▸'}
                </button>
              )}
            </div>

            {/* Live metrics */}
            {snap.ready && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <MetricRow label="Gaze" value={GAZE_ICON[snap.gazeDir]} ok={snap.gazeDir === 'center'} />
                <MetricRow label="Head" value={HEAD_ICON[snap.headPose] ?? '🎯 Forward'} ok={snap.headPose === 'forward'} />
                <MetricRow label="Eyes" value={snap.eyesClosed ? '😑 Closed' : '👁 Open'} ok={!snap.eyesClosed} />
                {snap.geminiAuditing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4, padding: '4px 8px', background: 'rgba(129,140,248,0.1)', borderRadius: 6, border: '1px solid rgba(129,140,248,0.3)' }}>
                    <div className="ai-loading-spinner" style={{ width: 10, height: 10, borderWidth: 1.5, borderTopColor: '#818CF8' }} />
                    <span style={{ fontSize: 10, color: '#818CF8', fontWeight: 600 }}>Gemini auditing…</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

function MetricRow({ label, value, ok }: { label: string; value: string; ok: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: 10, color: 'var(--ink-4)', fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 10, color: ok ? 'var(--green)' : '#F87171', fontWeight: 700 }}>{value}</span>
    </div>
  );
}
