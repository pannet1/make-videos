import React from 'react';
import {
  Audio,
  CanvasElement,
  Fill,
  Sequence,
  Series,
  interpolate,
  spring,
  staticFile,
  useFrame,
} from '@rendiv/core';

const VIDEO_ID = 'bathroom-pattern';
const TOTAL_FRAMES = 4284;
const FPS = 30;

const VO_START = [0, 766, 1634, 2411, 3484];
const VO_LEN = [766, 868, 777, 1073, 800];
const VO = (n: number): string => `${VIDEO_ID}/vo/${String(n).padStart(2, '0')}.mp3`;

// Visual Design Tokens
const FONT = '"Inter", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
const MONO = '"JetBrains Mono", "Fira Code", monospace';

const BG_DARK = '#020617';
const CARD_BG = '#0f172a';
const CARD_SURFACE = '#1e293b';
const BORDER_COLOR = '#334155';
const BORDER_LIGHT = '#475569';

const TEXT_PRIMARY = '#f8fafc';
const TEXT_MUTED = '#94a3b8';
const TEXT_SUBTLE = '#64748b';

const CYAN_ACCENT = '#38bdf8';
const EMERALD_OK = '#10b981';
const AMBER_WARN = '#f59e0b';
const ROSE_DANGER = '#f43f5e';
const INDIGO_TAG = '#6366f1';

// Shared UI: Top Bar
const HeaderBar: React.FC<{ chapterIndex: number; chapterTitle: string }> = ({
  chapterIndex,
  chapterTitle,
}) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 80,
        backgroundColor: 'rgba(2, 6, 23, 0.85)',
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${BORDER_COLOR}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 60px',
        zIndex: 50,
        fontFamily: FONT,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
            padding: '6px 14px',
            borderRadius: 8,
            boxShadow: '0 0 16px rgba(14, 165, 233, 0.35)',
          }}
        >
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              backgroundColor: '#38bdf8',
              boxShadow: '0 0 8px #38bdf8',
            }}
          />
          <span style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1.5, color: '#ffffff' }}>
            APARTMENT THREAD
          </span>
        </div>
        <span style={{ fontSize: 16, color: TEXT_MUTED, fontWeight: 500 }}>
          Pattern 3 &bull; Bathroom Presence Architecture
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            padding: '6px 16px',
            borderRadius: 20,
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 700, color: CYAN_ACCENT }}>
            CH {chapterIndex + 1}
          </span>
          <span style={{ fontSize: 14, fontWeight: 600, color: TEXT_PRIMARY }}>
            {chapterTitle}
          </span>
        </div>

        <div
          style={{
            fontSize: 12,
            fontFamily: MONO,
            color: EMERALD_OK,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '4px 10px',
            borderRadius: 6,
            fontWeight: 700,
          }}
        >
          LATENCY &lt;5ms
        </div>
      </div>
    </div>
  );
};

