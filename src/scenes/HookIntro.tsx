import { Audio, staticFile } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** 0:00–1:30 · Hook — mountain sunrise awakening. */
export const HookIntro: React.FC = () => (
  <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
    <Audio src={staticFile('navaratri-sadhana/vo/01.mp3')} />
    <PhotoSlide file="01-hook-sunrise.jpg" span={[0, 2700]} zoom={[1.0, 1.14]} position="50% 40%" />
    <ProgressDots activeDay={1} />
  </div>
);
