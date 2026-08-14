import React from 'react';
import { interpolate, useFrame } from '@rendiv/core';

export const SLATE_950 = '#020617';
export const BLUE_500 = '#3b82f6';
export const BLUE_600 = '#2563eb';
export const BLUE_700 = '#1d4ed8';
export const GREEN_400 = '#4ade80';
export const GREEN_600 = '#16a34a';
export const GREEN_700 = '#15803d';
export const YELLOW_400 = '#facc15';
export const BLUE_400 = '#60a5fa';
export const SLATE_300 = '#cbd5e1';
export const SLATE_400 = '#94a3b8';
export const SLATE_700 = '#334155';
export const SLATE_800 = '#1e293b';
export const SLATE_900 = '#0f172a';
export const WHITE = '#ffffff';
export const RED_400 = '#f87171';

export const FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

export const fmt = (n: number): string =>
  'Rs. ' + Math.round(n).toLocaleString('en-IN');

export const Brand: React.FC<{ size?: number }> = ({ size = 30 }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      color: WHITE,
      letterSpacing: -1,
      lineHeight: 1,
    }}
  >
    EcomSense<span style={{ color: BLUE_500 }}>.in</span>
  </div>
);

export const NavBar: React.FC<{ opacity?: number }> = ({ opacity = 1 }) => (
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 76,
      backgroundColor: 'rgba(0,0,0,0.9)',
      borderBottom: '1px solid #1e293b',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 64px',
      opacity,
      zIndex: 10,
    }}
  >
    <Brand />
    <div style={{ display: 'flex', gap: 40 }}>
      {['LOGIN', 'AUCTIONS', 'VPS', 'SCHEMATICS'].map((t) => (
        <span
          key={t}
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 2,
            color: SLATE_300,
          }}
        >
          {t}
        </span>
      ))}
    </div>
  </div>
);

export const useFadeIn = (frames = 14): number =>
  interpolate(useFrame(), [0, frames], [0, 1], {
    extrapolateRight: 'clamp',
  });

export const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
  fade?: number;
}> = ({ title, subtitle, fade = 1 }) => (
  <div style={{ opacity: fade }}>
    <div
      style={{
        fontFamily: FONT,
        fontWeight: 900,
        fontSize: 72,
        color: WHITE,
        letterSpacing: -1,
      }}
    >
      {title}
    </div>
    {subtitle ? (
      <div
        style={{
          marginTop: 14,
          fontFamily: FONT,
          fontSize: 28,
          color: SLATE_400,
          fontWeight: 500,
        }}
      >
        {subtitle}
      </div>
    ) : null}
  </div>
);

export const StatTile: React.FC<{
  label: string;
  value: string;
  color: string;
  fade?: number;
  rise?: number;
}> = ({ label, value, color, fade = 1, rise = 0 }) => (
  <div
    style={{
      flex: 1,
      backgroundColor: SLATE_800,
      borderRadius: 8,
      padding: '20px 24px',
      opacity: fade,
      transform: `translateY(${rise}px)`,
    }}
  >
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: SLATE_400,
      }}
    >
      {label}
    </div>
    <div
      style={{
        marginTop: 8,
        fontSize: 40,
        fontWeight: 900,
        color,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {value}
    </div>
  </div>
);