import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { BlueFlame } from '../components/BlueFlame';
import { CinematicBackground, Eyebrow } from '../components/CinematicBackground';
import { LowerThird, ProgressBar } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { BodyCopy, Headline, SceneCaptions } from '../components/Type';
import { COLORS } from '../theme';
import React from 'react';

const CUES = [
  { from: 0, to: 550, text: 'Before the nine days begin, you must clear ancestral karma.' },
  { from: 550, to: 1250, text: 'Visualize a blue flame — cool, fierce, liberating.' },
  { from: 1250, to: 2000, text: 'Push inherited anxieties and suffering into the flame.' },
  { from: 2000, to: 2700, text: 'Liberate yourself — and your entire lineage.' },
];

const BURDENS = ['inherited anxiety', 'family suffering', 'karmic baggage', 'old fear', 'ancestral grief'];

/** 1:30–3:00 · Mahalaya Amavasya — the Blue Flame (2700 frames) */
export const Foundation: React.FC = () => {
  const frame = useFrame();
  // words dissolve into flame one by one
  return (
    <div style={{ position: 'absolute', inset: 0, background: '#04060D' }}>
      <Audio src={staticFile('navaratri-sadhana/vo/02.mp3')} />
      <CinematicBackground progress={0.12}>
        <ParticleField count={70} color="#38BDF8" maxSize={4} speed={1.2} />
      </CinematicBackground>

      {/* Flame on the left third, text on right — matches thumbnail concept */}
      <BlueFlame size={460} x={470} y={560} />

      <ProgressBar dayFrom={0} dayTo={0} activeDay={1} phaseLabel="PRE-NAVARATRI · MAHALAYA AMAVASYA" overall={0.14} />

      <div style={{ position: 'absolute', left: 880, right: 130, top: 250 }}>
        <Eyebrow text="Pre-Navaratri · The Blue Flame" />
        <div style={{ height: 22 }} />
        <Headline enterAt={60} size={92}>
          Clear the past
          <br />
          <span style={{ color: COLORS.flameBlue }}>before you begin.</span>
        </Headline>
        <div style={{ height: 26 }} />
        <BodyCopy enterAt={300}>
          Mahalaya Amavasya is karmic hygiene. Consciously offer every inherited burden into the
          blue flame — and walk into Day 1 empty, light, unbound.
        </BodyCopy>

        {/* dissolving burdens */}
        <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {BURDENS.map((b, i) => {
            const start = 900 + i * 280;
            const p = interpolate(frame - start, [0, 260], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const drift = interpolate(frame - start, [0, 260], [0, -260], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            const op = interpolate(frame - start, [0, 120, 260], [0, 1, 0], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            if (frame < start) {
              return (
                <div key={b} style={{ display: 'flex', alignItems: 'center', gap: 16, opacity: 0.85 }}>
                  <div style={{ width: 12, height: 12, borderRadius: '50%', border: '2px solid #38BDF8' }} />
                  <span style={{ fontSize: 30, color: 'rgba(255,247,230,0.85)' }}>{b}</span>
                </div>
              );
            }
            return (
              <div
                key={b}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  opacity: op,
                  transform: `translateX(${drift}px) scale(${1 - p * 0.25})`,
                  filter: `blur(${p * 6}px)`,
                }}
              >
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#38BDF8', boxShadow: '0 0 12px #38BDF8' }} />
                <span style={{ fontSize: 30, color: '#BAE6FD' }}>→ {b} · into the flame</span>
              </div>
            );
          })}
        </div>
      </div>

      <LowerThird kicker="Actionable step" title="Breathe out the lineage pain. Let it burn blue." side="right" />
      <SceneCaptions cues={CUES} />
    </div>
  );
};
