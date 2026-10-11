import { COLORS } from '../theme';
import React from 'react';

/** Journey progress: 9 dots only, no text. */
export const ProgressDots: React.FC<{
  activeDay: number;
}> = ({ activeDay }) => (
  <div style={{ position: 'absolute', top: 56, left: 110, right: 110 }}>
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

/** Chakra ascent: 7 glowing spine dots, no labels. */
export const ChakraSpine: React.FC<{ activeIndex: number }> = ({ activeIndex }) => (
  <div
    style={{
      position: 'absolute',
      right: 130,
      top: 240,
      bottom: 240,
      width: 40,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      alignItems: 'center',
    }}
  >
    {Array.from({ length: 7 }, (_, i) => {
      const lit = i >= 7 - activeIndex - 1;
      const size = 14 + (lit ? 8 : 0);
      return (
        <div
          key={i}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            background: lit ? 'radial-gradient(circle, #FFF7E6, #EAB308 60%, #B45309)' : 'transparent',
            border: `2px solid ${lit ? COLORS.gold : 'rgba(255,247,230,0.3)'}`,
            boxShadow: lit ? '0 0 18px rgba(234,179,8,0.9)' : 'none',
          }}
        />
      );
    })}
    <div
      style={{
        position: 'absolute',
        top: 10,
        bottom: 10,
        width: 2,
        background: 'linear-gradient(180deg, #FDE68A, #38BDF8)',
        opacity: 0.4,
      }}
    />
  </div>
);
