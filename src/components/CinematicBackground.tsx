import { COLORS, FONTS } from '../theme';
import { blendColors, interpolate, useFrame } from '@rendiv/core';
import { noise2D, seed } from '@rendiv/noise';
import React from 'react';

seed(11);

/**
 * Full-screen cinematic gradient that drifts from deep cool navy
 * (Tamas) to warm gold (Sattva) based on overall journey progress 0→1.
 * Pure function of frame — no CSS animations.
 */
export const CinematicBackground: React.FC<{
  progress: number; // 0..1 overall journey
  children?: React.ReactNode;
}> = ({ progress, children }) => {
  const frame = useFrame();

  // Slow organic drift so the "camera" feels alive
  const driftX = noise2D(3.1, frame * 0.008) * 120;
  const driftY = noise2D(71.7, frame * 0.006) * 80;

  const skyTop = blendColors(progress, [0, 0.35, 0.65, 1], [
    '#05070F',
    '#0A0E1A',
    '#2A1608',
    '#3B2503',
  ]);
  const skyMid = blendColors(progress, [0, 0.35, 0.65, 1], [
    '#0A0E1A',
    '#1A2350',
    '#7C2D12',
    '#B45309',
  ]);
  const skyLow = blendColors(progress, [0, 0.35, 0.65, 1], [
    '#1A2350',
    '#0EA5E9',
    '#EAB308',
    '#FDE68A',
  ]);

  // Sunrise glow position sweeps upward as journey progresses
  const glowY = interpolate(progress, [0, 1], [85, 30]);
  const glowOpacity = interpolate(progress, [0, 0.25, 0.7, 1], [0.35, 0.5, 0.75, 0.9]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyMid} 58%, ${skyTop} 100%)`,
      }}
    >
      {/* drifting nebula blobs */}
      <div
        style={{
          position: 'absolute',
          width: 1600,
          height: 1600,
          left: 960 - 800 + driftX,
          top: -400 + driftY,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${skyLow}33 0%, transparent 65%)`,
        }}
      />
      {/* horizon sunrise band */}
      <div
        style={{
          position: 'absolute',
          left: -200 + driftX * 0.4,
          right: -200,
          top: `${glowY}%`,
          height: 520,
          opacity: glowOpacity,
          background: `radial-gradient(ellipse 70% 100% at 50% 100%, ${skyLow}66 0%, transparent 70%)`,
          filter: 'blur(30px)',
        }}
      />
      {/* film grain sweep line */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.5,
          background:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, transparent 1px, transparent 4px)',
        }}
      />
      {/* vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.55) 100%)',
        }}
      />
      {children}
    </div>
  );
};

/** Small widely-tracked eyebrow label, pushed to title-safe edges per brief. */
export const Eyebrow: React.FC<{ text: string; color?: string }> = ({
  text,
  color = COLORS.flameBlue,
}) => (
  <div
    style={{
      fontFamily: FONTS.body,
      fontSize: 26,
      letterSpacing: 10,
      fontWeight: 600,
      color,
      textTransform: 'uppercase',
    }}
  >
    {text}
  </div>
);

export const Hairline: React.FC<{ color?: string; width?: number }> = ({
  color = 'rgba(255,247,230,0.35)',
  width = 120,
}) => (
  <div style={{ width, height: 2, background: color, opacity: 0.8 }} />
);
