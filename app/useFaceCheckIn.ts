'use client';

import { useEffect, useRef, useState } from 'react';

type Observation = 'waiting' | 'face' | 'smile' | 'no-face' | 'unavailable';
export type CheckInCue = 'smile' | 'general';

/**
 * Optional, browser-local facial movement observation.
 * It never classifies happiness, anxiety, depression, fatigue or risk,
 * and never uploads images or video to Mindora/OpenAI.
 * The caller may request ONE voluntary, neutral check-in question.
 */
export function useFaceCheckIn({
  stream,
  enabled,
  onCheckIn,
}: {
  stream: MediaStream | null;
  enabled: boolean;
  onCheckIn: (cue: CheckInCue) => boolean;
}) {
  const [observation, setObservation] = useState<Observation>('waiting');
  const [error, setError] = useState('');
  const handlerRef = useRef(onCheckIn);
  handlerRef.current = onCheckIn;

  useEffect(() => {
    if (!enabled || !stream) {
      setObservation('waiting');
      setError('');
      return;
    }

    let cancelled = false;
    let frameId = 0;
    let detector: { detectForVideo: (video: HTMLVideoElement, now: number) => {
      faceLandmarks: unknown[];
      faceBlendshapes?: { categories: { categoryName: string; score: number }[] }[];
    }; close: () => void } | null = null;
    const video = document.createElement('video');
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.srcObject = stream;
    let lastFrameAt = 0;
    let lastLabel = '';
    let framesWithFace = 0;
    let framesWithSmile = 0;
    let checkInSent = false;
    const started = Date.now();

    async function start() {
      try {
        setObservation('waiting');
        setError('');
        // Only load the face model after the student explicitly enables this feature.
        const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision');
        if (cancelled) return;
        const fileset = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm',
        );
        if (cancelled) return;
        detector = await FaceLandmarker.createFromOptions(fileset, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
            delegate: 'CPU',
          },
          runningMode: 'VIDEO',
          numFaces: 1,
          outputFaceBlendshapes: true,
        });
        if (cancelled) { detector?.close(); return; }
        await video.play();
        if (cancelled) return;

        const read = (now: number) => {
          if (cancelled) return;
          frameId = requestAnimationFrame(read);
          if (document.hidden || video.readyState < 2 || now - lastFrameAt < 250) return;
          lastFrameAt = now; // Restrict detection to ~4 FPS to protect phone battery.
          try {
            const result = detector?.detectForVideo(video, now);
            const found = Boolean(result?.faceLandmarks?.length);
            if (!found) {
              if (lastLabel !== 'no-face') { lastLabel = 'no-face'; setObservation('no-face'); }
              return;
            }
            framesWithFace++;
            const shape = new Map(
              (result?.faceBlendshapes?.[0]?.categories ?? []).map(v => [v.categoryName, v.score]),
            );
            const smile = ((shape.get('mouthSmileLeft') ?? 0) + (shape.get('mouthSmileRight') ?? 0)) / 2;
            if (smile > 0.64) framesWithSmile++;
            const label: Observation = smile > 0.64 ? 'smile' : 'face';
            if (label !== lastLabel) { lastLabel = label; setObservation(label); }

            // A one-time, optional and non-diagnostic check-in after at least ~25 seconds.
            // Facial movements only select the wording; the student's own words decide mood.
            if (!checkInSent && Date.now() - started > 25000 && framesWithFace >= 12) {
              const cue: CheckInCue = framesWithSmile >= 7 ? 'smile' : 'general';
              if (handlerRef.current(cue)) checkInSent = true;
            }
          } catch (e) {
            // Recoverable frame errors should not interrupt the existing voice session.
            console.warn('Local face landmark frame skipped', e);
          }
        };
        frameId = requestAnimationFrame(read);
      } catch (e) {
        if (cancelled) return;
        console.warn('Optional facial movement analysis unavailable', e);
        setObservation('unavailable');
        setError('Model could not be loaded. Voice chat and camera preview remain available.');
      }
    }

    void start();
    return () => {
      cancelled = true;
      cancelAnimationFrame(frameId);
      video.pause();
      video.srcObject = null;
      try { detector?.close(); } catch {}
    };
  }, [enabled, stream]);

  return { observation, error };
}
