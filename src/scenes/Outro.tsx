import { interpolate, useFrame } from '@rendiv/core';
import { CinematicBackground, Eyebrow } from '../components/CinematicBackground';
import { ParticleField } from '../components/ParticleField';
import { SacredGeometry } from '../components/SacredGeometry';
import { BodyCopy, Headline, SceneCaptions } from '../components/Type';
import React from 'react';

const CUES = [
  { from: 0, to: 600, text: 'Clear the past. Build energy. Plant the seed.' },
  { from: 600, to: 1100, text: 'Take fierce action. Then receive perfection.' },
  { from: 1100, to: 1800, text: 'Which day of the Sadhana feels most challenging for you?' },
];

const STEPS = ['Clear past', 'Build energy', 'Plant seed', 'Fierce action', 'Receive'];

/** 9:30–10:30 · Outro & CTA (1800 frames) */
export const Outro: React.FC = () => {
  const frame = useFrame();
  const peak = interpolate(frame, [0, 1200], [0.7, 1]);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <CinematicBackground progress={peak}>
        <ParticleField count={130} color="#FFF7E6" maxSize={5} speed={0.8} />
        <SacredGeometry size={700} opacity={0.22} />
      </CinematicBackground>

      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 140px' }}>
        <Eyebrow text="The progression · Tamas → Rajas → Sattva" color="#FDE68A" />
        <div style={{ height: 20 }} />
        <Headline enterAt={60} size={84} align="center">
          Clear. Energize. Plant. Act. Receive.
        </Headline>

        {/* 5-step recap pills */}
        <div style={{ display: 'flex', gap: 14, marginTop: 34 }}>
          {STEPS.map((s, i) => {
            const e = interpolate(frame - (250 + i * 130), [0, 24], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={s}
                style={{
                  opacity: e,
                  fontSize: 25,
                  fontWeight: 700,
                  letterSpacing: 1,
                  color: '#0A0E1A',
                  background: 'linear-gradient(180deg, #FFFBEB, #FDE68A)',
                  padding: '14px 26px',
                  borderRadius: 999,
                  boxShadow: '0 0 24px rgba(253,230,138,0.5)',
                }}
              >
                {i + 1} · {s}
              </div>
            );
          })}
        </div>

        <div style={{ height: 26 }} />
        <BodyCopy enterAt={1050} maxWidth={1000}>
          Which day of the Sadhana feels most challenging for you right now? Tell us below —
          and subscribe for more deep dives into esoteric yogic science.
        </BodyCopy>

        {/* end-screen edge cards */}
        <div style={{ position: 'absolute', left: 110, bottom: 120, display: 'flex', gap: 18 }}>
          {['▶ Next: Kundalini 101', '▶ Mantra Science'].map((t, i) => {
            const e = interpolate(frame - (1200 + i * 140), [0, 24], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div key={t} style={{ opacity: e, fontSize: 24, color: '#FFF7E6', background: 'rgba(5,7,15,0.65)', border: '1px solid rgba(255,247,230,0.25)', padding: '16px 24px', borderRadius: 14 }}>
                {t}
              </div>
            );
          })}
        </div>
        <div
          style={{
            position: 'absolute',
            right: 110,
            bottom: 120,
            opacity: interpolate(frame - 1250, [0, 24], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
            fontSize: 28,
            fontWeight: 800,
            letterSpacing: 2,
            color: '#fff',
            background: '#C81E1E',
            padding: '18px 42px',
            borderRadius: 999,
          }}
        >
          ● SUBSCRIBE
        </div>
      </div>

      <SceneCaptions cues={CUES} />
    </div>
  );
};
