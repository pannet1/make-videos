import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground, Eyebrow, Hairline } from '../components/CinematicBackground';
import { ChakraLadder, ProgressBar } from '../components/Chrome';
import { ParticleField } from '../components/ParticleField';
import { SacredGeometry } from '../components/SacredGeometry';
import { BodyCopy, Headline, SceneCaptions } from '../components/Type';
import { COLORS } from '../theme';
import React from 'react';

const CUES = [
  { from: 0, to: 420, text: 'Most people see Navaratri as a cultural festival.' },
  { from: 420, to: 900, text: 'According to Guru Pashupathi, it is an intense inner science.' },
  { from: 900, to: 1400, text: 'The journey of the lonely Kundalini rising to meet Shiva.' },
  { from: 1400, to: 2000, text: 'Nine days. Three energies. Tamasic, Rajasic, Sattvik chakras.' },
  { from: 2000, to: 2700, text: 'A complete reset of your life — in 9 days.' },
];

/** 0:00–1:30 · Hook & Introduction (2700 frames) */
export const HookIntro: React.FC = () => {
  const frame = useFrame();
  // Sunrise sweep: glow rises across the scene
  const glow = interpolate(frame, [0, 2700], [0, 1]);
  const titleIn = interpolate(frame, [2050, 2120], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [2050, 2130], [60, 0], { extrapolateRight: 'clamp' });

  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/01.mp3')} />
      <CinematicBackground progress={glow * 0.35}>
        <ParticleField count={110} color="#7DD3FC" maxSize={4} speed={0.7} />
        <SacredGeometry size={1000} opacity={0.16} />
      </CinematicBackground>

      <ProgressBar dayFrom={1} dayTo={9} activeDay={1} phaseLabel="TAMAS → AWAKENING" overall={0.02} />

      {/* Beat 1 — cold open, left aligned */}
      {frame < 1400 && (
        <div style={{ position: 'absolute', left: 110, top: 300, right: 520 }}>
          <Eyebrow text="Guru Pashupathi · Navaratri Sadhana" />
          <div style={{ height: 26 }} />
          <Headline enterAt={30} size={104}>
            Not a festival.
            <br />
            <span style={{ color: COLORS.flameBlue }}>An inner science.</span>
          </Headline>
          <div style={{ height: 28 }} />
          <BodyCopy enterAt={220}>
            The lonely Kundalini rises through nine nights to meet Shiva — and reprogram your life.
          </BodyCopy>
          <div style={{ height: 30 }} />
          {frame > 500 && <Hairline />}
        </div>
      )}

      {/* Beat 2 — framework triptych */}
      {frame >= 1400 && frame < 2050 && (
        <div style={{ position: 'absolute', left: 110, right: 420, top: 280 }}>
          <Eyebrow text="The 9-day framework" color={COLORS.gold} />
          <div style={{ height: 24 }} />
          <Headline enterAt={1420} size={88}>
            Three energies. Nine nights. One reset.
          </Headline>
          <div style={{ display: 'flex', gap: 28, marginTop: 44 }}>
            {[
              { t: 'DAYS 1–3', s: 'Tamas · Energy', d: 'Honesty, conservation, vision' },
              { t: 'DAYS 4–5', s: 'Rajas · Creation', d: 'Seed intention, align purpose' },
              { t: 'DAYS 6–9', s: 'Sattva · Mastery', d: 'Fierce action, then perfection' },
            ].map((c, i) => {
              const e = interpolate(frame - (1500 + i * 90), [0, 26], [0, 1], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              const y = interpolate(frame - (1500 + i * 90), [0, 30], [40, 0], {
                extrapolateLeft: 'clamp',
                extrapolateRight: 'clamp',
              });
              return (
                <div
                  key={c.t}
                  style={{
                    opacity: e,
                    transform: `translateY(${y}px)`,
                    flex: 1,
                    background: 'rgba(5,7,15,0.55)',
                    border: '1px solid rgba(255,247,230,0.16)',
                    borderRadius: 18,
                    padding: '30px 28px',
                    backdropFilter: 'blur(6px)',
                  }}
                >
                  <div style={{ fontSize: 22, letterSpacing: 5, color: COLORS.flameBlue, fontWeight: 700 }}>{c.t}</div>
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 40, color: '#FFF7E6', marginTop: 8 }}>{c.s}</div>
                  <div style={{ fontSize: 26, color: 'rgba(255,247,230,0.6)', marginTop: 10 }}>{c.d}</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Beat 3 — title card */}
      {frame >= 2050 && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: titleIn,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: 26, letterSpacing: 12, color: COLORS.flameBlue, fontWeight: 700 }}>
            THE ULTIMATE NAVARATRI SADHANA
          </div>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 150, color: '#FFF7E6', fontWeight: 700, lineHeight: 1 }}>
            The 9-Day Reset
          </div>
          <div style={{ fontSize: 32, color: 'rgba(255,247,230,0.7)', marginTop: 18, letterSpacing: 2 }}>
            According to Guru Pashupathi · Kundalini · Energy · Perfection
          </div>
        </div>
      )}

      {frame < 2050 && <ChakraLadder activeIndex={1} />}
      <SceneCaptions cues={CUES} />
    </div>
  );
};
