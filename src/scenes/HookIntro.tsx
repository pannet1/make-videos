import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ChakraSpine, ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { PhotoSlide } from '../components/PhotoSlide';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** Hook & Intro (53s · 1590 frames) — Kundalini journey. */
export const HookIntro: React.FC = () => {
  const frame = useFrame();
  const chakraIndex = Math.min(6, Math.max(0, Math.floor(frame / 225)));

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/01.mp3')} />

      {/* Kundalini awakening artwork exclusively from assets/ */}
      <PhotoSlide
        file="assets/01_intro_kundalini_journey.png"
        span={[0, 1590]}
        zoom={[1.06, 1.16]}
        pan={{ x: [-120, 100], y: [10, -10] }}
        position="50% 50%"
        fade={20}
        pulseGlow={{ x: 480, y: 320, color: '#38BDF8', size: 320 }}
        titleCard={{
          dayBadge: 'AWAKENING · THE INNER SCIENCE',
          tamilTitle: 'நவராத்திரி சாதனா — குண்டலினி சக்தி',
          subTitle: 'Ascending through the 7 Chakras · Meeting Shiva at the Crown',
        }}
      />

      {/* Atmospheric prana particles */}
      <ParticleField count={65} color="#38BDF8" speed={0.8} maxSize={4} />

      {/* Subtle rotating sacred geometry mandala */}
      <SacredGeometry x={480} y={540} size={820} opacity={0.16} color="#FDE68A" />

      {/* 7-Chakra spine indicator ascending in sync with voiceover */}
      <ChakraSpine activeIndex={chakraIndex} />

      <ProgressDots activeDay={1} />
    </div>
  );
};