// Shared UI: Bottom Chapter Progress Timeline
const BottomTimeline: React.FC<{ currentFrame: number }> = ({ currentFrame }) => {
  const chapters = ['Sensor Trap', 'Physical Boundary', 'Dummy Channel', 'State Machine', 'Local-First'];
  const progressRatio = Math.min(1, Math.max(0, currentFrame / TOTAL_FRAMES));

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 50,
        backgroundColor: 'rgba(2, 6, 23, 0.9)',
        borderTop: `1px solid ${BORDER_COLOR}`,
        display: 'flex',
        alignItems: 'center',
        padding: '0 60px',
        gap: 24,
        zIndex: 50,
        fontFamily: FONT,
      }}
    >
      <div style={{ flex: 1, height: 6, backgroundColor: CARD_SURFACE, borderRadius: 3, position: 'relative' }}>
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${progressRatio * 100}%`,
            background: 'linear-gradient(90deg, #0ea5e9, #38bdf8)',
            borderRadius: 3,
            boxShadow: '0 0 10px rgba(56, 189, 248, 0.5)',
          }}
        />
        {VO_START.map((startFrame, idx) => {
          const isPassed = currentFrame >= startFrame;
          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                left: `${(startFrame / TOTAL_FRAMES) * 100}%`,
                top: -3,
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: isPassed ? '#38bdf8' : BORDER_LIGHT,
                border: '2px solid #020617',
              }}
            />
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 20 }}>
        {chapters.map((name, i) => {
          const isActive = currentFrame >= VO_START[i] && (i === VO_START.length - 1 || currentFrame < VO_START[i + 1]);
          return (
            <span
              key={i}
              style={{
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? CYAN_ACCENT : TEXT_SUBTLE,
              }}
            >
              0{i + 1} {name}
            </span>
          );
        })}
      </div>
    </div>
  );
};

// =========================================================================
// SUBTITLE CUES & SYNCHRONIZED CLOSED-CAPTION BANNER
// =========================================================================
const SUBTITLE_CUES = [
  { start: 0, end: 220, text: "Most smart bathrooms fail for one simple reason: sensors hate steam." },
  { start: 220, end: 520, text: "PIR motion sensors cannot see through glass shower cabins, mmWave radars suffer from reflection noise, and battery sensors die in high humidity." },
  { start: 520, end: 765, text: "Even worse, naive rules like \"turn light on when door closes\" leave you stepping into pitch darkness." },
  { start: 766, end: 1020, text: "Instead of struggling with wireless sensors inside the shower, Apartment Thread exploits the bathroom door as an absolute physical boundary." },
  { start: 1020, end: 1280, text: "We use a ₹57 MC-38 wired magnetic reed switch mounted on the exterior door jamb—completely isolated from interior moisture." },
  { start: 1280, end: 1633, text: "When the gap is under 15mm, the dry contact closes with zero battery maintenance and perpetual reliability." },
  { start: 1634, end: 1890, text: "In typical Indian apartments, a modular switchboard sits right next to the bathroom door frame." },
  { start: 1890, end: 2150, text: "We pull a 2-core wire through concealed conduit directly into input S2 of a Tinxy smart switch, leaving Relay 2 unconnected as a dummy channel." },
  { start: 2150, end: 2410, text: "Input S2 triggers a hardware GPIO interrupt in under 5ms on the ESP8266 silicon with zero wireless latency." },
  { start: 2411, end: 2660, text: "State 1: Opening the door immediately turns the light ON (<5ms)—illuminating the threshold before you enter." },
  { start: 2660, end: 2920, text: "State 2: Closing the door locks the vanity light and exhaust fan ON indefinitely—completely immune to shower steam or stillness." },
  { start: 2920, end: 3180, text: "State 3: Opening the door to exit starts a gentle 60-second vacancy countdown and ventilation dissipation cycle." },
  { start: 3180, end: 3483, text: "State 4: When the timer expires, the lights shut off automatically. A self-correcting loop that never desyncs." },
  { start: 3484, end: 3740, text: "The entire pattern is 100% local-first. If Wi-Fi drops or Home Assistant crashes, the switchboard operates identically on local silicon." },
  { start: 3740, end: 4010, text: "Standard physical rocker switches preserve manual override at all times, backed by a 45-minute safety watchdog." },
  { start: 4010, end: 4283, text: "High-reliability residential automation retrofitted into standard Indian modular switchboards for under ₹1,500 INR." }
];

const SubtitleBanner: React.FC<{ currentFrame: number }> = ({ currentFrame }) => {
  const activeCue = SUBTITLE_CUES.find(c => currentFrame >= c.start && currentFrame < c.end);
  if (!activeCue) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 60,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 60,
        pointerEvents: 'none',
        fontFamily: FONT,
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(2, 6, 23, 0.92)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.7)',
          padding: '8px 24px',
          borderRadius: 10,
          maxWidth: 1250,
          textAlign: 'center',
        }}
      >
        <span
          style={{
            color: '#f8fafc',
            fontSize: 16,
            fontWeight: 600,
            lineHeight: 1.4,
            letterSpacing: 0.3,
          }}
        >
          {activeCue.text}
        </span>
      </div>
    </div>
  );
};

// =========================================================================
// SCENE 0: The Bathroom Sensor Problem
// =========================================================================
const SceneProblem: React.FC = () => {
  const frame = useFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: 'clamp' });

  const card1Spring = spring({ frame: Math.max(0, frame - 15), fps: FPS, config: { damping: 14 } });
  const card2Spring = spring({ frame: Math.max(0, frame - 30), fps: FPS, config: { damping: 14 } });
  const card3Spring = spring({ frame: Math.max(0, frame - 45), fps: FPS, config: { damping: 14 } });

  return (
    <Fill style={{ backgroundColor: BG_DARK, padding: '120px 80px 80px 80px', fontFamily: FONT }}>
      <HeaderBar chapterIndex={0} chapterTitle="Why Smart Bathrooms Fail" />

      <div style={{ opacity: fade, transform: `translateY(${titleY}px)`, textAlign: 'center', marginBottom: 44 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(244, 63, 94, 0.12)',
            color: ROSE_DANGER,
            border: '1px solid rgba(244, 63, 94, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 16,
          }}
        >
          <span>CRITICAL FAILURE MODES</span>
        </div>
        <h1
          style={{
            fontSize: 54,
            fontWeight: 900,
            color: TEXT_PRIMARY,
            margin: '0 0 12px 0',
            letterSpacing: -1,
            lineHeight: 1.15,
          }}
        >
          Why Standard Sensors Fail in Bathrooms
        </h1>
        <p style={{ fontSize: 22, color: TEXT_MUTED, maxWidth: 980, margin: '0 auto', lineHeight: 1.5 }}>
          Hot steam, glass partitions, and stationary shower occupancy break traditional automation sensors.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 28,
          maxWidth: 1600,
          margin: '0 auto',
        }}
      >
        {/* Card 1: PIR */}
        <div
          style={{
            transform: `scale(${card1Spring})`,
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 20,
            padding: 32,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: ROSE_DANGER,
            }}
          />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: ROSE_DANGER }}>
                FAIL MODE 01
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: ROSE_DANGER,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                BLIND DROPOUT
              </span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 10px 0' }}>
              PIR Motion Sensors
            </h3>
            <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
              PIR sensors cannot penetrate glass shower enclosures. A person relaxing in a bathtub or taking a hot shower is detected as &ldquo;vacant&rdquo; &mdash; plunging them into total darkness.
            </p>

            {/* Micro-diagram: PIR blocked by glass */}
            <div
              style={{
                marginTop: 14,
                backgroundColor: 'rgba(2, 6, 23, 0.6)',
                borderRadius: 10,
                padding: '8px 12px',
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: ROSE_DANGER }}>
                  OPTICAL BARRIER
                </span>
                <span style={{ fontSize: 9, fontFamily: MONO, color: '#fca5a5' }}>
                  &lambda; = 10&mu;m FIR BLOCKED
                </span>
              </div>
              <svg width="100%" height="36" viewBox="0 0 320 36">
                <rect x="5" y="6" width="40" height="22" rx="4" fill="#334155" stroke="#f43f5e" strokeWidth="1.5" />
                <text x="25" y="21" fill="#ffffff" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="700">PIR</text>

                <line x1="48" y1="12" x2="140" y2="8" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />
                <line x1="48" y1="17" x2="140" y2="17" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="48" y1="22" x2="140" y2="26" stroke="#f43f5e" strokeWidth="1.5" strokeDasharray="3 3" />

                <line x1="140" y1="2" x2="140" y2="34" stroke="#38bdf8" strokeWidth="3" />
                <text x="140" y="34" fill="#38bdf8" fontSize="6" fontFamily={MONO} textAnchor="middle">GLASS</text>

                <line x1="140" y1="8" x2="95" y2="2" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="140" y1="26" x2="95" y2="32" stroke="#f43f5e" strokeWidth="1" strokeDasharray="2 2" />

                <rect x="180" y="6" width="130" height="22" rx="4" fill="#1e293b" stroke="#475569" />
                <text x="245" y="20" fill="#94a3b8" fontSize="8" fontFamily={MONO} textAnchor="middle">
                  SHOWER (BLIND)
                </text>
              </svg>
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              padding: '14px',
              backgroundColor: CARD_SURFACE,
              borderRadius: 12,
              border: `1px solid ${BORDER_COLOR}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SUBTLE, marginBottom: 4 }}>
              PHYSICAL DEFECT
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fca5a5' }}>
              Requires continuous motion; blocked by water &amp; glass
            </div>
          </div>
        </div>

        {/* Card 2: mmWave */}
        <div
          style={{
            transform: `scale(${card2Spring})`,
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 20,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: AMBER_WARN,
            }}
          />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: AMBER_WARN }}>
                FAIL MODE 02
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  color: AMBER_WARN,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                GHOST TRIGGERS
              </span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 10px 0' }}>
              mmWave 24GHz Radar
            </h3>
            <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
              24GHz radar waves reflect violently off glazed ceramic tiles, mirrors, and vibrating water droplets from showers. Exhaust fan draft vibrations create continuous phantom presence loops.
            </p>

            {/* Micro-diagram: mmWave multipath tile bounce */}
            <div
              style={{
                marginTop: 14,
                backgroundColor: 'rgba(2, 6, 23, 0.6)',
                borderRadius: 10,
                padding: '8px 12px',
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: AMBER_WARN }}>
                  RF MULTIPATH BOUNCE
                </span>
                <span style={{ fontSize: 9, fontFamily: MONO, color: '#fde68a' }}>
                  24GHz CERAMIC REFLECTION
                </span>
              </div>
              <svg width="100%" height="36" viewBox="0 0 320 36">
                <rect x="5" y="6" width="48" height="22" rx="4" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
                <text x="29" y="21" fill="#ffffff" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="700">24GHz</text>

                <path d="M 60 17 Q 85 8 110 17 T 160 17" fill="none" stroke="#f59e0b" strokeWidth="1.5" />

                <rect x="175" y="2" width="6" height="32" fill="#475569" stroke="#94a3b8" />
                <text x="178" y="34" fill="#94a3b8" fontSize="6" fontFamily={MONO} textAnchor="middle">TILE</text>

                <line x1="175" y1="10" x2="230" y2="4" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="175" y1="17" x2="240" y2="24" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="175" y1="24" x2="220" y2="32" stroke="#fbbf24" strokeWidth="1" strokeDasharray="2 2" />

                <text x="270" y="21" fill="#fbbf24" fontSize="8" fontFamily={MONO} textAnchor="middle">
                  PHANTOM LOOP
                </text>
              </svg>
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              padding: '14px',
              backgroundColor: CARD_SURFACE,
              borderRadius: 12,
              border: `1px solid ${BORDER_COLOR}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SUBTLE, marginBottom: 4 }}>
              PHYSICAL DEFECT
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fde68a' }}>
              Tile multi-path reflection &amp; water droplet vibration noise
            </div>
          </div>
        </div>

        {/* Card 3: Naive Automation */}
        <div
          style={{
            transform: `scale(${card3Spring})`,
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 20,
            padding: 28,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: 4,
              backgroundColor: ROSE_DANGER,
            }}
          />
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: ROSE_DANGER }}>
                FAIL MODE 03
              </span>
              <span
                style={{
                  backgroundColor: 'rgba(244, 63, 94, 0.15)',
                  color: ROSE_DANGER,
                  fontSize: 12,
                  fontWeight: 700,
                  padding: '4px 10px',
                  borderRadius: 6,
                }}
              >
                LOGIC FLAW
              </span>
            </div>
            <h3 style={{ fontSize: 24, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 10px 0' }}>
              Naive Door Automation
            </h3>
            <p style={{ fontSize: 16, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
              A naive rule like <em>&ldquo;Door closed = ON; Door open = OFF&rdquo;</em> fails upon entry: the occupant opens the door and is left in pitch darkness until they enter and pull the door shut!
            </p>

            {/* Micro-diagram: Naive Logic Timeline */}
            <div
              style={{
                marginTop: 14,
                backgroundColor: 'rgba(2, 6, 23, 0.6)',
                borderRadius: 10,
                padding: '8px 12px',
                border: `1px solid ${BORDER_COLOR}`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <span style={{ fontSize: 10, fontFamily: MONO, fontWeight: 700, color: ROSE_DANGER }}>
                  LOGIC STATE CONFLICT
                </span>
                <span style={{ fontSize: 9, fontFamily: MONO, color: '#fca5a5' }}>
                  NO TRANSITION MEMORY
                </span>
              </div>
              <svg width="100%" height="36" viewBox="0 0 320 36">
                <rect x="5" y="6" width="80" height="22" rx="4" fill="#1e293b" stroke="#f43f5e" />
                <text x="45" y="20" fill="#fca5a5" fontSize="8" fontFamily={MONO} textAnchor="middle">
                  DOOR OPEN
                </text>

                <line x1="88" y1="17" x2="120" y2="17" stroke="#f43f5e" strokeWidth="1.5" />
                <polygon points="118,14 124,17 118,20" fill="#f43f5e" />

                <rect x="126" y="6" width="95" height="22" rx="4" fill="#020617" stroke="#f43f5e" />
                <text x="173" y="20" fill="#f43f5e" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="800">
                  LIGHT: OFF (DARK)
                </text>

                <line x1="224" y1="17" x2="250" y2="17" stroke="#f43f5e" strokeWidth="1.5" />
                <polygon points="248,14 254,17 248,20" fill="#f43f5e" />

                <text x="282" y="21" fill="#f87171" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="700">
                  TRIPPED!
                </text>
              </svg>
            </div>
          </div>
          <div
            style={{
              marginTop: 18,
              padding: '14px',
              backgroundColor: CARD_SURFACE,
              borderRadius: 12,
              border: `1px solid ${BORDER_COLOR}`,
            }}
          >
            <div style={{ fontSize: 12, fontWeight: 700, color: TEXT_SUBTLE, marginBottom: 4 }}>
              ARCHITECTURAL FLAW
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#fca5a5' }}>
              No state memory &bull; Threshold is dark during entry
            </div>
          </div>
        </div>
      </div>
    </Fill>
  );
};

// =========================================================================
// SCENE 1: Physical Boundary & MC-38 Reed Switch
// =========================================================================
const SceneSensor: React.FC = () => {
  const frame = useFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const titleY = interpolate(frame, [0, 25], [30, 0], { extrapolateRight: 'clamp' });

  // Door angle animation
  const doorAngle = interpolate(frame, [30, 80], [45, 0], { extrapolateRight: 'clamp' });
  const gapMetric = interpolate(frame, [30, 80], [35, 6], { extrapolateRight: 'clamp' });
  const isClosed = frame > 75;
  const reedGap = interpolate(gapMetric, [6, 20], [0, 5], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });

  return (
    <Fill style={{ backgroundColor: BG_DARK, padding: '120px 80px 80px 80px', fontFamily: FONT }}>
      <HeaderBar chapterIndex={1} chapterTitle="Physical Boundary Determinism" />

      <div style={{ opacity: fade, transform: `translateY(${titleY}px)`, marginBottom: 40, textAlign: 'center' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(56, 189, 248, 0.12)',
            color: CYAN_ACCENT,
            border: '1px solid rgba(56, 189, 248, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          <span>HARDWARE SELECTION &bull; DS-1</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 900, color: TEXT_PRIMARY, margin: 0, letterSpacing: -1 }}>
          The MC-38 Magnetic Reed Switch
        </h1>
        <p style={{ fontSize: 20, color: TEXT_MUTED, marginTop: 10 }}>
          Exploiting the bathroom door as an absolute physical boundary. Mounted externally to isolate steam.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: 36, maxWidth: 1600, margin: '0 auto' }}>
        {/* Left: Interactive Architectural Door Diagram & Cutaway */}
        <div
          style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 20,
            padding: '28px 32px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div
            style={{
              width: '100%',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontFamily: MONO,
                color: TEXT_SUBTLE,
                fontWeight: 700,
              }}
            >
              TOP-DOWN ARCHITECTURAL CROSS-SECTION
            </span>

            <span
              style={{
                backgroundColor: isClosed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: isClosed ? EMERALD_OK : AMBER_WARN,
                border: `1px solid ${isClosed ? EMERALD_OK : AMBER_WARN}`,
                padding: '4px 12px',
                borderRadius: 8,
                fontSize: 12,
                fontFamily: MONO,
                fontWeight: 700,
              }}
            >
              {isClosed ? 'MAGNET ENGAGED (CLOSED)' : 'APPROACHING (OPEN)'}
            </span>
          </div>

          {/* Doorway Graphic Container */}
          <div
            style={{
              width: '100%',
              height: 250,
              position: 'relative',
              backgroundColor: CARD_SURFACE,
              borderRadius: 14,
              border: `1px solid ${BORDER_COLOR}`,
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* Exterior Label vs Interior Steam Zone */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 18,
                fontSize: 11,
                fontWeight: 800,
                color: CYAN_ACCENT,
                letterSpacing: 1.5,
              }}
            >
              HALLWAY EXTERIOR (DRY ZONE)
            </div>
            <div
              style={{
                position: 'absolute',
                bottom: 12,
                left: 18,
                fontSize: 11,
                fontWeight: 800,
                color: ROSE_DANGER,
                letterSpacing: 1.5,
              }}
            >
              BATHROOM INTERIOR (STEAM &amp; SHOWER CONDENSATION)
            </div>

            {/* Moisture Barrier Divider Line */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: '52%',
                height: 1,
                borderTop: '1px dashed #64748b',
              }}
            />

            {/* Door Frame (Fixed Wall / Strike Jamb) */}
            <div
              style={{
                position: 'absolute',
                left: 60,
                top: 40,
                width: 130,
                height: 95,
                backgroundColor: '#334155',
                borderRadius: 8,
                border: '2px solid #475569',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <span style={{ fontSize: 12, fontWeight: 800, color: TEXT_PRIMARY }}>DOOR FRAME</span>
              <span style={{ fontSize: 10, color: TEXT_MUTED }}>Strike Jamb</span>

              {/* MC-38 Sensor Body (Wired Dry Contact) mounted on exterior face */}
              <div
                style={{
                  position: 'absolute',
                  right: -13,
                  width: 26,
                  height: 52,
                  backgroundColor: '#0284c7',
                  borderRadius: 6,
                  border: '2px solid #38bdf8',
                  boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ writingMode: 'vertical-rl', fontSize: 9, fontWeight: 800, color: '#ffffff' }}>
                  REED
                </div>
              </div>
            </div>

            {/* Moving Door Leaf */}
            <div
              style={{
                position: 'absolute',
                left: 194 + gapMetric,
                top: 40,
                width: 230,
                height: 32,
                backgroundColor: '#1e293b',
                border: '2px solid #64748b',
                borderRadius: 6,
                transformOrigin: 'right center',
                transform: `rotate(${doorAngle}deg)`,
                display: 'flex',
                alignItems: 'center',
                paddingLeft: 10,
              }}
            >
              {/* Passive Magnet mounted on Door Leaf */}
              <div
                style={{
                  position: 'absolute',
                  left: -13,
                  width: 24,
                  height: 42,
                  backgroundColor: '#059669',
                  borderRadius: 6,
                  border: '2px solid #34d399',
                  boxShadow: '0 0 12px rgba(52, 211, 153, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <div style={{ writingMode: 'vertical-rl', fontSize: 9, fontWeight: 800, color: '#ffffff' }}>
                  MAG
                </div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEXT_PRIMARY, marginLeft: 16 }}>
                MOVING DOOR LEAF
              </span>
            </div>

            {/* Gap Indicator */}
            <div
              style={{
                position: 'absolute',
                left: 190,
                top: 155,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <div
                style={{
                  fontSize: 13,
                  fontFamily: MONO,
                  fontWeight: 700,
                  color: isClosed ? EMERALD_OK : AMBER_WARN,
                }}
              >
                GAP: {gapMetric.toFixed(1)} mm &le; 15mm TOLERANCE
              </div>
            </div>
          </div>

          {/* Internal Cutaway: Hermetic Borosilicate Glass Reed Capsule */}
          <div
            style={{
              width: '100%',
              marginTop: 14,
              backgroundColor: CARD_SURFACE,
              borderRadius: 14,
              border: `1px solid ${BORDER_COLOR}`,
              padding: '12px 18px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: CYAN_ACCENT }}>
                  INTERNAL CUTAWAY &bull; HERMETIC GLASS CAPSULE
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: MONO,
                    backgroundColor: 'rgba(56, 189, 248, 0.15)',
                    color: CYAN_ACCENT,
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  N₂ INERT GAS
                </span>
              </div>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: MONO,
                  fontWeight: 800,
                  color: isClosed ? EMERALD_OK : AMBER_WARN,
                  backgroundColor: isClosed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  padding: '2px 8px',
                  borderRadius: 4,
                  border: `1px solid ${isClosed ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                }}
              >
                {isClosed ? 'REEDS TOUCHING \u2022 0.05 \u03A9' : 'REEDS SEPARATED \u2022 \u221E \u03A9'}
              </span>
            </div>

            {/* SVG Illustration of Glass Capsule */}
            <svg width="100%" height="68" viewBox="0 0 540 68">
              <defs>
                <linearGradient id="glassGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#1e293b" stopOpacity="0.8" />
                </linearGradient>
              </defs>

              {/* Borosilicate Glass Envelope */}
              <rect
                x="55"
                y="10"
                width="430"
                height="48"
                rx="24"
                fill="url(#glassGrad)"
                stroke={isClosed ? 'rgba(56, 189, 248, 0.5)' : 'rgba(148, 163, 184, 0.3)'}
                strokeWidth="2"
              />
              {/* Glass subtle highlight stripe */}
              <rect x="80" y="14" width="380" height="5" rx="2.5" fill="rgba(255, 255, 255, 0.08)" />

              {/* Left Terminal Lead (Solid Wire) */}
              <line x1="15" y1="34" x2="110" y2="34" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="15" cy="34" r="3.5" fill="#38bdf8" />
              <text x="18" y="48" fill="#64748b" fontSize="8" fontFamily={MONO} fontWeight="700">
                TO S2
              </text>

              {/* Right Terminal Lead (Solid Wire) */}
              <line x1="430" y1="34" x2="525" y2="34" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="525" cy="34" r="3.5" fill="#38bdf8" />
              <text x="480" y="48" fill="#64748b" fontSize="8" fontFamily={MONO} fontWeight="700">
                TO GND/N
              </text>

              {/* Magnetic Flux Lines when magnet approaches */}
              {gapMetric < 20 && (
                <g opacity={Math.min(1, (20 - gapMetric) / 10)}>
                  <path
                    d="M 230 16 Q 270 6 310 16"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <path
                    d="M 230 52 Q 270 62 310 52"
                    fill="none"
                    stroke="#a855f7"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                  />
                  <text x="270" y="61" fill="#c084fc" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="800">
                    B-FIELD FLUX &gt; 15 GAUSS
                  </text>
                </g>
              )}

              {/* Upper Flexible Ferromagnetic Reed Blade (from Left Lead) */}
              <path
                d={`M 110 34 L 235 34 L 290 ${isClosed ? 33 : 28}`}
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Lower Flexible Ferromagnetic Reed Blade (from Right Lead) */}
              <path
                d={`M 430 34 L 305 34 L 250 ${isClosed ? 35 : 40}`}
                stroke="#cbd5e1"
                strokeWidth="4"
                strokeLinecap="round"
                fill="none"
              />

              {/* Contact Area & Micro-spark Glow */}
              {isClosed ? (
                <g>
                  <circle cx="270" cy="34" r="7" fill="#38bdf8" opacity="0.5" />
                  <circle cx="270" cy="34" r="3" fill="#ffffff" />
                  <text x="270" y="47" fill="#34d399" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="800">
                    RHODIUM CONTACTS CLOSED
                  </text>
                </g>
              ) : (
                <g>
                  <line x1="270" y1="28" x2="270" y2="40" stroke="#f59e0b" strokeWidth="1" strokeDasharray="1 2" />
                  <text x="270" y="47" fill="#f59e0b" fontSize="8" fontFamily={MONO} textAnchor="middle" fontWeight="800">
                    AIR GAP: {reedGap.toFixed(1)}mm
                  </text>
                </g>
              )}
            </svg>
          </div>
        </div>

        {/* Right: Technical Specs & Advantages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <div style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: CYAN_ACCENT, marginBottom: 12 }}>
              HARDWARE SPECIFICATIONS &bull; DS-1
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: TEXT_MUTED }}>Sensor Model</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY }}>MC-38 Magnetic Reed</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: TEXT_MUTED }}>Unit Sourcing Cost</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: EMERALD_OK }}>₹57 INR (Robocraze)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: TEXT_MUTED }}>Operating Power</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY }}>0.00 Watts (Passive Dry)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${BORDER_COLOR}`, paddingBottom: 8 }}>
                <span style={{ fontSize: 14, color: TEXT_MUTED }}>Battery Replacement</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: EMERALD_OK }}>NEVER (Hardwired)</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 14, color: TEXT_MUTED }}>Switching Lifespan</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: TEXT_PRIMARY }}>&gt; 1,000,000 Cycles</span>
              </div>
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.25)',
              borderRadius: 18,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: EMERALD_OK, marginBottom: 6 }}>
              STEAM &amp; MOISTURE ISOLATION
            </div>
            <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
              Mounting the sensor body on the exterior door jamb keeps electrical dry contacts outside the high-humidity shower zone &mdash; eliminating corrosion and false resistance bridges permanently.
            </p>
          </div>

          {/* Live Multimeter Readout */}
          <div
            style={{
              backgroundColor: 'rgba(2, 6, 23, 0.8)',
              border: `1px solid ${isClosed ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)'}`,
              borderRadius: 18,
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontFamily: MONO, color: TEXT_SUBTLE, fontWeight: 700 }}>
                BENCH CONTINUITY READOUT
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: isClosed ? EMERALD_OK : AMBER_WARN, marginTop: 2 }}>
                {isClosed ? 'CLOSED LOOP (0.05 \u03A9)' : 'OPEN LOOP (\u221E \u03A9)'}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontFamily: MONO, color: TEXT_SUBTLE, fontWeight: 700 }}>
                ESP8266 GPIO VOLTAGE
              </div>
              <div style={{ fontSize: 16, fontFamily: MONO, fontWeight: 800, color: isClosed ? EMERALD_OK : CYAN_ACCENT, marginTop: 2 }}>
                {isClosed ? '0.0V (FALLING EDGE)' : '3.3V (INTERNAL PULLUP)'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fill>
  );
};

