import { Audio, interpolate, staticFile, useFrame } from '@rendiv/core';
import { CinematicBackground } from '../components/CinematicBackground';
import { ParticleField } from '../components/ParticleField';
import { SacredGeometry } from '../components/SacredGeometry';
import React from 'react';

/** Play triangle glyph (pure shape). */
const PlayGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <div
    style={{
      width: 0,
      height: 0,
      borderTop: `${size * 0.55}px solid transparent`,
      borderBottom: `${size * 0.55}px solid transparent`,
      borderLeft: `${size}px solid ${color}`,
      marginLeft: size * 0.25,
    }}
  />
);

/** 9:30–10:30 · Outro — five lights, sunrise, wordless end cards. No text. */
export const Outro: React.FC = () => {
  const frame = useFrame();
  const peak = interpolate(frame, [0, 1200], [0.7, 1]);
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      <Audio src={staticFile('navaratri-sadhana/vo/06.mp3')} />
      <CinematicBackground progress={peak}>
        <ParticleField count={130} color="#FFF7E6" maxSize={5} speed={0.8} />
        <SacredGeometry size={700} opacity={0.22} />
      </CinematicBackground>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 60,
        }}
      >
        {/* five-step light progression */}
        <div style={{ display: 'flex', gap: 30 }}>
          {[0, 1, 2, 3, 4].map((i) => {
            const e = interpolate(frame - (250 + i * 130), [0, 24], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            });
            return (
              <div
                key={i}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  opacity: 0.25 + e * 0.75,
                  background:
                    e >= 1
                      ? 'radial-gradient(circle, #FFFBEB, #FDE68A 60%, #B45309)'
                      : 'rgba(255,247,230,0.15)',
                  border: '2px solid rgba(253,230,138,0.6)',
                  boxShadow: e >= 1 ? '0 0 30px rgba(253,230,138,0.9)' : 'none',
                }}
              />
            );
          })}
        </div>
        {/* radiant core */}
        <div
          style={{
            width: 260,
            height: 260,
            borderRadius: '50%',
            opacity: interpolate(frame - 800, [0, 300], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
            background:
              'radial-gradient(circle at 45% 40%, #FFFFFF 0%, #FFFBEB 30%, #FDE68A 60%, transparent 75%)',
            filter: 'blur(4px)',
            boxShadow: '0 0 120px rgba(253,230,138,0.8)',
          }}
        />
      </div>

      {/* wordless end-screen panels */}
      <div style={{ position: 'absolute', left: 110, bottom: 120, display: 'flex', gap: 18 }}>
        {[0, 1].map((i) => {
          const e = interpolate(frame - (1200 + i * 140), [0, 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={i}
              style={{
                opacity: e,
                width: 300,
                height: 170,
                borderRadius: 14,
                background: `linear-gradient(135deg, rgba(26,35,80,0.9), rgba(180,83,9,0.55))`,
                border: '1px solid rgba(255,247,230,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PlayGlyph size={44} color="rgba(255,247,230,0.9)" />
            </div>
          );
        })}
      </div>
      {/* wordless subscribe orb */}
      <div
        style={{
          position: 'absolute',
          right: 130,
          bottom: 130,
          width: 130,
          height: 130,
          borderRadius: '50%',
          opacity: interpolate(frame - 1250, [0, 24], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
          background: 'radial-gradient(circle at 40% 35%, #F87171, #C81E1E 70%)',
          boxShadow: '0 0 40px rgba(200,30,30,0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <PlayGlyph size={40} color="#fff" />
      </div>
    </div>
  );
};
