import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** Phase 2 (54s · 1620 frames) — Days 4–5: Kushmanda cosmic seed (bindu) & Skandamata purpose. */
export const Phase2: React.FC = () => {
  const frame = useFrame();
  const isDay5 = frame > 815;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/04.mp3')} />

      {/* Day 4: Goddess Kushmanda holding the cosmic seed in space */}
      <PhotoSlide
        file="assets/04_day4_goddess_kushmanda.png"
        span={[0, 835]}
        zoom={[1.06, 1.18]}
        pan={{ x: [20, -20], y: [-15, 15] }}
        position="50% 50%"
        fade={25}
        pulseGlow={{ x: 1160, y: 220, color: '#FDE68A', size: 340 }}
        titleCard={{
          dayBadge: 'DAY 4 · KUSHMANDA',
          tamilTitle: 'கூஷ்மாண்டா — பிரபஞ்ச படைப்பாளி',
          subTitle: 'எண்ண விதை · Plant the Divine Seed (Bindu) Within',
        }}
      />

      {/* Day 5: Goddess Skandamata mother of purpose & co-creation */}
      <PhotoSlide
        file="assets/04b_day5_goddess_skandamata.png"
        span={[810, 1620]}
        zoom={[1.05, 1.15]}
        pan={{ x: [0, 0], y: [15, -10] }}
        position="50% 45%"
        fade={25}
        pulseGlow={{ x: 960, y: 260, color: '#FDE68A', size: 320 }}
        titleCard={{
          dayBadge: 'DAY 5 · SKANDAMATA',
          tamilTitle: 'ஸ்கந்தமாதா — நோக்கத்தின் தாய்',
          subTitle: 'இணைந்து படைப்பவர்கள் · Connect with Your Co-Creators',
        }}
      />

      {/* Living cosmic stardust / celestial light particles */}
      <ParticleField
        count={isDay5 ? 65 : 80}
        color={isDay5 ? '#FBBF24' : '#FDE68A'}
        speed={isDay5 ? 0.6 : 0.8}
        maxSize={4}
      />

      <ProgressDots activeDay={isDay5 ? 5 : 4} />
    </div>
  );
};
