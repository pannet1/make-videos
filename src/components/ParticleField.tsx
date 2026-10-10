import { useFrame } from '@rendiv/core';
import { noise2D, seed } from '@rendiv/noise';
import React, { useMemo } from 'react';

seed(99);

// Deterministic pseudo-random from index (stable across frames)
const rand = (i: number, salt: number): number => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** Floating light particles — glowing dust / embers. Frame-driven. */
export const ParticleField: React.FC<{
  count?: number;
  color?: string;
  maxSize?: number;
  speed?: number;
  area?: { w: number; h: number };
}> = ({ count = 90, color = '#FDE68A', maxSize = 5, speed = 1, area = { w: 1920, h: 1080 } }) => {
  const frame = useFrame();
  const parts = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        x0: rand(i, 1) * area.w,
        y0: rand(i, 2) * area.h,
        r: 1 + rand(i, 3) * maxSize,
        depth: 0.3 + rand(i, 4) * 0.7,
        drift: 20 + rand(i, 5) * 80,
        twinkleSpeed: 0.02 + rand(i, 6) * 0.06,
        hueShift: rand(i, 7),
      })),
    [count, area.w, area.h, maxSize],
  );

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}>
      {parts.map((p, i) => {
        const rise = ((frame * speed * p.depth * 0.9) % (area.h + 200)) ;
        const y = area.h + 100 - ((p.y0 + rise) % (area.h + 200));
        const x = p.x0 + noise2D(i * 0.37, frame * 0.008 * speed) * p.drift;
        const tw = 0.25 + 0.75 * (0.5 + 0.5 * Math.sin(frame * p.twinkleSpeed + p.hueShift * 12));
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: x,
              top: y,
              width: p.r,
              height: p.r,
              borderRadius: '50%',
              background: color,
              opacity: tw * p.depth,
              boxShadow: `0 0 ${p.r * 3}px ${color}`,
            }}
          />
        );
      })}
    </div>
  );
};
