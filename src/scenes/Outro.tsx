import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { PhotoSlide } from '../components/PhotoSlide';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** Outro (42s · 1260 frames) — 9-Day Arc recap into sacred temple Devi darshan completion. */
export const Outro: React.FC = () => {
  const frame = useFrame();

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/06.mp3')} />

      {/* Part 1: Arc recap — divine grace */}
      <PhotoSlide
        file="assets/06_days8_9_goddess_siddhidatri.png"
        span={[0, 450]}
        zoom={[1.05, 1.14]}
        pan={{ x: [0, 0], y: [10, -10] }}
        position="50% 45%"
        fade={25}
        pulseGlow={{ x: 960, y: 340, color: '#FDE68A', size: 300 }}
        titleCard={{
          dayBadge: 'THE 9-DAY ARC',
          tamilTitle: 'இருளிலிருந்து ஒளிக்கு',
          subTitle: 'Tamas → Rajas → Sattva · The Complete Transformation',
        }}
      />

      {/* Part 2: Sacred Temple sanctuary Devi darshan & sadhana completion exclusively from assets/ */}
      <PhotoSlide
        file="assets/07_outro_sadhana_completion.png"
        span={[425, 1260]}
        zoom={[1.05, 1.16]}
        pan={{ x: [0, 0], y: [20, -15] }}
        position="50% 50%"
        fade={25}
        pulseGlow={{ x: 960, y: 190, color: '#FDE68A', size: 380 }}
        titleCard={{
          dayBadge: 'COMPLETION · SIDDHI',
          tamilTitle: 'நவராத்திரி சாதனா பூரணம்',
          subTitle: 'தேவி உங்கள் கலையைப் பூரணமாக்கட்டும் · Jai Devi',
        }}
      />

      {/* Golden morning dust motes */}
      <ParticleField count={60} color="#FDE68A" speed={0.5} maxSize={4} />

      {/* Sacred geometry mandala of completion */}
      <SacredGeometry x={960} y={540} size={840} opacity={0.14} color="#EAB308" />

      <ProgressDots activeDay={9} />
    </div>
  );
};
