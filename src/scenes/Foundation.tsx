import { Audio, staticFile, useFrame } from '@rendiv/core';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { PhotoSlide } from '../components/PhotoSlide';
import React from 'react';

/** Mahalaya Amavasya (54s · 1620 frames) — Blue Fire karma cleansing. */
export const Foundation: React.FC = () => {
  const frame = useFrame();
  const flameFlicker = 0.82 + 0.18 * Math.sin(frame * 0.35) + 0.08 * Math.sin(frame * 0.9);

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#000' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/02.mp3')} />

      {/* Blue Fire karma-dissolving artwork exclusively from assets/ */}
      <PhotoSlide
        file="assets/02_mahalaya_amavasya_blue_fire.png"
        span={[0, 1620]}
        zoom={[1.06, 1.18]}
        pan={{ x: [0, 0], y: [35, -20] }}
        position="50% 50%"
        fade={20}
        pulseGlow={{ x: 960, y: 550, color: '#38BDF8', size: 360 }}
        titleCard={{
          dayBadge: 'MAHALAYA AMAVASYA · BLUE FIRE',
          tamilTitle: 'மகாளய அமாவாசை — நீல நெருப்பு',
          subTitle: 'முன்னோர் கர்மாவைத் தூய்மைப்படுத்துங்கள் · Dissolve 7 Generations of Burden',
        }}
      />

      {/* Dynamic cool blue fire embers & ancestral spirits rising */}
      <ParticleField count={80} color="#38BDF8" speed={1.2} maxSize={5} />

      {/* Dynamic blue flame hearth aura on the altar */}
      <div
        style={{
          position: 'absolute',
          left: 960 - 200,
          top: 540 - 150,
          width: 400,
          height: 400,
          borderRadius: '50%',
          pointerEvents: 'none',
          mixBlendMode: 'screen',
          background:
            'radial-gradient(ellipse at 50% 70%, rgba(56,189,248,0.45) 0%, rgba(14,165,233,0.2) 40%, transparent 70%)',
          filter: 'blur(35px)',
          opacity: flameFlicker,
          transform: `scale(${0.95 + 0.1 * flameFlicker})`,
        }}
      />

      <ProgressDots activeDay={1} />
    </div>
  );
};
