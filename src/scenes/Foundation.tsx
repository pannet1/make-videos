import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { BlueFlame } from '../components/BlueFlame';
import { CinematicBackground } from '../components/CinematicBackground';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import React from 'react';

/** Five dark karmic orbs drifting into the flame and dissolving. No text. */
export const Foundation: React.FC = () => {
  const frame = useFrame();
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060D' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/02.mp3')} />
      <CinematicBackground progress={0.12}>
        <ParticleField count={70} color="#38BDF8" maxSize={4} speed={1.2} />
      </CinematicBackground>

      <BlueFlame size={460} x={470} y={560} />
      <ProgressDots activeDay={1} />

      {/* karmic orbs */}
      {[0, 1, 2, 3, 4].map((i) => {
        const start = 700 + i * 320;
        const y = 300 + i * 130;
        const drift = interpolate(frame - start, [0, 300], [0, -460], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const op = interpolate(frame - start, [0, 60, 240, 300], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const shrink = interpolate(frame - start, [180, 300], [1, 0.2], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        const size = 90 * shrink + 8;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 1350 + drift,
              top: y,
              width: size,
              height: size,
              borderRadius: '50%',
              opacity: op,
              filter: `blur(${(1 - op) * 2 + (1 - shrink) * 8}px)`,
              background:
                'radial-gradient(circle at 40% 35%, rgba(127,29,29,0.9) 0%, rgba(2,6,23,0.95) 65%)',
              boxShadow: '0 0 30px rgba(127,29,29,0.6)',
            }}
          />
        );
      })}

      {/* rising light pillar where the burdens dissolve */}
      <div
        style={{
          position: 'absolute',
          left: 830,
          top: 150,
          bottom: 150,
          width: 90,
          opacity: interpolate(frame, [900, 2000], [0, 0.55], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          background:
            'linear-gradient(180deg, transparent, rgba(56,189,248,0.5) 50%, transparent)',
          filter: 'blur(18px)',
        }}
      />
    </div>
  );
};