// =========================================================================
// SCENE 2: In-Wall Dummy Channel Wiring
// =========================================================================
const SceneWiring: React.FC = () => {
  const frame = useFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const pulse = Math.sin(frame * 0.15) * 0.5 + 0.5;
  const signalPos = (frame * 4) % 180;

  return (
    <Fill style={{ backgroundColor: BG_DARK, padding: '120px 80px 80px 80px', fontFamily: FONT }}>
      <HeaderBar chapterIndex={2} chapterTitle="In-Wall Dummy Channel Wiring" />

      <div style={{ opacity: fade, textAlign: 'center', marginBottom: 36 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(99, 102, 241, 0.12)',
            color: '#a5b4fc',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          <span>ZERO BATTERIES &bull; IN-WALL DECOUPLING</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 900, color: TEXT_PRIMARY, margin: 0, letterSpacing: -1 }}>
          The In-Wall Dummy Channel Technique
        </h1>
        <p style={{ fontSize: 20, color: TEXT_MUTED, marginTop: 10 }}>
          Wiring the door sensor directly to switch input S2 of an adjacent Tinxy modular plate.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 36, maxWidth: 1600, margin: '0 auto' }}>
        {/* Wiring Diagram Schematic */}
        <div
          style={{
            backgroundColor: CARD_BG,
            border: `1px solid ${BORDER_COLOR}`,
            borderRadius: 20,
            padding: '28px 32px',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: CYAN_ACCENT }}>
              IN-WALL SWITCHBOARD CONDUIT ROUTING
            </span>
            <span
              style={{
                fontSize: 11,
                fontFamily: MONO,
                color: EMERALD_OK,
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                padding: '3px 8px',
                borderRadius: 4,
                fontWeight: 700,
              }}
            >
              CONCEALED PVC &lt;30CM PULL
            </span>
          </div>

          <div
            style={{
              backgroundColor: CARD_SURFACE,
              borderRadius: 16,
              border: `1px solid ${BORDER_COLOR}`,
              padding: 20,
              marginBottom: 14,
            }}
          >
            {/* Tinxy Module Box Representation */}
            <div
              style={{
                backgroundColor: '#0f172a',
                border: '2px solid #38bdf8',
                borderRadius: 12,
                padding: 18,
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 15, fontWeight: 800, color: TEXT_PRIMARY }}>
                  TINXY 4+1 / 2-NODE MODULE (ESP8266)
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: MONO,
                    backgroundColor: 'rgba(56, 189, 248, 0.2)',
                    color: CYAN_ACCENT,
                    padding: '3px 8px',
                    borderRadius: 4,
                  }}
                >
                  ESPHome Native Silicon
                </span>
              </div>

              {/* Terminal Pinouts */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                <div style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: TEXT_SUBTLE, fontWeight: 700 }}>L (Mains)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#f87171', marginTop: 2 }}>230V Phase</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: TEXT_SUBTLE, fontWeight: 700 }}>N (Mains)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#60a5fa', marginTop: 2 }}>Neutral Return</div>
                </div>
                <div style={{ backgroundColor: '#1e293b', padding: 10, borderRadius: 8, textAlign: 'center', border: '1px solid #10b981' }}>
                  <div style={{ fontSize: 10, color: '#10b981', fontWeight: 700 }}>L1 (Load 1)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: TEXT_PRIMARY, marginTop: 2 }}>Light + Fan</div>
                </div>
                <div
                  style={{
                    backgroundColor: 'rgba(245, 158, 11, 0.15)',
                    padding: 10,
                    borderRadius: 8,
                    textAlign: 'center',
                    border: '1px solid #f59e0b',
                  }}
                >
                  <div style={{ fontSize: 10, color: '#f59e0b', fontWeight: 700 }}>S2 (Dummy Input)</div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: '#fbbf24', marginTop: 2 }}>MC-38 Reed</div>
                </div>
              </div>

              {/* Dummy Channel Note */}
              <div
                style={{
                  marginTop: 14,
                  padding: '10px 14px',
                  backgroundColor: 'rgba(2, 6, 23, 0.6)',
                  borderRadius: 8,
                  fontSize: 12,
                  color: TEXT_MUTED,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    backgroundColor: AMBER_WARN,
                    boxShadow: `0 0 ${8 + pulse * 6}px ${AMBER_WARN}`,
                  }}
                />
                <span>
                  <strong>Dummy Channel:</strong> Relay 2 (L2) unpopulated. Input S2 decoupled on silicon to capture door events.
                </span>
              </div>
            </div>

            {/* Live Logic Analyzer / GPIO Oscilloscope Trace */}
            <div
              style={{
                marginTop: 12,
                backgroundColor: '#020617',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                borderRadius: 10,
                padding: '10px 14px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 700, color: CYAN_ACCENT }}>
                  GPIO LOGIC ANALYZER &bull; INPUT S2 (PIN 14)
                </span>
                <span
                  style={{
                    fontSize: 10,
                    fontFamily: MONO,
                    fontWeight: 800,
                    color: EMERALD_OK,
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    padding: '2px 6px',
                    borderRadius: 4,
                  }}
                >
                  INTERRUPT LATENCY &lt; 3.8ms
                </span>
              </div>

              {/* Digital Waveform */}
              <svg width="100%" height="42" viewBox="0 0 460 42">
                <line x1="0" y1="10" x2="460" y2="10" stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" />
                <line x1="0" y1="32" x2="460" y2="32" stroke="#1e293b" strokeDasharray="2 4" strokeWidth="1" />
                <text x="6" y="8" fill="#64748b" fontSize="8" fontFamily={MONO}>3.3V HIGH</text>
                <text x="6" y="30" fill="#64748b" fontSize="8" fontFamily={MONO}>0.0V LOW</text>

                {/* Digital Square Step */}
                <path
                  d="M 60 10 L 190 10 L 190 32 L 420 32"
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Transition falling edge marker */}
                <circle cx="190" cy="21" r="3.5" fill="#f59e0b" />
                <line x1="190" y1="4" x2="190" y2="38" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 2" />
                <text x="200" y="20" fill="#fbbf24" fontSize="8" fontFamily={MONO} fontWeight="700">
                  DOOR CLOSE &bull; FALLING EDGE
                </text>
                <text x="310" y="39" fill="#34d399" fontSize="8" fontFamily={MONO} fontWeight="700">
                  DEBOUNCE: 50ms WINDOW
                </text>

                {/* Signal traveling pulse */}
                <circle cx={60 + (signalPos % 130)} cy="10" r="2.5" fill="#38bdf8" />
              </svg>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontFamily: MONO, color: TEXT_SUBTLE }}>
              CONDUIT WIRE: 0.5mm² 1100V MAINS-GRADE 2-CORE
            </span>
            <span style={{ fontSize: 12, fontFamily: MONO, color: EMERALD_OK, fontWeight: 700 }}>
              STANDALONE SILICON OPERATION
            </span>
          </div>
        </div>

        {/* Benefits breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 20,
              padding: 24,
            }}
          >
            <h3 style={{ fontSize: 22, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 14px 0' }}>
              Why Decoupled In-Wall Sensing Wins
            </h3>
            <ul style={{ margin: 0, paddingLeft: 18, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <li style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.5 }}>
                <strong style={{ color: TEXT_PRIMARY }}>Zero Wireless Latency:</strong> Reed switch triggers a hardware GPIO interrupt directly on the ESP8266 chip (&lt;5ms response).
              </li>
              <li style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.5 }}>
                <strong style={{ color: TEXT_PRIMARY }}>Eliminates Extra Transmitter Hardware:</strong> No separate Zigbee/Thread battery sensor board hanging on the wall.
              </li>
              <li style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.5 }}>
                <strong style={{ color: TEXT_PRIMARY }}>Zero Battery Maintenance:</strong> Powered perpetually from mains neutral inside the switch plate.
              </li>
              <li style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.5 }}>
                <strong style={{ color: TEXT_PRIMARY }}>Standalone Autonomy:</strong> State machine evaluates on-chip even if Home Assistant or Wi-Fi router is unplugged.
              </li>
            </ul>
          </div>

          <div
            style={{
              backgroundColor: 'rgba(56, 189, 248, 0.08)',
              border: '1px solid rgba(56, 189, 248, 0.25)',
              borderRadius: 18,
              padding: 20,
            }}
          >
            <div style={{ fontSize: 13, fontWeight: 800, color: CYAN_ACCENT, marginBottom: 6 }}>
              INDIAN RESIDENTIAL COMPATIBILITY
            </div>
            <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
              Standard Indian 2-module, 4-module, or 6-module Roma-format switchboards always sit on the immediate latch side of the bathroom door frame, making the concealed conduit pull trivial.
            </p>
          </div>
        </div>
      </div>
    </Fill>
  );
};

// =========================================================================
// SCENE 3: The 4-State Machine in Action
// =========================================================================
const SceneStateMachine: React.FC = () => {
  const frame = useFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });

  // Cycle through the 4 states smoothly across this ~35s scene (1073 frames)
  const activeStep = Math.min(3, Math.floor(frame / 260));

  const states = [
    {
      step: '01',
      title: 'Entry Trigger',
      trigger: 'Door CLOSED ➔ OPEN (Light currently OFF)',
      action: 'Light turns ON immediately (<5ms)',
      timer: '60s entry timer armed',
      color: CYAN_ACCENT,
      desc: 'Threshold illuminates before occupant steps inside. Eliminates entering into darkness.',
    },
    {
      step: '02',
      title: 'Occupied Latch',
      trigger: 'Door OPEN ➔ CLOSED (Occupant inside)',
      action: 'Entry timer cancelled; Light & Fan lock ON',
      timer: 'LOCKED ON INDEFINITELY',
      color: EMERALD_OK,
      desc: 'Completely immune to shower steam or stillness in the bath. Zero false dropouts forever.',
    },
    {
      step: '03',
      title: 'Exit Trigger',
      trigger: 'Door CLOSED ➔ OPEN (Light already ON)',
      action: 'Occupant finishes and opens door to exit',
      timer: '60s vacancy countdown begins',
      color: AMBER_WARN,
      desc: 'Provides 60 seconds of gentle exit lighting and bathroom ventilation dissipation.',
    },
    {
      step: '04',
      title: 'Vacated & Auto-Off',
      trigger: '60s Timer Expires OR Door Re-closed during Exit',
      action: 'Vanity Light & Exhaust Fan turn OFF',
      timer: 'TIMER EXPIRED (IDLE)',
      color: ROSE_DANGER,
      desc: 'Resets to initial ready state. Standalone watchdog ensures zero wasted electricity.',
    },
  ];

  return (
    <Fill style={{ backgroundColor: BG_DARK, padding: '120px 80px 80px 80px', fontFamily: FONT }}>
      <HeaderBar chapterIndex={3} chapterTitle="The 4-State Presence Engine" />

      <div style={{ opacity: fade, textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: EMERALD_OK,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          <span>SILICON STATE MACHINE &bull; ESPHOME ON-CHIP</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 900, color: TEXT_PRIMARY, margin: 0, letterSpacing: -1 }}>
          Evaluating Transitions + Light State Locally
        </h1>
        <p style={{ fontSize: 20, color: TEXT_MUTED, marginTop: 10 }}>
          Four deterministic states that resolve entry, occupancy, and exit without desyncing.
        </p>
      </div>

      {/* Interactive State Transition Pipeline Ribbon */}
      <div
        style={{
          maxWidth: 1650,
          margin: '0 auto 24px auto',
          backgroundColor: CARD_BG,
          borderRadius: 14,
          border: `1px solid ${BORDER_COLOR}`,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 800, color: CYAN_ACCENT }}>
            DETERMINISTIC CYCLE:
          </span>
          {states.map((s, i) => {
            const isCurr = i === activeStep;
            return (
              <React.Fragment key={i}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    backgroundColor: isCurr ? `${s.color}22` : 'transparent',
                    border: `1px solid ${isCurr ? s.color : 'transparent'}`,
                  }}
                >
                  <span style={{ fontSize: 11, fontFamily: MONO, fontWeight: 800, color: isCurr ? s.color : TEXT_SUBTLE }}>
                    {s.step}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: isCurr ? 800 : 500, color: isCurr ? TEXT_PRIMARY : TEXT_MUTED }}>
                    {s.title}
                  </span>
                </div>
                {i < states.length - 1 && (
                  <span style={{ fontSize: 12, color: i < activeStep ? EMERALD_OK : TEXT_SUBTLE }}>&rarr;</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 11, fontFamily: MONO, color: TEXT_SUBTLE }}>DESYNC PROOF:</span>
          <span
            style={{
              fontSize: 11,
              fontFamily: MONO,
              fontWeight: 800,
              color: EMERALD_OK,
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              padding: '3px 8px',
              borderRadius: 4,
            }}
          >
            CLOSED-LOOP SELF-CORRECTING
          </span>
        </div>
      </div>

      {/* 4 State Machine Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 24,
          maxWidth: 1650,
          margin: '0 auto',
        }}
      >
        {states.map((st, idx) => {
          const isActive = idx === activeStep;
          return (
            <div
              key={idx}
              style={{
                backgroundColor: isActive ? CARD_SURFACE : CARD_BG,
                border: `2px solid ${isActive ? st.color : BORDER_COLOR}`,
                borderRadius: 20,
                padding: 28,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: isActive ? `0 0 30px rgba(${idx === 0 ? '56,189,248' : idx === 1 ? '16,185,129' : idx === 2 ? '245,158,11' : '244,63,94'}, 0.25)` : 'none',
                transform: isActive ? 'translateY(-8px) scale(1.02)' : 'translateY(0) scale(1)',
                transition: 'all 0.3s ease',
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 13, fontFamily: MONO, fontWeight: 800, color: st.color }}>
                    STATE {st.step}
                  </span>
                  {isActive && (
                    <span
                      style={{
                        backgroundColor: st.color,
                        color: '#020617',
                        fontSize: 11,
                        fontFamily: MONO,
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}
                    >
                      ACTIVE NOW
                    </span>
                  )}
                </div>

                <h3 style={{ fontSize: 24, fontWeight: 800, color: TEXT_PRIMARY, margin: '0 0 12px 0' }}>
                  {st.title}
                </h3>

                <div
                  style={{
                    backgroundColor: 'rgba(2, 6, 23, 0.6)',
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 14,
                    border: `1px solid ${BORDER_COLOR}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SUBTLE, marginBottom: 4 }}>
                    TRANSITION EVENT
                  </div>
                  <div style={{ fontSize: 13, fontFamily: MONO, fontWeight: 700, color: st.color }}>
                    {st.trigger}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor: 'rgba(2, 6, 23, 0.6)',
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 14,
                    border: `1px solid ${BORDER_COLOR}`,
                  }}
                >
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEXT_SUBTLE, marginBottom: 4 }}>
                    SILICON ACTION
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: TEXT_PRIMARY }}>
                    {st.action}
                  </div>
                </div>

                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.5, margin: 0 }}>
                  {st.desc}
                </p>
              </div>

              <div
                style={{
                  marginTop: 20,
                  padding: '10px 14px',
                  backgroundColor: CARD_BG,
                  borderRadius: 8,
                  border: `1px solid ${BORDER_COLOR}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: 11, color: TEXT_SUBTLE, fontWeight: 700 }}>STATE CLOCK</span>
                <span style={{ fontSize: 12, fontFamily: MONO, fontWeight: 800, color: st.color }}>
                  {st.timer}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </Fill>
  );
};

// =========================================================================
// SCENE 4: 100% Local-First & Fail-Safe Architecture
// =========================================================================
const SceneLocalFirst: React.FC = () => {
  const frame = useFrame();
  const fade = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: 'clamp' });
  const scale = spring({ frame, fps: FPS, config: { damping: 14 } });

  const pillars = [
    {
      title: '100% Local Silicon',
      badge: 'ZERO CLOUD',
      color: EMERALD_OK,
      desc: 'Microcontroller executes conditional logic and timer tracking standalone. Unplug the internet fiber, stop Home Assistant — bathroom works 100% identically.',
    },
    {
      title: 'Wall Switch Always Wins',
      badge: 'MECHANICAL BYPASS',
      color: CYAN_ACCENT,
      desc: 'Preserves standard physical modular rocker switches. Anyone in the household can flip the physical switch to manually override automation at any moment.',
    },
    {
      title: '45-Min Safety Watchdog',
      badge: 'FAIL-SAFE WATCHDOG',
      color: AMBER_WARN,
      desc: 'If the door is inadvertently closed while the bathroom is vacant, an internal watchdog automatically kills loads after 45 minutes to prevent wasted electricity.',
    },
    {
      title: 'Zero Battery Waste',
      badge: 'PERPETUAL POWER',
      color: INDIGO_TAG,
      desc: 'Mains-powered in-wall module feeds the dry contact. No dead coin cells, no un-notified battery drain, no sensor pairing drops ever.',
    },
  ];

  return (
    <Fill style={{ backgroundColor: BG_DARK, padding: '120px 80px 80px 80px', fontFamily: FONT }}>
      <HeaderBar chapterIndex={4} chapterTitle="100% Local-First & Fail-Safe Architecture" />

      <div style={{ opacity: fade, textAlign: 'center', marginBottom: 28 }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            backgroundColor: 'rgba(16, 185, 129, 0.12)',
            color: EMERALD_OK,
            border: '1px solid rgba(16, 185, 129, 0.3)',
            padding: '6px 18px',
            borderRadius: 999,
            fontSize: 14,
            fontWeight: 700,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 14,
          }}
        >
          <span>ARCHITECTURAL GUARANTEES</span>
        </div>
        <h1 style={{ fontSize: 52, fontWeight: 900, color: TEXT_PRIMARY, margin: 0, letterSpacing: -1 }}>
          The Apartment Thread Standard
        </h1>
        <p style={{ fontSize: 20, color: TEXT_MUTED, marginTop: 10 }}>
          High-reliability residential automation retrofitted into standard Indian modular switchboards.
        </p>
      </div>

      {/* Network Topology HUD */}
      <div
        style={{
          maxWidth: 1450,
          margin: '0 auto 24px auto',
          backgroundColor: CARD_BG,
          borderRadius: 14,
          border: `1px solid ${BORDER_COLOR}`,
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: 0.65 }}>
            <span style={{ fontSize: 12, fontFamily: MONO, color: '#f43f5e', fontWeight: 800 }}>WAN FIBER</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: '#f87171', backgroundColor: 'rgba(244, 63, 94, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
              UNPLUGGED ✗
            </span>
          </div>

          <span style={{ color: TEXT_SUBTLE, fontSize: 12 }}>&mdash;</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontFamily: MONO, color: TEXT_MUTED, fontWeight: 700 }}>HOME ROUTER</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: TEXT_MUTED, backgroundColor: CARD_SURFACE, padding: '2px 6px', borderRadius: 4 }}>
              LAN ONLY
            </span>
          </div>

          <span style={{ color: TEXT_SUBTLE, fontSize: 12 }}>&mdash;</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontFamily: MONO, color: CYAN_ACCENT, fontWeight: 700 }}>RADXA SERVER</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: CYAN_ACCENT, backgroundColor: 'rgba(56, 189, 248, 0.15)', padding: '2px 6px', borderRadius: 4 }}>
              HA OPTIONAL
            </span>
          </div>

          <span style={{ color: EMERALD_OK, fontSize: 12 }}>&rarr;</span>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ fontSize: 12, fontFamily: MONO, color: EMERALD_OK, fontWeight: 900 }}>TINXY 4+1 + MC-38</span>
            <span style={{ fontSize: 10, fontFamily: MONO, color: EMERALD_OK, backgroundColor: 'rgba(16, 185, 129, 0.2)', padding: '2px 8px', borderRadius: 4, border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              STANDALONE SILICON ✓
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: EMERALD_OK, boxShadow: '0 0 10px #10b981' }} />
          <span style={{ fontSize: 11, fontFamily: MONO, color: EMERALD_OK, fontWeight: 800 }}>
            ZERO CLOUD &bull; ZERO DEGRADATION
          </span>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 28,
          maxWidth: 1450,
          margin: '0 auto',
        }}
      >
        {pillars.map((pil, idx) => (
          <div
            key={idx}
            style={{
              transform: `scale(${scale})`,
              backgroundColor: CARD_BG,
              border: `1px solid ${BORDER_COLOR}`,
              borderRadius: 20,
              padding: 32,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                bottom: 0,
                width: 5,
                backgroundColor: pil.color,
              }}
            />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <span style={{ fontSize: 26, fontWeight: 800, color: TEXT_PRIMARY }}>
                  {pil.title}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    fontFamily: MONO,
                    fontWeight: 800,
                    backgroundColor: `${pil.color}22`,
                    color: pil.color,
                    padding: '4px 12px',
                    borderRadius: 6,
                    border: `1px solid ${pil.color}55`,
                  }}
                >
                  {pil.badge}
                </span>
              </div>
              <p style={{ fontSize: 17, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>
                {pil.desc}
              </p>
            </div>

            <div
              style={{
                marginTop: 24,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                fontSize: 13,
                fontFamily: MONO,
                color: pil.color,
                fontWeight: 700,
              }}
            >
              <span>VERIFIED: BA-01 BENCH SPECIFICATION</span>
            </div>
          </div>
        ))}
      </div>
    </Fill>
  );
};

