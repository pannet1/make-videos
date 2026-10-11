import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground } from '../components/CinematicBackground';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** 5:30–7:30 · Phase 2 — Bindu seed, then two co-creating orbits. No text. */
export const Phase2: React.FC = () => {
  const frame = useFrame();
  const secondHalf = frame > 1800;
  const seedScale = interpolate(frame, [700, 1900], [0.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const seedGlow = interpolate(frame, [700, 1900], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  // Two co-creating lights orbiting the seed (Day 5)
  const orbitA = frame * 0.022;
  const orbitR = 210;
  const ax = Math.cos(orbitA) * orbitR;
  const ay = Math.sin(orbitA) * orbitR * 0.55;

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/04.mp3')} />
      <CinematicBackground progress={0.62}>
        <ParticleField count={120} color="#FDE68A" maxSize={5} speed={0.8} />
        <SacredGeometry size={850} opacity={0.3} color="#FDE68A" />
      </CinematicBackground>
      <ProgressDots activeDay={secondHalf ? 5 : 4} />

      <div style={{ position: 'absolute', left: 0, right: 0, top: 350, display: 'flex', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 560, height: 560 }}>
          {/* aura */}
          <div
            style={{
              position: 'absolute',
              inset: -60,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(253,230,138,0.35) 0%, transparent 65%)',
              filter: 'blur(20px)',
              opacity: seedGlow,
            }}
          />
          {/* Bindu seed */}
          <div
            style={{
              position: 'absolute',
              left: 280 - 90 * seedScale,
              top: 280 - 90 * seedScale,
              width: 180 * seedScale,
              height: 180 * seedScale,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 30%, #FFFBEB 0%, #FDE68A 30%, #EAB308 60%, #92400E 100%)',
              boxShadow: `0 0 ${60 * seedGlow + 10}px rgba(234,179,8,${0.9 * seedGlow})`,
            }}
          />
          {/* co-creating orbit pair */}
          {secondHalf && (
            <>
              <div
                style={{
                  position: 'absolute',
                  left: 280 + ax - 26,
                  top: 280 + ay - 26,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFF7E6, #38BDF8 70%)',
                  boxShadow: '0 0 30px rgba(56,189,248,0.9)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 280 - ax - 26,
                  top: 280 - ay - 26,
                  width: 52,
                  height: 52,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, #FFF7E6, #F97316 70%)',
                  boxShadow: '0 0 30px rgba(249,115,22,0.9)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 280 - orbitR,
                  top: 280 - orbitR * 0.55,
                  width: orbitR * 2,
                  height: orbitR * 1.1,
                  borderRadius: '50%',
                  border: '1px solid rgba(253,230,138,0.35)',
                }}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};
