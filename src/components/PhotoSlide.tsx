import { Img, interpolate, staticFile, useFrame } from '@rendiv/core';
import React from 'react';

/**
 * Full-screen photo with slow Ken Burns drift + cinematic overlays.
 * Pure function of frame. `span` = [firstFrame, lastFrame] in LOCAL frames
 * (lets one scene hold 1-2 photos with crossfades).
 */
export const PhotoSlide: React.FC<{
  file: string;
  span: [number, number];
  zoom?: [number, number];
  position?: string;
  fade?: number;
}> = ({ file, span, zoom = [1.0, 1.12], position = '50% 50%', fade = 30 }) => {
  const frame = useFrame();
  const [from, to] = span;
  const dur = Math.max(1, to - from);
  const local = frame - from;
  const opacity = interpolate(frame, [from, from + fade, to - fade, to], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(local, [0, dur], zoom, {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  if (frame < from - fade || frame > to + fade) return null;
  return (
    <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity }}>
      <Img
        src={staticFile(`navaratri-sadhana/photos/${file}`)}
        style={{
          width: 1920,
          height: 1080,
          objectFit: 'cover',
          objectPosition: position,
          transform: `scale(${scale})`,
        }}
      />
      {/* cinematic overlays */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(0,0,0,0.45) 0%, transparent 22%, transparent 68%, rgba(0,0,0,0.6) 100%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(ellipse 90% 80% at 50% 45%, transparent 55%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
};