// =========================================================================
// MAIN COMPOSITION
// =========================================================================
export const BathroomPattern: React.FC = () => {
  const currentFrame = useFrame();

  return (
    <CanvasElement id="BathroomPattern">
      <Fill style={{ backgroundColor: BG_DARK, position: 'relative' }}>
        {/* Silence Padding audio */}
        <Audio
          src={staticFile(`${VIDEO_ID}/vo/pad.mp3`)}
          startFrom={0}
          endAt={TOTAL_FRAMES}
          volume={0}
        />

        {/* Voiceover Tracks */}
        {VO_START.map((start, i) => (
          <Sequence key={i} from={start} durationInFrames={VO_LEN[i]}>
            <Audio src={staticFile(VO(i))} startFrom={0} endAt={VO_LEN[i]} volume={1} />
          </Sequence>
        ))}

        {/* Visual Scene Sequence */}
        <Series>
          <Series.Sequence durationInFrames={VO_LEN[0]}>
            <SceneProblem />
          </Series.Sequence>
          <Series.Sequence durationInFrames={VO_LEN[1]}>
            <SceneSensor />
          </Series.Sequence>
          <Series.Sequence durationInFrames={VO_LEN[2]}>
            <SceneWiring />
          </Series.Sequence>
          <Series.Sequence durationInFrames={VO_LEN[3]}>
            <SceneStateMachine />
          </Series.Sequence>
          <Series.Sequence durationInFrames={VO_LEN[4]}>
            <SceneLocalFirst />
          </Series.Sequence>
        </Series>

        {/* Live Closed-Caption Subtitle Banner */}
        <SubtitleBanner currentFrame={currentFrame} />

        {/* Persistent Bottom Progress Timeline */}
        <BottomTimeline currentFrame={currentFrame} />
      </Fill>
    </CanvasElement>
  );
};

