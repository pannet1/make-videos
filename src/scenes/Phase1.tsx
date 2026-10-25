import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { PhotoSlide } from '../components/PhotoSlide';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** Phase 1 (85s · 2550 frames) — Days 1–3: Shailaputri, Brahmacharini, Chandraghanta. */
export const Phase1: React.FC = () => {
  const frame = useFrame();
  const activeDay = frame < 850 ? 1 : frame < 1700 ? 2 : 3;

  const particleColor =
    frame < 850 ? '#E0F2FE' : frame < 1700 ? '#6EE7B7' : '#FDE68A';

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/03.mp3')} />

      {/* Day 1: Goddess Shailaputri — Foundation of Honesty */}
      <PhotoSlide
        file="assets/03_day1_goddess_shailaputri.png"
        span={[0, 1020]}
        zoom={[1.05, 1.16]}
        pan={{ x: [-25, 20], y: [10, -10] }}
        position="50% 50%"
        fade={25}
        pulseGlow={{ x: 1240, y: 350, color: '#FDE68A', size: 300 }}
        titleCard={{
          dayBadge: 'DAY 1 · SHAILAPUTRI',
          tamilTitle: 'சைலபுத்ரி — மலைகளின் மகள்',
          subTitle: 'முழு நேர்மை · Close the Knowledge Gap',
        }}
      />

      {/* Days 2–3: Goddess Brahmacharini — Storing Prana & Warrior Resolve */}
      <PhotoSlide
        file="assets/03b_day2_goddess_brahmacharini.png"
        span={[995, 2550]}
        zoom={[1.04, 1.16]}
        pan={{ x: [20, -15], y: [15, -10] }}
        position="50% 45%"
        fade={25}
        pulseGlow={{ x: 960, y: 320, color: '#34D399', size: 320 }}
        titleCard={{
          dayBadge: 'DAYS 2–3 · BRAHMACHARINI',
          tamilTitle: 'பிரம்மச்சாரிணி — தவ மாணவி & உறுதியான முடிவு',
          subTitle: 'உயிர்ச்சக்தியைச் சேமியுங்கள் · Charge the Inner Battery & Protect Your Time',
        }}
      />

      {/* Living atmospheric particles adapting to each day's energy */}
      <ParticleField count={60} color={particleColor} speed={0.7} maxSize={4} />

      {/* Sacred geometry mandala during meditation & focus */}
      {frame >= 995 && (
        <SacredGeometry x={960} y={540} size={760} opacity={0.18} color="#6EE7B7" />
      )}

      <ProgressDots activeDay={activeDay} />
    </div>
  );
};
