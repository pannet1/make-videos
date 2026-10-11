import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** 3:00–5:30 · Days 1–3 — journal honesty, then meditative energy. */
export const Phase1: React.FC = () => {
  const frame = useFrame();
  const activeDay = Math.min(3, Math.floor(frame / 1500) + 1);
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/03.mp3')} />
      <PhotoSlide file="03-journal.jpg" span={[0, 2280]} zoom={[1.0, 1.1]} position="50% 50%" />
      <PhotoSlide file="04-meditation.jpg" span={[2220, 4500]} zoom={[1.08, 1.16]} position="50% 45%" />
      <ProgressDots activeDay={activeDay} />
    </div>
  );
};
