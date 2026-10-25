import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { PhotoSlide } from '../components/PhotoSlide';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** Phase 3 (60s · 1800 frames) — Days 6–9: fierce Kalaratri action & Siddhidatri mastery. */
export const Phase3: React.FC = () => {
  const frame = useFrame();
  const isSiddhi = frame > 910;
  const flash = !isSiddhi && Math.sin(frame * 0.18) > 0.94 ? 0.2 : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/05.mp3')} />

      {/* Days 6–7: Fierce Goddess Kalaratri severing negativity */}
      <PhotoSlide
        file="assets/05_days6_7_goddess_kalaratri.png"
        span={[0, 930]}
        zoom={[1.06, 1.20]}
        pan={{ x: [-25, 25], y: [15, -15] }}
        position="50% 30%"
        fade={25}
        pulseGlow={{ x: 960, y: 360, color: '#F97316', size: 360 }}
        titleCard={{
          dayBadge: 'DAYS 6–7 · KALARATRI',
          tamilTitle: 'காளராத்திரி — உக்கிர செயல்',
          subTitle: 'அழிப்பது புனிதமானது · Sever Toxic Attachments with Fierce Courage',
        }}
      />

      {/* Days 8–9: Goddess Siddhidatri granting supreme siddhi */}
      <PhotoSlide
        file="assets/06_days8_9_goddess_siddhidatri.png"
        span={[905, 1800]}
        zoom={[1.05, 1.15]}
        pan={{ x: [0, 0], y: [20, -10] }}
        position="50% 45%"
        fade={25}
        pulseGlow={{ x: 960, y: 340, color: '#FDE68A', size: 340 }}
        titleCard={{
          dayBadge: 'DAYS 8–9 · SIDDHIDATRI',
          tamilTitle: 'சித்திதாத்ரி — பூரணத்துவம்',
          subTitle: 'முயற்சியை நிறுத்துங்கள் · Rest the Effort, Receive Perfection',
        }}
      />

      {/* Dynamic fire embers (Kalaratri) / golden grace shower (Siddhidatri) */}
      <ParticleField
        count={isSiddhi ? 75 : 95}
        color={isSiddhi ? '#FBBF24' : '#F97316'}
        speed={isSiddhi ? 0.7 : 1.7}
        maxSize={isSiddhi ? 4 : 5}
      />

      {/* Subtle lightning flash on Kalaratri's blade */}
      {flash > 0 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: '#FFF',
            opacity: flash,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
          }}
        />
      )}

      {/* Sacred geometry mandala during Siddhidatri's grace */}
      {isSiddhi && (
        <SacredGeometry x={960} y={540} size={860} opacity={0.16} color="#EAB308" />
      )}

      <ProgressDots activeDay={isSiddhi ? 8 : 6} />
    </div>
  );
};
