'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Locally-hosted 2.5D portrait animation. No external avatar provider or subscription.
 * Mouth motion is an expressive loop switched on/off by live AI audio activity;
 * it is NOT phoneme-accurate lip synchronization.
 */
export default function AnimatedCounselor({
  speaking = false,
  voiceLevel = 0,
  previewSmile = false,
  reducedMotion = false,
  alt = 'Mindora виртуалды AI-кеңесшісі',
}: {
  speaking?: boolean;
  voiceLevel?: number;
  previewSmile?: boolean;
  reducedMotion?: boolean;
  alt?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const refresh = () => setPrefersReducedMotion(query.matches);
    refresh();
    query.addEventListener?.('change', refresh);
    return () => query.removeEventListener?.('change', refresh);
  }, []);
  const canMove = !reducedMotion && !prefersReducedMotion;
  useEffect(() => {
    // Imperative CSS variable: no unnecessary React tree updates for the waveform.
    rootRef.current?.style.setProperty('--mindora-voice', String(Math.min(1, Math.max(0, voiceLevel))));
  }, [voiceLevel]);

  return (
    <div
      ref={rootRef}
      className={[
        'mindora-living-portrait',
        speaking && canMove ? 'mindora-is-speaking' : 'mindora-is-listening',
        previewSmile && canMove ? 'mindora-is-smiling' : '',
        !canMove ? 'mindora-no-motion' : '',
      ].filter(Boolean).join(' ')}
      role="img"
      aria-label={alt}
    >
      <div className="mindora-avatar-aura" aria-hidden="true" />
      <div className="mindora-avatar-floating">
        <img className="mindora-portrait-base" src="/media/avatar-live-idle.webp" alt="" aria-hidden="true" draggable={false} />
        <img className="mindora-portrait-blink" src="/media/avatar-live-blink.webp" alt="" aria-hidden="true" draggable={false} />
        {canMove && speaking && !previewSmile && <img className="mindora-portrait-talking" src="/media/avatar-live-talking.webp" alt="" aria-hidden="true" draggable={false} />}
        {canMove && previewSmile && <img className="mindora-portrait-smile" src="/media/avatar-live-smiling.webp" alt="" aria-hidden="true" draggable={false} />}
      </div>
      <div className="mindora-avatar-sparkle one" aria-hidden="true" />
      <div className="mindora-avatar-sparkle two" aria-hidden="true" />
    </div>
  );
}
