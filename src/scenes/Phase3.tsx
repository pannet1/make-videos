import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** 7:30–9:30 · Days 6–9 — fierce Kalaratri, then golden-temple grace. */
export const Phase3: React.FC = () => {
  const frame = useFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/05.mp3')} />
      <PhotoSlide file="09-kalaratri.jpg" span={[0, 2160]} zoom={[1.05, 1.18]} position="50% 18%" />
      <PhotoSlide file="07-temple.jpg" span={[2100, 3600]} zoom={[1.1, 1.0]} position="50% 55%" />
      <ProgressDots activeDay={frame > 2100 ? 8 : 6} />
    </div>
  );
};
