import { CanvasElement, Img, staticFile } from '@rendiv/core';
import React from 'react';
import { ParticleField } from './components/ParticleField';

/**
 * Thumbnail — 1280×720 still.
 * Left: fearsome Kalaratri — Day 7 Navadurga in Guru Pashupathi's framework
 * (early-19th-century painting, British Museum, public domain).
 * Right: bold "THE 9-DAY RESET" on dark-to-gold gradient.
 *
 * Image: "Female with sword, chopper, severed head, bowl of blood, necklace
 * of heads and naga, with caption, Kalaratri" — public domain (PD-old).
 * Source: https://commons.wikimedia.org/wiki/File:Kalaratri.jpg
 * Local copy: public/kalaratri-devi.jpg (attribution in README).
 */
export const Thumbnail: React.FC = () => (
  <CanvasElement id="Thumbnail">
    <div style={{ position: 'absolute', inset: 0, background: '#04060D', overflow: 'hidden' }}>
      {/* Kali photo — left half, full bleed */}
      <div style={{ position: 'absolute', left: 0, top: 0, width: 620, height: 720, overflow: 'hidden' }}>
        <Img
          src={staticFile('kalaratri-devi.jpg')}
          style={{ width: 620, height: 720, objectFit: 'cover', objectPosition: '50% 20%' }}
        />
        {/* darken bottom for depth + blend edge into the dark right side */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'linear-gradient(90deg, transparent 55%, rgba(4,6,13,0.55) 82%, #04060D 100%), linear-gradient(0deg, rgba(4,6,13,0.55) 0%, transparent 35%)',
          }}
        />
      </div>
      {/* right-side warm depth gradient */}
      <div
        style={{
          position: 'absolute',
          left: 560,
          right: 0,
          top: 0,
          bottom: 0,
          background:
            'radial-gradient(ellipse 90% 90% at 70% 45%, rgba(180,83,9,0.5) 0%, transparent 60%), linear-gradient(90deg, rgba(4,6,13,0.2) 0%, #0A0E1A 30%, #3B2503 75%, #7C2D12 100%)',
        }}
      />
      <ParticleField count={40} color="#FDE68A" maxSize={4} speed={0.3} area={{ w: 1280, h: 720 }} />
      {/* divider glow */}
      <div
        style={{
          position: 'absolute',
          left: 600,
          top: 80,
          bottom: 80,
          width: 3,
          background: 'linear-gradient(180deg, transparent, #EAB308, transparent)',
          opacity: 0.8,
        }}
      />
      {/* text right */}
      <div style={{ position: 'absolute', left: 660, right: 50, top: 0, bottom: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: 30, letterSpacing: 10, fontWeight: 800, color: '#FDE68A' }}>
          UNLOCK NAVARATRI
        </div>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 124, fontWeight: 800, color: '#FFF7E6', lineHeight: 0.95, marginTop: 10, textShadow: '0 6px 40px rgba(0,0,0,0.85)' }}>
          The 9-Day
          <br />
          Reset
        </div>
        <div style={{ marginTop: 22, display: 'inline-flex', alignItems: 'center', gap: 14 }}>
          <span style={{ fontSize: 26, fontWeight: 700, color: '#0A0E1A', background: '#EAB308', padding: '10px 26px', borderRadius: 999 }}>
            GURU PASHUPATHI
          </span>
          <span style={{ fontSize: 26, color: 'rgba(255,247,230,0.85)' }}>Kundalini · Energy · Siddhi</span>
        </div>
      </div>
    </div>
  </CanvasElement>
);
