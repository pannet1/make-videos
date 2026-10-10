import { interpolate, useFrame } from '@rendiv/core';
import { COLORS, FONTS } from '../theme';
import React from 'react';

/** Burnt-in subtitle line driven by local frame cues. */
export interface Cue {
  from: number;
  to: number;
  text: string;
}

export const SceneCaptions: React.FC<{ cues: Cue[]; bottom?: number }> = ({
  cues,
  bottom = 64,
}) => {
  const frame = useFrame();
  const active = cues.find((c) => frame >= c.from && frame < c.to);
  if (!active) return null;
  const local = frame - active.from;
  const opacity = interpolate(local, [0, 12], [0, 1], { extrapolateRight: 'clamp' });
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        bottom,
        display: 'flex',
        justifyContent: 'center',
        opacity,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 30,
          fontWeight: 500,
          color: '#FFF',
          background: 'rgba(0,0,0,0.55)',
          padding: '12px 30px',
          borderRadius: 12,
          maxWidth: 1400,
          textAlign: 'center',
          lineHeight: 1.4,
        }}
      >
        {active.text}
      </div>
    </div>
  );
};

/** Big display headline with frame-driven rise + fade. */
export const Headline: React.FC<{
  enterAt?: number;
  children: React.ReactNode;
  size?: number;
  color?: string;
  align?: 'left' | 'center';
  maxWidth?: number;
}> = ({ enterAt = 0, children, size = 96, color = COLORS.textMain, align = 'left', maxWidth = 1100 }) => {
  const frame = useFrame();
  const local = frame - enterAt;
  const opacity = interpolate(local, [0, 26], [0, 1], { extrapolateRight: 'clamp' });
  const y = interpolate(local, [0, 30], [46, 0], { extrapolateRight: 'clamp' });
  if (local < 0) return null;
  return (
    <div
      style={{
        opacity,
        transform: `translateY(${y}px)`,
        fontFamily: FONTS.display,
        fontSize: size,
        fontWeight: 600,
        color,
        lineHeight: 1.04,
        maxWidth,
        textAlign: align,
        textShadow: '0 6px 40px rgba(0,0,0,0.75)',
      }}
    >
      {children}
    </div>
  );
};

/** Body copy block. */
export const BodyCopy: React.FC<{ enterAt?: number; children: React.ReactNode; maxWidth?: number }> = ({
  enterAt = 0,
  children,
  maxWidth = 900,
}) => {
  const frame = useFrame();
  const local = frame - enterAt;
  const opacity = interpolate(local, [0, 24], [0, 1], { extrapolateRight: 'clamp' });
  if (local < 0) return null;
  return (
    <div
      style={{
        opacity,
        fontFamily: FONTS.body,
        fontSize: 32,
        lineHeight: 1.55,
        color: COLORS.textDim,
        maxWidth,
      }}
    >
      {children}
    </div>
  );
};
