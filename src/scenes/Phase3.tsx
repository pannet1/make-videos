import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground, Eyebrow } from '../components/CinematicBackground';
import { ProgressBar } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { BodyCopy, Headline, SceneCaptions } from '../components/Type';
import { COLORS } from '../theme';
import React from 'react';

const CUES = [
  { from: 0, to: 900, text: 'Days 6 and 7 — Katyayani and Kalaratri. Time for heroic action.' },
  { from: 900, to: 1800, text: 'Clean your space. Cut toxic ties. Enforce strict boundaries.' },
  { from: 1800, to: 2700, text: 'Channel fierce energy. This is sacred destruction.' },
  { from: 2700, to: 3600, text: 'Days 8 and 9 — Siddhidatri. You cleared space. Now receive perfection.' },
];

const ACTIONS = [
  'Clean your physical space',
  'Cut off toxic relationships',
  'Enforce strict boundaries',
  'Act heroically, daily',
];

/** 7:30–9:30 · Phase 3 — Action & Mastery (3600 frames) */
export const Phase3: React.FC = () => {
  const frame = useFrame();
  const fierce = frame < 2100;
  const shake = fierce ? Math.sin(frame * 0.9) * 4 : 0;
  // fire intensity
  const fire = fierce
    ? 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(frame * 0.25))
    : interpolate(frame, [2100, 2800], [1, 0.3], { extrapolateRight: 'clamp' });
  const grace = interpolate(frame, [2300, 3000], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/05.mp3')} />
      <CinematicBackground progress={fierce ? 0.72 : interpolate(frame, [2100, 3600], [0.72, 1])}>
        <ParticleField count={fierce ? 160 : 110} color={fierce ? '#F97316' : '#FDE68A'} maxSize={6} speed={fierce ? 2.2 : 0.7} />
      </CinematicBackground>

      {/* fire band at bottom during fierce half */}
      <div
        style={{
          position: 'absolute',
          left: -100,
          right: -100,
          bottom: -80,
          height: 420,
          opacity: fire,
          background:
            'radial-gradient(ellipse 60% 100% at 20% 100%, rgba(249,115,22,0.55) 0%, transparent 60%), radial-gradient(ellipse 60% 100% at 55% 100%, rgba(234,179,8,0.5) 0%, transparent 60%), radial-gradient(ellipse 60% 100% at 85% 100%, rgba(127,29,29,0.6) 0%, transparent 60%)',
          filter: 'blur(24px)',
        }}
      />

      <ProgressBar dayFrom={6} dayTo={9} activeDay={fierce ? 6 : 8} phaseLabel="PHASE 3 · ACTION & MASTERY — SATTVA" overall={0.85} />

      <div style={{ position: 'absolute', left: 110, top: 240, right: 110, transform: `translateX(${shake}px)` }}>
        {fierce ? (
          <>
            <Eyebrow text="Days 6–7 · Katyayani · Kalaratri · Fierce Grace" color={COLORS.ember} />
            <div style={{ height: 20 }} />
            <Headline enterAt={60} size={100}>
              Massive, heroic <span style={{ color: COLORS.ember }}>action.</span>
            </Headline>
            <div style={{ height: 20 }} />
            <BodyCopy enterAt={280}>
              The fierce goddesses do not negotiate. Burn the clutter — in your room, your phone,
              your relationships. Boundaries are devotion.
            </BodyCopy>
            <div style={{ display: 'flex', gap: 22, marginTop: 36 }}>
              {ACTIONS.map((a, i) => {
                const e = interpolate(frame - (500 + i * 220), [0, 26], [0, 1], {
                  extrapolateLeft: 'clamp',
                  extrapolateRight: 'clamp',
                });
                const checked = frame > 900 + i * 220;
                return (
                  <div
                    key={a}
                    style={{
                      opacity: e,
                      flex: 1,
                      background: checked ? 'rgba(127,29,29,0.55)' : 'rgba(5,7,15,0.6)',
                      border: `2px solid ${checked ? '#F97316' : 'rgba(255,247,230,0.18)'}`,
                      borderRadius: 16,
                      padding: '24px 20px',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: 40 }}>{checked ? '🔥' : '○'}</div>
                    <div style={{ fontSize: 26, color: '#FFF7E6', marginTop: 8, lineHeight: 1.35 }}>{a}</div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div style={{ opacity: grace, textAlign: 'center', paddingTop: 20 }}>
            <Eyebrow text="Days 8–9 · Siddhidatri · Perfection" color={COLORS.goldSoft} />
            <div style={{ height: 20 }} />
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <Headline enterAt={2300} size={104} align="center">
                You cleared the space.
                <br />
                <span style={{ color: COLORS.goldSoft }}>Now receive Siddhi.</span>
              </Headline>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 22 }}>
              <BodyCopy enterAt={2500} maxWidth={1000}>
                Ask Devi for perfection in your craft — and remain completely open to her grace.
                Stillness now. Receptivity is the final discipline.
              </BodyCopy>
            </div>
            {/* grace rays */}
            <div
              style={{
                margin: '30px auto 0',
                width: 560,
                height: 120,
                background:
                  'conic-gradient(from 270deg at 50% 100%, transparent 0deg, rgba(253,230,138,0.35) 12deg, transparent 24deg, rgba(253,230,138,0.35) 36deg, transparent 48deg, rgba(253,230,138,0.35) 60deg, transparent 72deg, rgba(253,230,138,0.35) 84deg, transparent 96deg)',
                filter: 'blur(6px)',
                opacity: grace,
              }}
            />
          </div>
        )}
      </div>

      <SceneCaptions cues={CUES} />
    </div>
  );
};
