import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground } from '../components/CinematicBackground';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import React from 'react';

/** Small flame teardrop that ignites. */
const FlameIcon: React.FC<{ lit: boolean; size?: number }> = ({ lit, size = 90 }) => (
  <div
    style={{
      width: size * 0.55,
      height: size,
      borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
      background: lit
        ? 'linear-gradient(180deg, #FFFBEB 0%, #FDE68A 30%, #F97316 65%, #7F1D1D 100%)'
        : 'rgba(255,247,230,0.08)',
      border: lit ? 'none' : '2px solid rgba(255,247,230,0.2)',
      boxShadow: lit ? '0 0 40px rgba(249,115,22,0.8)' : 'none',
      filter: lit ? 'blur(1px)' : 'none',
    }}
  />
);

/** 7:30–9:30 · Phase 3 — four flames ignite, then the golden bloom. No text. */
export const Phase3: React.FC = () => {
  const frame = useFrame();
  const fierce = frame < 2100;
  const shake = fierce ? Math.sin(frame * 0.9) * 4 : 0;
  const fire = fierce
    ? 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.25))
    : interpolate(frame, [2100, 2800], [1, 0.3], { extrapolateRight: 'clamp' });
  const grace = interpolate(frame, [2300, 3000], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bloom = interpolate(frame, [2400, 3200], [0.15, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/05.mp3')} />
      <CinematicBackground progress={fierce ? 0.72 : interpolate(frame, [2100, 3600], [0.72, 1])}>
        <ParticleField count={fierce ? 160 : 110} color={fierce ? '#F97316' : '#FDE68A'} maxSize={6} speed={fierce ? 2.2 : 0.7} />
      </CinematicBackground>

      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          bottom: -80,
          height: 420,
          opacity: fire,
          background:
            'radial-gradient(ellipse 60% 100% at 20% 100%, rgba(249,115,22,0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 100% at 55% 100%, rgba(234,179,8,0.5) 0%, transparent 60%), radial-gradient(ellipse 60% 100% at 85% 100%, rgba(127,29,29,0.6) 0%, transparent 60%)',
          filter: 'blur(24px)',
        }}
      />

      <ProgressDots activeDay={fierce ? 6 : 8} />

      <div style={{ position: 'absolute', inset: 0, transform: `translateX(${shake}px)` }}>
        {fierce ? (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 90,
            }}
          >
            {[0, 1, 2, 3].map((i) => {
              const litAt = 500 + i * 260;
              const lit = frame > litAt;
              const pop = interpolate(frame - litAt, [0, 22], [0.4, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <div key={i} style={{ transform: `scale(${pop})`, opacity: 0.3 + pop * 0.7 }}>
                  <FlameIcon lit={lit} size={150} />
                </div>
              );
            })}
          </div>
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: grace,
            }}
          >
            {/* golden bloom — receiving */}
            <div style={{ position: 'relative', width: 420, height: 420 }}>
              <div
                style={{
                  position: 'absolute',
                  inset: -80,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(253,230,138,0.4) 0%, transparent 65%)',
                  filter: 'blur(24px)',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  left: 210 - 150 * bloom,
                  top: 210 - 150 * bloom,
                  width: 300 * bloom,
                  height: 300 * bloom,
                  borderRadius: '50%',
                  background:
                    'radial-gradient(circle at 40% 35%, #FFFFFF 0%, #FFFBEB 25%, #FDE68A 55%, rgba(234,179,8,0.2) 100%)',
                  boxShadow: `0 0 ${100 * grace}px rgba(253,230,138,0.9)`,
                }}
              />
              {/* grace rays */}
              <div
                style={{
                  position: 'absolute',
                  left: -70,
                  top: 300,
                  width: 560,
                  height: 120,
                  background:
                    'conic-gradient(from 270deg at 50% 100%, transparent 0deg, rgba(253,230,138,0.35) 12deg, transparent 24deg, rgba(253,230,138,0.35) 36deg, transparent 48deg, rgba(253,230,138,0.35) 60deg, transparent 72deg, rgba(253,230,138,0.35) 84deg, transparent 96deg)',
                  filter: 'blur(6px)',
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
