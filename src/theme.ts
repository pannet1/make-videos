// Central design tokens — cool Tamas → warm Sattva journey.
export const FPS = 30;
export const W = 1920;
export const H = 1080;

export const COLORS = {
  void: '#05070F',
  deepNavy: '#0A0E1A',
  indigo: '#1A2350',
  flameBlue: '#38BDF8',
  flameDeep: '#0EA5E9',
  flameCore: '#E0F2FE',
  gold: '#EAB308',
  goldSoft: '#FDE68A',
  amber: '#B45309',
  cream: '#FFF7E6',
  ember: '#F97316',
  deepRed: '#7F1D1D',
  textDim: 'rgba(255,247,230,0.62)',
  textMain: '#FFF7E6',
} as const;

export const FONTS = {
  display: '"Cormorant Garamond", Georgia, serif',
  body: '"Inter", system-ui, sans-serif',
} as const;

// Segment durations in seconds (matches brief: 10:30 total)
export const SEGMENTS = {
  hook: { seconds: 90, label: 'Hook & Introduction', phase: 'TAMAS → AWAKENING' },
  foundation: { seconds: 90, label: 'Mahalaya Amavasya', phase: 'CLEAR THE PAST' },
  phase1: { seconds: 150, label: 'Days 1–3 · Knowledge & Energy', phase: 'TAMASIC CHAKRAS' },
  phase2: { seconds: 120, label: 'Days 4–5 · Purpose & Creation', phase: 'RAJASIC CHAKRAS' },
  phase3: { seconds: 120, label: 'Days 6–9 · Action & Mastery', phase: 'SATTVIK CHAKRAS' },
  outro: { seconds: 60, label: 'Outro & Call to Action', phase: 'RECEIVE PERFECTION' },
} as const;

export const frames = (seconds: number): number => Math.round(seconds * FPS);

export const TOTAL_FRAMES = Object.values(SEGMENTS).reduce(
  (acc, s) => acc + frames(s.seconds),
  0,
); // 18900 @30fps
