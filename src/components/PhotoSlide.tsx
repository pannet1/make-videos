import { Img, interpolate, staticFile, useFrame } from '@rendiv/core';
import { noise2D } from '@rendiv/noise';
import React from 'react';
import { COLORS, FONTS } from '../theme';

export interface TitleCardProps {
  dayBadge?: string;
  tamilTitle: string;
  subTitle?: string;
}

export interface PulseGlowProps {
  x: number;
  y: number;
  color?: string;
  size?: number;
}

/**
 * Full-screen cinematic photo with organic Ken Burns pan/zoom,
 * camera breathing float, light sweep flares, film atmosphere, and title cards.
 * Transforms static image assets into living cinematic video.
 */
export const PhotoSlide: React.FC<{
  file: string;
  span: [number, number];
  zoom?: [number, number];
  pan?: { x: [number, number]; y: [number, number] };
  position?: string;
  fade?: number;
  breathing?: boolean;
  lightSweep?: boolean;
  pulseGlow?: PulseGlowProps;
  titleCard?: TitleCardProps;
  children?: React.ReactNode;
}> = ({
  file,
  span,
  zoom = [1.04, 1.14],
  pan,
  position = '50% 50%',
  fade = 30,
  breathing = true,
  lightSweep = true,
  pulseGlow,
  titleCard,
  children,
}) => {
  const frame = useFrame();
  const [from, to] = span;
  const dur = Math.max(1, to - from);
  const local = frame - from;

  if (frame < from - fade || frame > to + fade) return null;

  const opacity = interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const scale = interpolate(local, [0, dur], zoom, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const panX = pan
    ? interpolate(local, [0, dur], pan.x, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;
  const panY = pan
    ? interpolate(local, [0, dur], pan.y, { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : 0;

  const breathX = breathing ? noise2D(12.3, local * 0.012) * 8 : 0;
  const breathY = breathing ? noise2D(54.7, local * 0.01) * 6 : 0;
  const breathRot = breathing ? noise2D(89.2, local * 0.006) * 0.25 : 0;
  const breathScale = breathing ? 1 + noise2D(131.1, local * 0.005) * 0.01 : 1;

  const sweepX = interpolate(local, [0, dur], [-40, 140], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const srcPath = file.startsWith('assets/')
    ? `navaratri-sadhana/${file}`
    : file.startsWith('/')
      ? file.slice(1)
      : `navaratri-sadhana/assets/${file}`;

  const titleOpacity = titleCard
    ? interpolate(local, [15, 45, 145, 175], [0, 1, 1, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  const titleSlide = titleCard
    ? interpolate(local, [15, 45], [20, 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity }}>
      {/* Living camera image */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${panX + breathX}px, ${panY + breathY}px) scale(${scale * breathScale}) rotate(${breathRot}deg)`,
          transformOrigin: '50% 50%',
        }}
      >
        <Img
          src={staticFile(srcPath)}
          style={{
            width: 1920,
            height: 1080,
            objectFit: 'cover',
            objectPosition: position,
          }}
        />
      </div>

      {/* Cinematic letterbox vignettes */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.55) 0%, transparent 20%, transparent 72%, rgba(0,0,0,0.68) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 80% at 50% 50%, transparent 50%, rgba(0,0,0,0.58) 100%)',
        }}
      />

      {/* Subtle organic film scanline shimmer */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.18,
          pointerEvents: 'none',
          background:
            'repeating-linear-gradient(0deg, rgba(255,255,255,0.015) 0px, rgba(255,255,255,0.015) 1px, transparent 1px, transparent 3px)',
        }}
      />

      {/* Anamorphic light sweep lens flare */}
      {lightSweep && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            opacity: 0.7,
            background: `linear-gradient(115deg, transparent ${sweepX - 22}%, rgba(254,243,199,0.12) ${sweepX}%, transparent ${sweepX + 22}%)`,
          }}
        />
      )}

      {/* Focal point pulsing aura */}
      {pulseGlow && (
        <div
          style={{
            position: 'absolute',
            left: pulseGlow.x - (pulseGlow.size || 260) / 2,
            top: pulseGlow.y - (pulseGlow.size || 260) / 2,
            width: pulseGlow.size || 260,
            height: pulseGlow.size || 260,
            borderRadius: '50%',
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            background: `radial-gradient(circle, ${pulseGlow.color || COLORS.gold} 0%, rgba(234,179,8,0.2) 45%, transparent 70%)`,
            filter: 'blur(20px)',
            opacity: 0.75 + 0.25 * Math.sin(local * 0.08),
            transform: `scale(${1 + 0.08 * Math.sin(local * 0.06)})`,
          }}
        />
      )}

      {/* Documentary-style cinematic title card */}
      {titleCard && titleOpacity > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 120,
            bottom: 110,
            opacity: titleOpacity,
            transform: `translateY(${titleSlide}px)`,
            display: 'flex',
            flexDirection: 'column',
            gap: 8,
            zIndex: 10,
          }}
        >
          {titleCard.dayBadge && (
            <div style={{ display: 'inline-flex' }}>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 800,
                  letterSpacing: 4,
                  textTransform: 'uppercase',
                  color: '#0A0E1A',
                  background: 'linear-gradient(90deg, #EAB308, #FDE68A)',
                  padding: '5px 16px',
                  borderRadius: 999,
                  boxShadow: '0 4px 18px rgba(234,179,8,0.4)',
                }}
              >
                {titleCard.dayBadge}
              </span>
            </div>
          )}
          <div
            style={{
              fontFamily: FONTS.display,
              fontSize: 52,
              fontWeight: 700,
              color: '#FFF7E6',
              lineHeight: 1.1,
              textShadow: '0 4px 28px rgba(0,0,0,0.9), 0 0 12px rgba(234,179,8,0.3)',
            }}
          >
            {titleCard.tamilTitle}
          </div>
          {titleCard.subTitle && (
            <div
              style={{
                fontFamily: FONTS.body,
                fontSize: 22,
                fontWeight: 500,
                letterSpacing: 2,
                color: 'rgba(255,247,230,0.85)',
                textShadow: '0 2px 14px rgba(0,0,0,0.8)',
              }}
            >
              {titleCard.subTitle}
            </div>
          )}
        </div>
      )}

      {children}
    </div>
  );
};
