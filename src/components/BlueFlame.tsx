import { interpolate, useFrame } from '@rendiv/core';
import React from 'react';

/**
 * Layered CSS blue flame — core, mid glow, outer aura + flicker.
 * All motion derived from frame (sin + interpolate), render-safe.
 */
export const BlueFlame: React.FC<{ size?: number; x?: number; y?: number }> = ({
  size = 420,
  x = 480,
  y = 540,
}) => {
  const frame = useFrame();
  const flicker = 0.9 + 0.1 * Math.sin(frame * 0.35) + 0.05 * Math.sin(frame * 1.1 + 2);
  const sway = Math.sin(frame * 0.06) * 14;
  const breathe = interpolate(frame % 120, [0, 60, 120], [1, 1.06, 1]);

  return (
    <div style={{ position: 'absolute', left: x - size / 2 + sway, top: y - size / 2 }}>
      {/* outer aura */}
      <div
        style={{
          width: size * 2.4,
          height: size * 2.4,
          marginLeft: -size * 0.7,
          marginTop: -size * 0.7,
          borderRadius: '50%',
          position: 'absolute',
          background:
            'radial-gradient(circle, rgba(56,189,248,0.22) 0%, rgba(14,165,233,0.12) 35%, transparent 65%)',
          filter: 'blur(30px)',
          transform: `scale(${breathe})`,
          opacity: flicker,
        }}
      />
      {/* flame body — teardrop via border-radius */}
      <div
        style={{
          width: size * 0.55,
          height: size,
          marginLeft: size * 0.225,
          borderRadius: '50% 50% 50% 50% / 62% 62% 38% 38%',
          background:
            'linear-gradient(180deg, #E0F2FE 0%, #7DD3FC 22%, #0EA5E9 55%, #1E3A8A 85%, #020617 100%)',
          filter: 'blur(6px)',
          transform: `scaleY(${flicker}) scaleX(${2 - flicker})`,
          boxShadow:
            '0 0 60px 20px rgba(56,189,248,0.55), 0 0 140px 60px rgba(14,165,233,0.3), inset 0 -40px 80px rgba(2,6,23,0.6)',
        }}
      />
      {/* bright core */}
      <div
        style={{
          position: 'absolute',
          left: size * 0.33,
          top: size * 0.38,
          width: size * 0.34,
          height: size * 0.52,
          borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
          background:
            'linear-gradient(180deg, #FFFFFF 0%, #E0F2FE 40%, #38BDF8 75%, rgba(56,189,248,0) 100%)',
          filter: 'blur(10px)',
          opacity: 0.9 * flicker,
        }}
      />
      {/* base ember glow */}
      <div
        style={{
          position: 'absolute',
          left: size * 0.1,
          top: size * 0.82,
          width: size * 0.8,
          height: 60,
          borderRadius: '50%',
          background: 'radial-gradient(ellipse, rgba(125,211,252,0.7) 0%, transparent 70%)',
          filter: 'blur(12px)',
        }}
      />
    </div>
  );
};
