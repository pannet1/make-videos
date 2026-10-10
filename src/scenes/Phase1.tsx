import { interpolate, useFrame } from '@rendiv/core';
import { CinematicBackground, Eyebrow } from '../components/CinematicBackground';
import { ProgressBar } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { SceneCaptions } from '../components/Type';
import { COLORS } from '../theme';
import React from 'react';

const CUES = [
  { from: 0, to: 900, text: 'Day 1 — Shailaputri. Radical honesty. Write your exact reality.' },
  { from: 900, to: 1500, text: 'Find the knowledge gap between where you are and your dream.' },
  { from: 1500, to: 2800, text: 'Day 2 — Brahmacharini. Conserve vital energy. Pull it upward.' },
  { from: 2800, to: 3700, text: 'Consume ghee, healthy fats. Store the energy in the head.' },
  { from: 3700, to: 4500, text: 'Day 3 — Chandraghanta. Protect time. Visualize. Decide.' },
];

const CARDS = [
  {
    day: 'DAY 1 · SHAILAPUTRI',
    title: 'Radical honesty',
    body: 'Write your exact current reality. Name the knowledge gap between where you are and your ultimate dream. Dedicate this day to learning.',
    accent: '#38BDF8',
    ritual: '✎ Journal · 30 min truth inventory',
  },
  {
    day: 'DAY 2 · BRAHMACHARINI',
    title: 'Conserve energy',
    body: 'Focus on the pelvic region. Eat healthy fats like ghee. Visualize vital energy rising and storing in the head.',
    accent: '#A78BFA',
    ritual: '◉ Pelvic lock · upward visualization',
  },
  {
    day: 'DAY 3 · CHANDRAGHANTA',
    title: 'Visualize & decide',
    body: 'Guard your time fiercely. Act out future possibilities in the mind. Make one firm, honest decision about your trajectory.',
    accent: '#F472B6',
    ritual: '◐ Silence · future rehearsal · decide',
  },
];

/** 3:00–5:30 · Phase 1 — Knowledge & Energy (4500 frames) */
export const Phase1: React.FC = () => {
  const frame = useFrame();
  // Each card owns a 1500-frame window
  const activeCard = Math.min(2, Math.floor(frame / 1500));
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CinematicBackground progress={0.3}>
        <ParticleField count={80} color="#A78BFA" maxSize={4} speed={0.6} />
      </CinematicBackground>
      <ProgressBar dayFrom={1} dayTo={3} activeDay={activeCard + 1} phaseLabel="PHASE 1 · KNOWLEDGE & ENERGY — TAMAS" overall={0.35} />

      <div style={{ position: 'absolute', left: 110, top: 230 }}>
        <Eyebrow text="Phase 1 · Days 1–3 · Tamasic chakras" color="#A78BFA" />
      </div>

      <div style={{ position: 'absolute', left: 110, right: 110, top: 360, display: 'flex', gap: 30 }}>
        {CARDS.map((c, i) => {
          const isActive = i === activeCard;
          const enter = interpolate(frame - i * 1500, [0, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const rise = interpolate(frame - i * 1500, [0, 34], [70, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={c.day}
              style={{
                flex: 1,
                opacity: 0.35 + enter * 0.65,
                transform: `translateY(${rise}px) scale(${isActive ? 1.03 : 0.98})`,
                background: isActive ? 'rgba(10,14,26,0.82)' : 'rgba(10,14,26,0.5)',
                border: `2px solid ${isActive ? c.accent : 'rgba(255,247,230,0.14)'}`,
                boxShadow: isActive ? `0 0 50px ${c.accent}44` : 'none',
                borderRadius: 22,
                padding: '40px 36px',
              }}
            >
              <div style={{ fontSize: 23, letterSpacing: 5, fontWeight: 800, color: c.accent }}>{c.day}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 58, color: '#FFF7E6', marginTop: 12, lineHeight: 1.05 }}>
                {c.title}
              </div>
              <div style={{ fontSize: 27, lineHeight: 1.6, color: isActive ? 'rgba(255,247,230,0.85)' : 'rgba(255,247,230,0.5)', marginTop: 18 }}>
                {c.body}
              </div>
              <div
                style={{
                  marginTop: 26,
                  fontSize: 24,
                  color: c.accent,
                  background: `${c.accent}1A`,
                  border: `1px solid ${c.accent}55`,
                  padding: '12px 18px',
                  borderRadius: 12,
                }}
              >
                {c.ritual}
              </div>
            </div>
          );
        })}
      </div>

      {/* energy rising visualization */}
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
      <div style={{ position: 'absolute', left: 110, bottom: 152, fontSize: 22, letterSpacing: 4, color: COLORS.textDim }}>
        ENERGY RISING · PELVIS → HEAD
      </div>

      <SceneCaptions cues={CUES} />
    </div>
  );
};
