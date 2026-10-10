import { useFrame } from '@rendiv/core';
import React from 'react';

/** Slowly rotating sacred-geometry rings (SVG). Frame-driven rotation. */
export const SacredGeometry: React.FC<{
  size?: number;
  x?: number;
  y?: number;
  opacity?: number;
  color?: string;
}> = ({ size = 900, x = 960, y = 540, opacity = 0.28, color = '#FDE68A' }) => {
  const frame = useFrame();
  const r1 = frame * 0.05;
  const r2 = -frame * 0.035;
  const r3 = frame * 0.02;

  const ring = (r: number, rad: number, dash: string, w: number, o: number) => (
    <g transform={`rotate(${r} ${x} ${y})`} opacity={o}>
      <circle cx={x} cy={y} r={rad} fill="none" stroke={color} strokeWidth={w} strokeDasharray={dash} />
    </g>
  );

  // Petal polygon
  const petals = 12;
  const petalPts: string[] = [];
  for (let i = 0; i < petals; i++) {
    const a = (i / petals) * Math.PI * 2 + (frame * 0.002);
    const px = x + Math.cos(a) * size * 0.22;
    const py = y + Math.sin(a) * size * 0.22;
    petalPts.push(`${px.toFixed(1)},${py.toFixed(1)}`);
  }

  return (
    <svg
      style={{ position: 'absolute', inset: 0, width: 1920, height: 1080, opacity }}
      width={1920}
      height={1080}
    >
      {ring(r1, size * 0.32, '4 14', 1.5, 0.9)}
      {ring(r2, size * 0.26, '60 22', 1, 0.7)}
      {ring(r3, size * 0.19, '2 8', 1.5, 0.8)}
      <g transform={`rotate(${r2} ${x} ${y})`} opacity={0.55}>
        <polygon points={petalPts.join(' ')} fill="none" stroke={color} strokeWidth={1} />
        <circle cx={x} cy={y} r={size * 0.045} fill="none" stroke={color} strokeWidth={1.5} />
        <circle cx={x} cy={y} r={4} fill={color} />
      </g>
      {/* cross ticks */}
      {[0, 45, 90, 135].map((deg) => (
        <g key={deg} transform={`rotate(${deg + r1 * 0.2} ${x} ${y})`} opacity={0.4}>
          <line x1={x - size * 0.36} y1={y} x2={x - size * 0.32} y2={y} stroke={color} strokeWidth={2} />
          <line x1={x + size * 0.32} y1={y} x2={x + size * 0.36} y2={y} stroke={color} strokeWidth={2} />
        </g>
      ))}
    </svg>
  );
};