// =========================================================================
// STANDALONE SUB-COMPOSITIONS (PER-SCENE PREVIEWS)
// =========================================================================
export const BathroomScene1Problem: React.FC = () => {
  const frame = useFrame();
  return (
    <CanvasElement id="BathroomScene1Problem">
      <Fill style={{ backgroundColor: BG_DARK, position: 'relative' }}>
        <Audio src={staticFile(VO(0))} volume={1} />
        <SceneProblem />
        <SubtitleBanner currentFrame={VO_START[0] + frame} />
      </Fill>
    </CanvasElement>
  );
};

export const BathroomScene2Sensor: React.FC = () => {
  const frame = useFrame();
  return (
    <CanvasElement id="BathroomScene2Sensor">
      <Fill style={{ backgroundColor: BG_DARK, position: 'relative' }}>
        <Audio src={staticFile(VO(1))} volume={1} />
        <SceneSensor />
        <SubtitleBanner currentFrame={VO_START[1] + frame} />
      </Fill>
    </CanvasElement>
  );
};

export const BathroomScene3Wiring: React.FC = () => {
  const frame = useFrame();
  return (
    <CanvasElement id="BathroomScene3Wiring">
      <Fill style={{ backgroundColor: BG_DARK, position: 'relative' }}>
        <Audio src={staticFile(VO(2))} volume={1} />
        <SceneWiring />
        <SubtitleBanner currentFrame={VO_START[2] + frame} />
      </Fill>
    </CanvasElement>
  );
};

export const BathroomScene4StateMachine: React.FC = () => {
  const frame = useFrame();
  return (
    <CanvasElement id="BathroomScene4StateMachine">
      <Fill style={{ backgroundColor: BG_DARK, position: 'relative' }}>
        <Audio src={staticFile(VO(3))} volume={1} />
        <SceneStateMachine />
        <SubtitleBanner currentFrame={VO_START[3] + frame} />
      </Fill>
    </CanvasElement>
  );
};

export const BathroomScene5LocalFirst: React.FC = () => {
  const frame = useFrame();
  return (
    <CanvasElement id="BathroomScene5LocalFirst">
      <Fill style={{ backgroundColor: BG_DARK, position: 'relative' }}>
        <Audio src={staticFile(VO(4))} volume={1} />
        <SceneLocalFirst />
        <SubtitleBanner currentFrame={VO_START[4] + frame} />
      </Fill>
    </CanvasElement>
  );
};
