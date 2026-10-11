import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground } from '../components/CinematicBackground';
import { ChakraSpine, ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** Glowing Om glyph — pure symbol, no words. */
const Om: React.FC<{ size: number; opacity: number; y?: number }> = ({ size, opacity, y = 0 }) => {
  const frame = useFrame();
  const breathe = 1 + 0.02 * Math.sin(frame * 0.05);
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px) scale(${breathe})`,
        fontSize: size,
        lineHeight: 1,
        color: '#FFF7E6',
        textShadow:
          '0 0 40px rgba(253,230,138,0.9), 0 0 120px rgba(234,179,8,0.6), 0 6px 40px rgba(0,0,0,0.8)',
      }}
    >
      ॐ
    </div>
  );
};

const ORBS = [
  { color: '#38BDF8', glow: 'rgba(56,189,248,0.8)', r: 130 }, // Tamas · energy
  { color: '#EAB308', glow: 'rgba(234,179,8,0.8)', r: 150 }, // Rajas · creation
  { color: '#FDE68A', glow: 'rgba(253,230,138,0.9)', r: 130 }, // Sattva · mastery
];

/** 0:00–1:30 · Hook & Introduction — sunrise, three energies, Om. No text. */
export const HookIntro: React.FC = () => {
  const frame = useFrame();
  const glow = interpolate(frame, [0, 2700], [0, 1]);

  const omEnter = interpolate(frame, [60, 140], [0, 1], { extrapolateRight: 'clamp' });
  const omLeave = interpolate(frame, [1250, 1400], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const bigOm = interpolate(frame, [2080, 2160], [0, 1], { extrapolateRight: 'clamp' });
  const bigOmY = interpolate(frame, [2080, 2160], [60, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/01.mp3')} />
      <CinematicBackground progress={glow * 0.35}>
        <ParticleField count={110} color="#7DD3FC" maxSize={4} speed={0.7} />
        <SacredGeometry size={1000} opacity={0.16} />
      </CinematicBackground>

      <ProgressDots activeDay={1} />

      {/* Beat 1 — lone Om in the sunrise */}
      {frame < 1400 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: omEnter * omLeave,
          }}
        >
          <Om size={300} opacity={1} />
        </div>
      )}

      {/* Beat 2 — three energies ignite */}
      {frame >= 1400 && frame < 2050 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 120,
          }}
        >
          {ORBS.map((o, i) => {
            const e = interpolate(frame - (1500 + i * 120), [0, 40], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const pulse = 1 + 0.05 * Math.sin(frame * 0.08 + i * 2);
            return (
              <div
                key={i}
                style={{
                  opacity: e,
                  width: o.r * 2 * pulse,
                  height: o.r * 2 * pulse,
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 40% 35%, #FFF7E6 0%, ${o.color} 35%, transparent 70%)`,
                  boxShadow: `0 0 80px 20px ${o.glow}`,
                }}
              />
            );
          })}
        </div>
      )}

      {/* Beat 3 — radiant Om */}
      {frame >= 2050 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: bigOm,
          }}
        >
          <Om size={380} opacity={1} y={bigOmY} />
        </div>
      )}

      {frame < 2050 && <ChakraSpine activeIndex={1} />}
    </div>
  );
};
