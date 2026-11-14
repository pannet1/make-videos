import React from 'react';
import { CanvasElement, Fill } from '@rendiv/core';

const FONT = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const MONO = '"JetBrains Mono", "Fira Code", monospace';

const BG_DARK = '#020617';
const CARD_BG = '#0f172a';
const CARD_SURFACE = '#1e293b';
const BORDER_COLOR = '#334155';

const CYAN_ACCENT = '#38bdf8';
const EMERALD_OK = '#10b981';
const AMBER_WARN = '#f59e0b';
const ROSE_DANGER = '#f43f5e';
const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';

export const BathroomThumbnail: React.FC = () => {
  return (
    <CanvasElement id="BathroomThumbnail">
      <Fill
        style={{
          backgroundColor: BG_DARK,
          position: 'relative',
          overflow: 'hidden',
          fontFamily: FONT,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '80px 100px',
        }}
      >
        {/* Subtle grid background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.06) 1px, transparent 0)`,
            backgroundSize: '40px 40px',
            opacity: 0.8,
          }}
        />

        {/* Deep cyan/emerald glow gradients */}
        <div
          style={{
            position: 'absolute',
            top: -150,
            left: -100,
            width: 700,
            height: 700,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(14,165,233,0.18) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -200,
            right: 100,
            width: 800,
            height: 800,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Left: High-Impact Typography & Value Propositions */}
        <div style={{ maxWidth: 880, zIndex: 10, display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Top Brand Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                backgroundColor: 'rgba(56, 189, 248, 0.15)',
                color: CYAN_ACCENT,
                border: '1px solid rgba(56, 189, 248, 0.4)',
                padding: '8px 20px',
                borderRadius: 999,
                fontSize: 18,
                fontWeight: 800,
                letterSpacing: 2,
                textTransform: 'uppercase',
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  backgroundColor: CYAN_ACCENT,
                  boxShadow: '0 0 10px #38bdf8',
                }}
              />
              <span>APARTMENT THREAD &bull; HARDWARE PATTERN 3</span>
            </div>
            <span
              style={{
                fontSize: 16,
                fontFamily: MONO,
                color: EMERALD_OK,
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                padding: '8px 16px',
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              DS-1 HARDWIRED
            </span>
          </div>

          {/* Main Title */}
          <h1
            style={{
              fontSize: 78,
              fontWeight: 900,
              color: TEXT_PRIMARY,
              lineHeight: 1.05,
              margin: 0,
              letterSpacing: -2,
            }}
          >
            THE BATHROOM <br />
            <span
              style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              DOOR SENSOR HACK
            </span>
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: 28,
              color: TEXT_MUTED,
              lineHeight: 1.4,
              margin: 0,
              fontWeight: 500,
            }}
          >
            Why motion radar fails in steam &mdash; and how a ₹57 reed switch on a switchboard dummy channel unlocks 100% offline presence.
          </p>

          {/* Feature Badge Pills */}
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div
              style={{
                backgroundColor: CARD_BG,
                border: '2px solid #10b981',
                padding: '12px 22px',
                borderRadius: 14,
                boxShadow: '0 10px 25px rgba(16,185,129,0.2)',
              }}
            >
              <div style={{ fontSize: 13, fontFamily: MONO, color: '#34d399', fontWeight: 800 }}>POWER</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: TEXT_PRIMARY }}>ZERO BATTERIES</div>
            </div>

            <div
              style={{
                backgroundColor: CARD_BG,
                border: '2px solid #38bdf8',
                padding: '12px 22px',
                borderRadius: 14,
                boxShadow: '0 10px 25px rgba(56,189,248,0.2)',
              }}
            >
              <div style={{ fontSize: 13, fontFamily: MONO, color: '#38bdf8', fontWeight: 800 }}>RESPONSE</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: TEXT_PRIMARY }}>&lt; 5ms ON-CHIP</div>
            </div>

            <div
              style={{
                backgroundColor: CARD_BG,
                border: '2px solid #f59e0b',
                padding: '12px 22px',
                borderRadius: 14,
                boxShadow: '0 10px 25px rgba(245,158,11,0.2)',
              }}
            >
              <div style={{ fontSize: 13, fontFamily: MONO, color: '#fbbf24', fontWeight: 800 }}>ENVIRONMENT</div>
              <div style={{ fontSize: 22, fontWeight: 900, color: TEXT_PRIMARY }}>STEAM IMMUNE</div>
            </div>
          </div>
        </div>

        {/* Right: Technical Diagram Card */}
        <div
          style={{
            width: 680,
            height: 720,
            backgroundColor: CARD_BG,
            border: `2px solid ${BORDER_COLOR}`,
            borderRadius: 28,
            padding: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
            position: 'relative',
            zIndex: 10,
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 15, fontFamily: MONO, fontWeight: 800, color: CYAN_ACCENT }}>
              ARCHITECTURE SCHEMATIC
            </span>
            <span
              style={{
                fontSize: 14,
                fontFamily: MONO,
                fontWeight: 800,
                color: EMERALD_OK,
                backgroundColor: 'rgba(16,185,129,0.15)',
                padding: '6px 12px',
                borderRadius: 6,
              }}
            >
              100% LOCAL-FIRST
            </span>
          </div>

          {/* Door & Sensor Graphic */}
          <div
            style={{
              backgroundColor: CARD_SURFACE,
              borderRadius: 20,
              padding: 28,
              border: `1px solid ${BORDER_COLOR}`,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 32,
                    height: 56,
                    backgroundColor: '#0284c7',
                    border: '2px solid #38bdf8',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(56,189,248,0.5)',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', writingMode: 'vertical-rl' }}>
                    REED
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: TEXT_PRIMARY }}>MC-38 Sensor Body</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED }}>Mounted on Exterior Door Jamb</div>
                </div>
              </div>

              <div
                style={{
                  fontSize: 14,
                  fontFamily: MONO,
                  fontWeight: 800,
                  color: EMERALD_OK,
                  backgroundColor: 'rgba(16,185,129,0.2)',
                  padding: '6px 12px',
                  borderRadius: 6,
                }}
              >
                &lt; 15mm GAP
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div
                  style={{
                    width: 30,
                    height: 50,
                    backgroundColor: '#059669',
                    border: '2px solid #34d399',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 16px rgba(52,211,153,0.5)',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#fff', writingMode: 'vertical-rl' }}>
                    MAG
                  </span>
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: TEXT_PRIMARY }}>Magnet Piece</div>
                  <div style={{ fontSize: 13, color: TEXT_MUTED }}>On Moving Door Leaf</div>
                </div>
              </div>
            </div>

            {/* In-Wall Switchboard Module Card */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '2px solid #38bdf8',
                borderRadius: 14,
                padding: 20,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 16, fontWeight: 800, color: TEXT_PRIMARY }}>
                  TINXY MODULAR SWITCH MODULE
                </span>
                <span style={{ fontSize: 12, fontFamily: MONO, color: CYAN_ACCENT, fontWeight: 700 }}>
                  ESP8266 Silicon
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700 }}>L (Mains)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171' }}>230V Phase</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 6, textAlign: 'center' }}>
                  <div style={{ fontSize: 11, color: TEXT_MUTED, fontWeight: 700 }}>N (Mains)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#60a5fa' }}>Neutral</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 6, textAlign: 'center', border: '1px solid #10b981' }}>
                  <div style={{ fontSize: 11, color: '#10b981', fontWeight: 700 }}>L1 (Load 1)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: TEXT_PRIMARY }}>Light + Fan</div>
                </div>
                <div style={{ backgroundColor: 'rgba(245,158,11,0.2)', padding: 10, borderRadius: 6, textAlign: 'center', border: '1px solid #f59e0b' }}>
                  <div style={{ fontSize: 11, color: '#f59e0b', fontWeight: 700 }}>S2 (Dummy)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24' }}>Reed Signal</div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Metric Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 14, fontFamily: MONO, color: TEXT_MUTED }}>
              BOM SOURCING: <strong>₹57 INR</strong> (Robocraze)
            </span>
            <span style={{ fontSize: 14, fontFamily: MONO, color: EMERALD_OK, fontWeight: 800 }}>
              STANDALONE ESPHOME
            </span>
          </div>
        </div>
      </Fill>
    </CanvasElement>
  );
};
