import { interpolate, useFrame } from '@rendiv/core';
import { CinematicBackground, Eyebrow } from '../components/CinematicBackground';
import { ProgressBar } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { SacredGeometry } from '../components/SacredGeometry';
import { BodyCopy, Headline, SceneCaptions } from '../components/Type';
import { COLORS } from '../theme';
import React from 'react';

const CUES = [
  { from: 0, to: 1100, text: 'Day 4 — Kushmanda. Speak to Devi directly. No complex mantra needed.' },
  { from: 1100, to: 1900, text: 'Ask her to plant a seed — a Bindu — of your intention inside you.' },
  { from: 1900, to: 2800, text: 'Day 5 — Skandamata. Align with purpose. What must you learn?' },
  { from: 2800, to: 3600, text: 'Look outward. Who can co-create this vision with you?' },
];

/** 5:30–7:30 · Phase 2 — Purpose & Creation (3600 frames) */
export const Phase2: React.FC = () => {
  const frame = useFrame();
  const secondHalf = frame > 1800;
  // Bindu seed grows
  const seedScale = interpolate(frame, [700, 1900], [0.2, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const seedGlow = interpolate(frame, [700, 1900], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const split = interpolate(frame, [1750, 1900], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CinematicBackground progress={0.62}>
        <ParticleField count={120} color="#FDE68A" maxSize={5} speed={0.8} />
        <SacredGeometry size={850} opacity={0.3} color="#FDE68A" />
      </CinematicBackground>
      <ProgressBar dayFrom={4} dayTo={5} activeDay={secondHalf ? 5 : 4} phaseLabel="PHASE 2 · PURPOSE & CREATION — RAJAS" overall={0.6} />

      {/* left: copy; right: Bindu visualization */}
      <div
        style={{
          position: 'absolute',
          left: 110,
          top: 250,
          width: 900,
          transform: `translateX(${-split * 60}px)`,
        }}
      >
        {!secondHalf ? (
          <>
            <Eyebrow text="Day 4 · Kushmanda · The Seed" color={COLORS.gold} />
            <div style={{ height: 22 }} />
            <Headline enterAt={80} size={90}>
              Ask Devi to plant
              <br />
              the <span style={{ color: COLORS.goldSoft }}>Bindu.</span>
            </Headline>
            <div style={{ height: 24 }} />
            <BodyCopy enterAt={320}>
              No complex mantra. Direct communication. Whisper your intention and ask her to
              place its seed inside you — then protect it like a pregnancy.
            </BodyCopy>
            <div
              style={{
                marginTop: 30,
                fontSize: 26,
                color: COLORS.goldSoft,
                border: '1px solid rgba(253,230,138,0.4)',
                background: 'rgba(180,83,9,0.25)',
                padding: '16px 22px',
                borderRadius: 14,
              }}
            >
              “Devi, plant this intention in me. I will carry it faithfully.”
            </div>
          </>
        ) : (
          <>
            <Eyebrow text="Day 5 · Skandamata · Purpose" color={COLORS.ember} />
            <div style={{ height: 22 }} />
            <Headline enterAt={1850} size={90}>
              Align the seed
              <br />
              with <span style={{ color: COLORS.ember }}>purpose.</span>
            </Headline>
            <div style={{ height: 24 }} />
            <BodyCopy enterAt={2050}>
              What exact knowledge or action does the seed demand? And who is meant to
              co-create it with you? Purpose is never a solo project — look outward.
            </BodyCopy>
            <div style={{ display: 'flex', gap: 16, marginTop: 30 }}>
              {['What must I learn?', 'What must I do?', 'Who co-creates?'].map((q, i) => {
                const e = interpolate(frame - (2200 + i * 160), [0, 24], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                return (
                  <div key={q} style={{ opacity: e, flex: 1, background: 'rgba(5,7,15,0.6)', border: '1px solid rgba(255,247,230,0.2)', borderRadius: 14, padding: '18px', fontSize: 25, color: '#FFF7E6', textAlign: 'center' }}>
                    {q}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Bindu orb */}
      <div style={{ position: 'absolute', right: 260, top: 540 - 190, width: 380, height: 380 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(253,230,138,0.35) 0%, transparent 65%)',
            filter: 'blur(20px)',
            opacity: seedGlow,
            transform: `scale(${1 + (1 - seedGlow) * 2})`,
          }}
        />
        <div
          style={{
            position: 'absolute',
            left: 190 - 70 * seedScale,
            top: 190 - 70 * seedScale,
            width: 140 * seedScale,
            height: 140 * seedScale,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 30%, #FFFBEB 0%, #FDE68A 30%, #EAB308 60%, #92400E 100%)',
            boxShadow: `0 0 ${60 * seedGlow + 10}px rgba(234,179,8,${0.9 * seedGlow})`,
          }}
        />
        <div style={{ position: 'absolute', top: 400, width: 380, textAlign: 'center', fontSize: 24, letterSpacing: 6, color: 'rgba(255,247,230,0.65)' }}>
          {secondHalf ? 'THE SEED GERMINATES' : 'BINDU · SEED OF INTENTION'}
        </div>
      </div>

      <SceneCaptions cues={CUES} />
    </div>
  );
};
