import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground } from '../components/CinematicBackground';
import { ProgressDots } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import React from 'react';

const NUMERALS = ['௧', '௨', '௩']; // Tamil 1, 2, 3
const ACCENTS = ['#38BDF8', '#A78BFA', '#F472B6'];

/** Journal lines motif — writing without words. */
const JournalLines: React.FC<{ color: string }> = ({ color }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 30 }}>
    {[92, 78, 86, 64, 80, 52].map((w, i) => (
      <div key={i} style={{ width: `${w}%`, height: 8, borderRadius: 4, background: color, opacity: 0.55 }} />
    ))}
  </div>
);

/** Rising energy column motif. */
const RisingColumn: React.FC<{ progress: number; color: string }> = ({ progress, color }) => (
  <div style={{ marginTop: 30, height: 220, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
    <div style={{ position: 'relative', width: 60, height: 220, borderRadius: 30, background: 'rgba(255,247,230,0.1)' }}>
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: `${Math.max(4, progress * 100)}%`,
          borderRadius: 30,
          background: `linear-gradient(180deg, #FFF7E6, ${color})`,
          boxShadow: `0 0 30px ${color}`,
        }}
      />
    </div>
  </div>
);

/** Focus target motif — decision. */
const FocusTarget: React.FC<{ color: string }> = ({ color }) => {
  const frame = useFrame();
  const pulse = 1 + 0.06 * Math.sin(frame * 0.1);
  return (
    <div style={{ marginTop: 40, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ position: 'relative', width: 200, height: 200 }}>
        {[88, 60, 34].map((d) => (
          <div
            key={d}
            style={{
              position: 'absolute',
              left: 100 - d,
              top: 100 - d,
              width: d * 2,
              height: d * 2,
              borderRadius: '50%',
              border: `3px solid ${color}`,
              opacity: 0.7,
            }}
          />
        ))}
        <div
          style={{
            position: 'absolute',
            left: 100 - 14 * pulse,
            top: 100 - 14 * pulse,
            width: 28 * pulse,
            height: 28 * pulse,
            borderRadius: '50%',
            background: `radial-gradient(circle, #FFF7E6, ${color})`,
            boxShadow: `0 0 26px ${color}`,
          }}
        />
      </div>
    </div>
  );
};

/** 3:00–5:30 · Phase 1 — three symbolic day panels. No text. */
export const Phase1: React.FC = () => {
  const frame = useFrame();
  const activeCard = Math.min(2, Math.floor(frame / 1500));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/03.mp3')} />
      <CinematicBackground progress={0.3}>
        <ParticleField count={80} color="#A78BFA" maxSize={4} speed={0.6} />
      </CinematicBackground>
      <ProgressDots activeDay={activeCard + 1} />

      <div style={{ position: 'absolute', left: 110, right: 110, top: 300, display: 'flex', gap: 30 }}>
        {[0, 1, 2].map((i) => {
          const accent = ACCENTS[i];
          const isActive = i === activeCard;
          const enter = interpolate(frame - i * 1500, [0, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const rise = interpolate(frame - i * 1500, [0, 34], [70, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const colProgress = interpolate(frame - 1500, [0, 1300], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 480,
                opacity: 0.35 + enter * 0.65,
                transform: `translateY(${rise}px) scale(${isActive ? 1.03 : 0.98})`,
                background: isActive ? 'rgba(10,14,26,0.82)' : 'rgba(10,14,26,0.5)',
                border: `2px solid ${isActive ? accent : 'rgba(255,247,230,0.14)'}`,
                boxShadow: isActive ? `0 0 50px ${accent}44` : 'none',
                borderRadius: 22,
                padding: '36px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <div style={{ fontSize: 110, lineHeight: 1, color: accent, textShadow: `0 0 30px ${accent}` }}>
                {NUMERALS[i]}
              </div>
              {i === 0 && <JournalLines color={accent} />}
              {i === 1 && <RisingColumn progress={colProgress} color={accent} />}
              {i === 2 && <FocusTarget color={accent} />}
            </div>
          );
        })}
      </div>

      {/* energy rising bar */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          right: 110,
          bottom: 130,
          height: 10,
          borderRadius: 5,
          background: 'rgba(255,247,230,0.12)',
        }}
      >
        <div
          style={{
            width: `${interpolate(frame, [0, 4500], [4, 100])}%`,
            height: '100%',
            borderRadius: 5,
            background: 'linear-gradient(90deg, #38BDF8, #A78BFA, #F472B6)',
            boxShadow: '0 0 20px rgba(167,139,250,0.8)',
          }}
        />
      </div>
    </div>
  );
};
