import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** 5:30–7:30 · Days 4–5 — the seed, then devotees together. */
export const Phase2: React.FC = () => {
  const frame = useFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/04.mp3')} />
      <PhotoSlide file="05-seed.jpg" span={[0, 1860]} zoom={[1.12, 1.0]} position="50% 55%" />
      <PhotoSlide file="06-devotees.jpg" span={[1800, 3600]} zoom={[1.0, 1.1]} position="50% 45%" />
      <ProgressDots activeDay={frame > 1800 ? 5 : 4} />
    </div>
  );
};
