'use client';
import { useEffect, useRef, useState, useCallback } from 'react';

// ── MediaPipe CDN paths ────────────────────────────────────────────────────────
const WASM_PATH = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const FACE_DETECT_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite';
const FACE_LANDMARK_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';

// ── Tuning constants ──────────────────────────────────────────────────────────
// How long gaze must stay down + head tilted before we flag (typing = <1s, phone = 4s+)
const PHONE_GAZE_DURATION_MS = 4500;
// How long gaze must stay sideways before flagging (lateral = looking elsewhere)
const LATERAL_GAZE_DURATION_MS = 2500;
// Gemini snapshot audit every N ms when suspicious sustained behaviour detected
const GEMINI_AUDIT_INTERVAL_MS = 35000;

// ── Types ─────────────────────────────────────────────────────────────────────
export type FlagType =
  | 'NO_FACE'
  | 'MULTIPLE_FACES'
  | 'GAZE_LEFT'
  | 'GAZE_RIGHT'
  | 'GAZE_UP'
  | 'PHONE_SUSPECTED'     // was GAZE_DOWN — now smarter
  | 'HEAD_TURNED_LEFT'
  | 'HEAD_TURNED_RIGHT'
  | 'EYES_CLOSED'
  | 'GEMINI_ALERT';       // Gemini Flash visual audit result

export type ProctoringFlag = {
  id: string;
  type: FlagType;
  icon: string;
  message: string;
  time: string;
  severity: 'warn' | 'alert';
};

export type ProctoringSnapshot = {
  faceCount: number;
  gazeDir: 'center' | 'left' | 'right' | 'up' | 'down';
  headPose: 'forward' | 'left' | 'right' | 'down';
  eyesClosed: boolean;
  loading: boolean;
  ready: boolean;
  error: string;
  flags: ProctoringFlag[];
  flagCount: number;
  geminiAuditing: boolean;
};

// ── Landmark indices ──────────────────────────────────────────────────────────
const L_IRIS = 468; const R_IRIS = 473;
const L_EYE_OUTER = 33; const L_EYE_INNER = 133;
const L_EYE_TOP = 159; const L_EYE_BOT = 145;
const R_EYE_INNER = 362; const R_EYE_OUTER = 263;
const R_EYE_TOP = 386; const R_EYE_BOT = 374;
const NOSE_TIP = 1; const L_CHEEK = 234; const R_CHEEK = 454;
// Head PITCH: forehead vs chin landmarks
const FOREHEAD = 10;   // top of head
const CHIN = 152;      // bottom of chin

function now() {
  return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function makeFlag(type: FlagType, message: string, severity: 'warn' | 'alert'): ProctoringFlag {
  const icons: Record<FlagType, string> = {
    NO_FACE:          '😶',
    MULTIPLE_FACES:   '👥',
    GAZE_LEFT:        '👀←',
    GAZE_RIGHT:       '→👀',
    GAZE_UP:          '👀↑',
    PHONE_SUSPECTED:  '📱',
    HEAD_TURNED_LEFT: '🔄',
    HEAD_TURNED_RIGHT:'🔄',
    EYES_CLOSED:      '😑',
    GEMINI_ALERT:     '🤖',
  };
  return { id: `${type}-${Date.now()}`, type, icon: icons[type], message, time: now(), severity };
}

// ── Capture a video frame as base64 JPEG ──────────────────────────────────────
function captureFrame(video: HTMLVideoElement, quality = 0.6): string | null {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 320;
    canvas.height = video.videoHeight || 240;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    return canvas.toDataURL('image/jpeg', quality).split(',')[1];
  } catch { return null; }
}

