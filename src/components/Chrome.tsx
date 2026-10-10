import { interpolate, useFrame } from '@rendiv/core';
import { COLORS, FONTS } from '../theme';
import React from 'react';

/** Minimal lower-third pushed to title-safe outer edge. */
export const LowerThird: React.FC<{
  kicker: string;
  title: string;
  side?: 'left' | 'right';
  accent?: string;
}> = ({ kicker, title, side = 'left', accent = COLORS.flameBlue }) => {
  const frame = useFrame();
  const enter = interpolate(frame, [0, 24], [-60, 0], { extrapolateRight: 'clamp' });
  const opacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div
      style={{
        position: 'absolute',
        left: side === 'left' ? 110 : undefined,
        right: side === 'right' ? 110 : undefined,
        bottom: 150,
        opacity,
        transform: `translateX(${side === 'left' ? enter : -enter}px)`,
        textAlign: side,
      }}
    >
      <div
        style={{
          fontFamily: FONTS.body,
          fontSize: 22,
          letterSpacing: 8,
          color: accent,
          fontWeight: 700,
          textTransform: 'uppercase',
          marginBottom: 10,
        }}
      >
        {kicker}
      </div>
      <div
        style={{
          fontFamily: FONTS.display,
          fontSize: 54,
          color: COLORS.textMain,
          fontWeight: 600,
          lineHeight: 1.05,
          maxWidth: 640,
          textShadow: '0 4px 30px rgba(0,0,0,0.7)',
        }}
      >
        {title}
      </div>
      <div style={{ width: 90, height: 3, background: accent, marginTop: 14, marginLeft: side === 'right' ? 'auto' : 0 }} />
    </div>
  );
};

/** Top journey progress bar: 9 dots + phase label, edge-aligned. */
export const ProgressBar: React.FC<{
  dayFrom: number;
  dayTo: number;
  activeDay: number;
  phaseLabel: string;
  overall: number; // 0..1
}> = ({ dayFrom, dayTo, activeDay, phaseLabel, overall }) => (
  <div style={{ position: 'absolute', top: 56, left: 110, right: 110 }}>
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
      }}
    >
      <div style={{ fontFamily: FONTS.body, fontSize: 22, letterSpacing: 7, color: 'rgba(255,247,230,0.7)', fontWeight: 600 }}>
        {phaseLabel}
      </div>
      <div style={{ fontFamily: FONTS.body, fontSize: 22, letterSpacing: 5, color: 'rgba(255,247,230,0.55)' }}>
        DAY {dayFrom}–{dayTo} · {Math.round(overall * 100)}%
      </div>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      {Array.from({ length: 9 }, (_, i) => {
        const day = i + 1;
        const done = day < activeDay;
        const active = day === activeDay;
        return (
          <div
            key={day}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              background: done
                ? COLORS.gold
                : active
                  ? 'linear-gradient(90deg, #EAB308, #38BDF8)'
                  : 'rgba(255,247,230,0.18)',
              boxShadow: active ? '0 0 14px rgba(234,179,8,0.8)' : 'none',
            }}
          />
        );
      })}
    </div>
  </div>
);

/** Vertical chakra ladder showing Tamas→Rajas→Sattva ascent. */
export const ChakraLadder: React.FC<{ activeIndex: number }> = ({ activeIndex }) => {
  const chakras = [
    { name: 'Sahasrara', day: '9 · Siddhi' },
    { name: 'Ajna', day: '8 · Siddhi' },
    { name: 'Vishuddha', day: '7 · Action' },
    { name: 'Anahata', day: '6 · Action' },
    { name: 'Manipura', day: '5 · Purpose' },
    { name: 'Svadhisthana', day: '4 · Seed' },
    { name: 'Muladhara', day: '1–3 · Energy' },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        right: 120,
        top: 200,
        bottom: 220,
        width: 220,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
      }}
    >
      {chakras.map((c, i) => {
        const lit = i >= 7 - activeIndex - 1;
        return (
          <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 14, opacity: lit ? 1 : 0.35 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: FONTS.body, fontSize: 19, letterSpacing: 3, color: lit ? COLORS.goldSoft : 'rgba(255,247,230,0.5)', fontWeight: 600 }}>
                {c.name.toUpperCase()}
              </div>
              <div style={{ fontFamily: FONTS.body, fontSize: 17, color: 'rgba(255,247,230,0.45)' }}>{c.day}</div>
            </div>
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                background: lit ? 'radial-gradient(circle, #FFF7E6, #EAB308 60%, #B45309)' : 'transparent',
                border: `2px solid ${lit ? COLORS.gold : 'rgba(255,247,230,0.3)'}`,
                boxShadow: lit ? '0 0 18px rgba(234,179,8,0.9)' : 'none',
              }}
            />
          </div>
        );
      })}
      {/* spine line */}
      <div
        style={{
          position: 'absolute',
          right: 22,
          top: 10,
          bottom: 10,
          width: 2,
          background: 'linear-gradient(180deg, #FDE68A, #38BDF8)',
          opacity: 0.4,
        }}
      />
    </div>
  );
};
