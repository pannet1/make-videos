import { Audio, staticFile } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** 9:30–10:30 · Outro — Thanjavur temple at sunrise. Completion. */
export const Outro: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
    <Audio src={staticFile('navaratri-sadhana/vo/06.mp3')} />
    <PhotoSlide file="08-temple-outro.jpg" span={[0, 1800]} zoom={[1.0, 1.12]} position="50% 50%" />
    <ProgressDots activeDay={9} />
  </div>
);