// ── Hook ──────────────────────────────────────────────────────────────────────
export function useProctoringEngine(videoRef: React.RefObject<HTMLVideoElement | null>) {
  const [snap, setSnap] = useState<ProctoringSnapshot>({
    faceCount: 0, gazeDir: 'center', headPose: 'forward',
    eyesClosed: false, loading: true, ready: false, error: '',
    flags: [], flagCount: 0, geminiAuditing: false,
  });

  const detectorRef   = useRef<any>(null);
  const landmarkerRef = useRef<any>(null);
  const rafRef        = useRef<number>(0);
  const flagsRef      = useRef<ProctoringFlag[]>([]);
  const lastFlagTime  = useRef<Partial<Record<FlagType, number>>>({});
  const frameCount    = useRef(0);

  // ── Duration trackers for smart gaze-down detection ──────────────────────
  // Gaze-down only flagged after PHONE_GAZE_DURATION_MS of COMBINED (eyes down + head tilted)
  const gazeDownStart   = useRef<number>(0);
  const gazeLeftStart   = useRef<number>(0);
  const gazeRightStart  = useRef<number>(0);
  const lastGeminiAudit = useRef<number>(0);
  const geminiAuditing  = useRef(false);

  const addFlag = useCallback((f: ProctoringFlag) => {
    const DEBOUNCE: Partial<Record<FlagType, number>> = {
      NO_FACE:          2000,
      MULTIPLE_FACES:   3000,
      GAZE_LEFT:        5000,
      GAZE_RIGHT:       5000,
      GAZE_UP:          4000,
      PHONE_SUSPECTED:  8000,   // long debounce — this is a serious flag
      HEAD_TURNED_LEFT: 4000,
      HEAD_TURNED_RIGHT:4000,
      EYES_CLOSED:      6000,
      GEMINI_ALERT:     30000,
    };
    const last = lastFlagTime.current[f.type] ?? 0;
    if (Date.now() - last < (DEBOUNCE[f.type] ?? 3000)) return;
    lastFlagTime.current[f.type] = Date.now();
    flagsRef.current = [f, ...flagsRef.current].slice(0, 20);
  }, []);

  // ── Gemini Flash visual audit ─────────────────────────────────────────────
  const runGeminiAudit = useCallback(async (video: HTMLVideoElement) => {
    if (geminiAuditing.current) return;
    if (Date.now() - lastGeminiAudit.current < GEMINI_AUDIT_INTERVAL_MS) return;
    const frame = captureFrame(video);
    if (!frame) return;

    geminiAuditing.current = true;
    setSnap(s => ({ ...s, geminiAuditing: true }));
    lastGeminiAudit.current = Date.now();

    try {
      const res = await fetch('/api/proctor-snapshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: frame }),
      });
      const data = await res.json();
      if (data.suspicious) {
        addFlag(makeFlag('GEMINI_ALERT',
          `Gemini AI audit: ${data.reason}`, 'alert'));
      }
    } catch { /* network error — skip */ }
    finally {
      geminiAuditing.current = false;
      setSnap(s => ({ ...s, geminiAuditing: false }));
    }
  }, [addFlag]);

  useEffect(() => {
    let destroyed = false;

    async function init() {
      try {
        const { FaceDetector, FaceLandmarker, FilesetResolver } =
          await import('@mediapipe/tasks-vision');
        const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
        const [detector, landmarker] = await Promise.all([
          FaceDetector.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_DETECT_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO', minDetectionConfidence: 0.5,
          }),
          FaceLandmarker.createFromOptions(fileset, {
            baseOptions: { modelAssetPath: FACE_LANDMARK_MODEL, delegate: 'GPU' },
            runningMode: 'VIDEO', numFaces: 2,
            minFaceDetectionConfidence: 0.5, minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
            outputFaceBlendshapes: false, outputFacialTransformationMatrixes: false,
          }),
        ]);
        if (destroyed) { detector.close(); landmarker.close(); return; }
        detectorRef.current = detector; landmarkerRef.current = landmarker;
        setSnap(s => ({ ...s, loading: false, ready: true }));
        tick();
      } catch (err: any) {
        if (!destroyed) setSnap(s => ({ ...s, loading: false, error: err?.message ?? 'MediaPipe load failed' }));
      }
    }

    function tick() {
      if (destroyed) return;
      const video = videoRef.current;
      if (!video || video.readyState < 2) { rafRef.current = requestAnimationFrame(tick); return; }

      frameCount.current++;
      const ts = performance.now();
      const now_ms = Date.now();
      let faceCount = 0;
      let gazeDir: ProctoringSnapshot['gazeDir'] = 'center';
      let headPose: ProctoringSnapshot['headPose'] = 'forward';
      let eyesClosed = false;

      try {
        // ── Face detection (every frame) ────────────────────────────────────
        if (detectorRef.current) {
          const det = detectorRef.current.detectForVideo(video, ts);
          faceCount = det.detections?.length ?? 0;
          if (faceCount === 0) addFlag(makeFlag('NO_FACE', 'No face detected in frame', 'alert'));
          if (faceCount > 1)   addFlag(makeFlag('MULTIPLE_FACES', `${faceCount} faces detected — possible external help`, 'alert'));
        }

        // ── Landmarks (every 3rd frame) ─────────────────────────────────────
        if (landmarkerRef.current && frameCount.current % 3 === 0 && faceCount >= 1) {
          const lmr = landmarkerRef.current.detectForVideo(video, ts);
          const lm  = lmr.faceLandmarks?.[0];

          if (lm && lm.length >= 477) {

            // ── Iris gaze X (left/right) ─────────────────────────────────
            const lEyeW = Math.abs(lm[L_EYE_INNER].x - lm[L_EYE_OUTER].x);
            const rEyeW = Math.abs(lm[R_EYE_OUTER].x - lm[R_EYE_INNER].x);
            const lIrisNorm = lEyeW > 0.001 ? (lm[L_IRIS].x - lm[L_EYE_OUTER].x) / lEyeW : 0.5;
            const rIrisNorm = rEyeW > 0.001 ? (lm[R_IRIS].x - lm[R_EYE_INNER].x) / rEyeW : 0.5;
            const gazeX = (lIrisNorm + rIrisNorm) / 2;

            // ── Iris gaze Y (up/down) ────────────────────────────────────
            const lEyeH = Math.abs(lm[L_EYE_TOP].y - lm[L_EYE_BOT].y);
            const rEyeH = Math.abs(lm[R_EYE_TOP].y - lm[R_EYE_BOT].y);
            const lIrisNormY = lEyeH > 0.001 ? (lm[L_IRIS].y - lm[L_EYE_TOP].y) / lEyeH : 0.5;
            const rIrisNormY = rEyeH > 0.001 ? (lm[R_IRIS].y - lm[R_EYE_TOP].y) / rEyeH : 0.5;
            const gazeY = (lIrisNormY + rIrisNormY) / 2;

            // ── Head PITCH: forehead-to-chin tilt ────────────────────────
            // Positive = head tilting forward (chin toward chest = looking at phone below desk)
            const faceHeight = Math.abs(lm[FOREHEAD].y - lm[CHIN].y);
            const nosePct    = faceHeight > 0.001
              ? (lm[NOSE_TIP].y - lm[FOREHEAD].y) / faceHeight
              : 0.5;
            // nosePct < 0.40 = head tilting down (chin tucked), > 0.65 = head tilting back
            const headTiltedDown = nosePct < 0.40;

            // ── SMART GAZE-DOWN: require BOTH eyes-down AND head-tilt ────
            // This eliminates false positives from typing (eyes down but head stays level)
            const eyesLookingDown = gazeY > 0.75;
            const suspectedPhone  = eyesLookingDown && headTiltedDown;

            if (suspectedPhone) {
              if (gazeDownStart.current === 0) gazeDownStart.current = now_ms;
              const duration = now_ms - gazeDownStart.current;
              if (duration >= PHONE_GAZE_DURATION_MS) {
                gazeDir = 'down';
                addFlag(makeFlag('PHONE_SUSPECTED',
                  `Head tilted + gaze down for ${Math.round(duration/1000)}s — possible phone or notes`, 'alert'));
                // trigger Gemini visual audit when sustained suspicious behaviour
                runGeminiAudit(video);
              }
            } else {
              gazeDownStart.current = 0; // reset timer if posture normalises
            }

            // ── Lateral gaze with duration ───────────────────────────────
            if (gazeX < 0.28) {
              if (gazeRightStart.current === 0) gazeRightStart.current = now_ms;
              if (now_ms - gazeRightStart.current >= LATERAL_GAZE_DURATION_MS) {
                gazeDir = 'right';
                addFlag(makeFlag('GAZE_RIGHT', 'Sustained rightward gaze — looking away from screen', 'warn'));
              }
            } else { gazeRightStart.current = 0; }

            if (gazeX > 0.72) {
              if (gazeLeftStart.current === 0) gazeLeftStart.current = now_ms;
              if (now_ms - gazeLeftStart.current >= LATERAL_GAZE_DURATION_MS) {
                gazeDir = 'left';
                addFlag(makeFlag('GAZE_LEFT', 'Sustained leftward gaze — looking away from screen', 'warn'));
              }
            } else { gazeLeftStart.current = 0; }

            if (gazeY < 0.25 && !suspectedPhone) {
              gazeDir = 'up';
              addFlag(makeFlag('GAZE_UP', 'Looking far upward — possible external reference', 'warn'));
            }

            // ── Head pitch state for UI ──────────────────────────────────
            if (headTiltedDown) headPose = 'down';

            // ── Eye openness ─────────────────────────────────────────────
            const eyeOpen = (lEyeH + rEyeH) / 2;
            const eyeWidth = (lEyeW + rEyeW) / 2;
            eyesClosed = eyeWidth > 0.001 && (eyeOpen / eyeWidth) < 0.08;
            if (eyesClosed) addFlag(makeFlag('EYES_CLOSED', 'Eyes appear closed — possibly reading off-screen', 'warn'));

            // ── Head yaw (left/right turn) ───────────────────────────────
            const distL = Math.abs(lm[NOSE_TIP].x - lm[L_CHEEK].x);
            const distR = Math.abs(lm[NOSE_TIP].x - lm[R_CHEEK].x);
            const yawRatio = distL / (distR + 0.0001);
            if (!headTiltedDown) { // don't double-report when head is down
              if      (yawRatio < 0.60) { headPose = 'right'; addFlag(makeFlag('HEAD_TURNED_RIGHT', 'Head turned right — away from screen', 'warn')); }
              else if (yawRatio > 1.65) { headPose = 'left';  addFlag(makeFlag('HEAD_TURNED_LEFT',  'Head turned left — away from screen',  'warn')); }
            }
          }
        }
      } catch { /* frame error — skip silently */ }

      setSnap({
        faceCount, gazeDir, headPose, eyesClosed,
        loading: false, ready: true, error: '',
        flags: [...flagsRef.current],
        flagCount: flagsRef.current.length,
        geminiAuditing: geminiAuditing.current,
      });

      setTimeout(() => { rafRef.current = requestAnimationFrame(tick); }, 100);
    }

    init();
    return () => {
      destroyed = true;
      cancelAnimationFrame(rafRef.current);
      detectorRef.current?.close();
      landmarkerRef.current?.close();
    };
  }, [videoRef, addFlag, runGeminiAudit]);

  return snap;
}
