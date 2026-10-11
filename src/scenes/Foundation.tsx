import { Audio, staticFile } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** 1:30–3:00 · Mahalaya Amavasya — rows of temple diyas. */
export const Foundation: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
    <Audio src={staticFile('navaratri-sadhana/vo/02.mp3')} />
    <PhotoSlide file="02-diyas.jpg" span={[0, 2700]} zoom={[1.12, 1.0]} position="50% 60%" />
    <ProgressDots activeDay={1} />
  </div>
);
