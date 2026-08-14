import React from 'react';
import {
  Audio,
  CanvasElement,
  Fill,
  Img,
  Sequence,
  Series,
  interpolate,
  spring,
  useCompositionConfig,
  useFrame,
  staticFile,
} from '@rendiv/core';
import {
  BLUE_400,
  BLUE_500,
  BLUE_600,
  GREEN_400,
  GREEN_600,
  RED_400,
  SLATE_300,
  SLATE_400,
  SLATE_700,
  SLATE_800,
  SLATE_900,
  SLATE_950,
  WHITE,
  YELLOW_400,
  Brand,
  NavBar,
  SectionHeader,
  StatTile,
  fmt,
  useFadeIn,
} from '../../shared/theme';

const VIDEO_ID = 'auction-explainer';
const VO = (n: number, ext = 'mp3'): string =>
  `${VIDEO_ID}/vo/${String(n).padStart(2, '0')}.${ext}`;
const ASSET = (p: string): string => `${VIDEO_ID}/assets/${p}`;
const VO_START = [0, 466, 1021, 1502, 2229, 2976, 3558, 4111];
const VO_LEN = [466, 555, 481, 727, 747, 582, 553, 399];
const FONT =
  'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", sans-serif';

const IMAGES = ['auction_5/1.jpeg', 'auction_5/2.jpeg', 'auction_5/3.jpeg', 'auction_5/4.jpeg'];

const AuctionCard: React.FC<{ frame: number }> = ({ frame }) => {
  const active = Math.floor(frame / 40) % IMAGES.length;
  const altOpacity = interpolate(frame % 40, [0, 20], [0, 1], {
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        width: 680,
        backgroundColor: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(30,41,59,0.5)',
        padding: 28,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontFamily: FONT,
          fontWeight: 800,
          fontSize: 34,
          color: WHITE,
        }}
      >
        Dell Latitude 7420
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 15,
          fontWeight: 600,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: SLATE_400,
        }}
      >
        Current Auction · Ends in 2h 14m
      </div>

      <div
        style={{
          marginTop: 20,
          height: 360,
          borderRadius: 12,
          border: '1px solid #334155',
          backgroundColor: 'rgba(30,41,59,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        <Img
          key={active}
          src={staticFile(ASSET(IMAGES[active]))}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: 12,
            opacity: altOpacity,
          }}
        />
      </div>

      <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
        {IMAGES.map((img, i) => (
          <div
            key={img}
            style={{
              width: 84,
              height: 64,
              borderRadius: 10,
              border:
                i === active
                  ? `3px solid ${BLUE_500}`
                  : '1px solid #334155',
              overflow: 'hidden',
            }}
          >
            <Img
              src={staticFile(ASSET(img))}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 14, marginTop: 20 }}>
        <StatTile
          label="Base Price"
          value={fmt(21000)}
          color={GREEN_400}
        />
        <StatTile
          label="Highest Bid"
          value={fmt(21500)}
          color={YELLOW_400}
        />
        <StatTile label="Total Bids" value="8" color={BLUE_400} />
      </div>
    </div>
  );
};

const Opening: React.FC = () => {
  const frame = useFrame();
  const { fps } = useCompositionConfig();
  const fade = useFadeIn(30);
  const brandScale = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 140, mass: 0.8 },
  });
  const titleOpacity = interpolate(frame, [70, 110], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const titleY = interpolate(frame, [70, 120], [40, 0], {
    easing: undefined,
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const hookOpacity = interpolate(frame, [140, 180], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const pulse = interpolate(frame, [0, 120, 240, 360], [1, 1, 1, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NavBar opacity={fade} />
      <div
        style={{
          opacity: fade,
          transform: `scale(${0.6 + brandScale * 0.4})`,
        }}
      >
        <Brand size={120} />
      </div>
      <div
        style={{
          marginTop: 40,
          fontSize: 26,
          fontWeight: 700,
          letterSpacing: 6,
          textTransform: 'uppercase',
          color: SLATE_400,
          opacity: titleOpacity,
        }}
      >
        Online Auctions
      </div>
      <div
        style={{
          marginTop: 30,
          fontSize: 78,
          fontWeight: 900,
          color: WHITE,
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
          textAlign: 'center',
          maxWidth: 1400,
          letterSpacing: -1,
        }}
      >
        How Auctions Work
        <span style={{ color: BLUE_500 }}>:</span> A Buyer&apos;s Guide
      </div>
      <div
        style={{
          marginTop: 34,
          fontSize: 34,
          color: SLATE_300,
          opacity: hookOpacity,
          textAlign: 'center',
          maxWidth: 1300,
          fontWeight: 500,
        }}
      >
        Want that laptop? Here&apos;s how to win it on EcomSense auctions.
      </div>
    </Fill>
  );
};

const WhatIsAuction: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  const textY = interpolate(frame, [0, 18], [24, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardX = interpolate(frame, [15, 45], [60, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const cardFade = interpolate(frame, [15, 45], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const bidTick = interpolate(frame, [0, 450], [21000, 23200], {
    extrapolateRight: 'clamp',
  });
  const bidsTick = Math.round(interpolate(frame, [0, 450], [8, 41], {
    extrapolateRight: 'clamp',
  }));

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        alignItems: 'center',
        padding: '0 100px',
        gap: 90,
        boxSizing: 'border-box',
      }}
    >
      <NavBar />
      <div
        style={{
          flex: 1,
          opacity: fade,
          transform: `translateY(${textY}px)`,
        }}
      >
        <SectionHeader title="What is an Auction?" />
        <div
          style={{
            marginTop: 34,
            fontSize: 30,
            color: SLATE_300,
            lineHeight: 1.6,
            maxWidth: 720,
            fontWeight: 500,
          }}
        >
          A method of buying and selling goods through competitive bidding. On
          EcomSense it&apos;s a{' '}
          <span style={{ color: WHITE, fontWeight: 800 }}>forward auction</span>{' '}
          — the highest bidder at closing wins.
        </div>
        <div
          style={{
            marginTop: 34,
            padding: '20px 26px',
            borderRadius: 14,
            backgroundColor: 'rgba(59,130,246,0.12)',
            border: `1px solid ${BLUE_500}`,
            display: 'inline-block',
          }}
        >
          <span
            style={{
              color: BLUE_400,
              fontSize: 30,
              fontWeight: 800,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {fmt(bidTick)}
          </span>
          <span
            style={{
              color: SLATE_400,
              fontSize: 24,
              marginLeft: 16,
              fontWeight: 600,
            }}
          >
            current highest bid · {bidsTick} bids
          </span>
        </div>
      </div>
      <div
        style={{
          opacity: cardFade,
          transform: `translateX(${cardX}px)`,
        }}
      >
        <AuctionCard frame={frame} />
      </div>
    </Fill>
  );
};

const PrepItem: React.FC<{
  index: number;
  text: string;
  frame: number;
}> = ({ index, text, frame }) => {
  const start = 20 + index * 26;
  const fade = interpolate(frame, [start, start + 16], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const x = interpolate(frame, [start, start + 16], [-30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const check = interpolate(frame, [start + 8, start + 20], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 22,
        marginBottom: 30,
        opacity: fade,
        transform: `translateX(${x}px)`,
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          backgroundColor: 'rgba(74,222,128,0.15)',
          border: `2px solid ${GREEN_400}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 26,
          fontWeight: 900,
          color: GREEN_400,
        }}
      >
        {check >= 1 ? '\u2713' : ''}
      </div>
      <div style={{ fontSize: 30, color: WHITE, fontWeight: 600 }}>{text}</div>
    </div>
  );
};

const Preparation: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  const boxRise = interpolate(frame, [30, 55], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        alignItems: 'center',
        padding: '0 100px',
        gap: 90,
        boxSizing: 'border-box',
      }}
    >
      <NavBar />
      <div style={{ flex: 1.15, opacity: fade }}>
        <SectionHeader
          title="Get Ready"
          subtitle="Auction Preparation"
        />
        <div style={{ marginTop: 50 }}>
          <PrepItem
            index={0}
            frame={frame}
            text="Browse the current auction and study the product photos"
          />
          <PrepItem
            index={1}
            frame={frame}
            text="Set your budget and maximum bid in your head"
          />
          <PrepItem
            index={2}
            frame={frame}
            text="Register an account and fund your wallet"
          />
        </div>
      </div>
      <div
        style={{
          flex: 1,
          opacity: fade,
          transform: `translateY(${boxRise}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(24px)',
            borderRadius: 16,
            border: '1px solid rgba(30,41,59,0.5)',
            padding: 30,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: SLATE_400,
              marginBottom: 18,
            }}
          >
            Dell Latitude 7420
          </div>
          <div style={{ display: 'flex', gap: 14 }}>
            <StatTile
              label="Base Price"
              value={fmt(21000)}
              color={GREEN_400}
            />
            <StatTile
              label="Your Max"
              value={fmt(25000)}
              color={BLUE_400}
            />
            <StatTile label="Wallet" value="Rs. 0" color={SLATE_300} />
          </div>
          <div
            style={{
              marginTop: 22,
              padding: '16px 20px',
              borderRadius: 12,
              backgroundColor: 'rgba(74,222,128,0.1)',
              border: `1px solid rgba(74,222,128,0.4)`,
              fontSize: 22,
              color: GREEN_400,
              fontWeight: 700,
            }}
          >
            Keep wallet balance ready to cover your bid
          </div>
        </div>
      </div>
    </Fill>
  );
};

const Wallet: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  const cardRise = interpolate(frame, [20, 45], [40, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const topUpFade = interpolate(frame, [90, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const withdrawFade = interpolate(frame, [150, 190], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const noteFade = interpolate(frame, [220, 260], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const randomFade = interpolate(frame, [420, 470], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const balPulse = 1 + 0.02 * Math.sin(frame / 11);

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        alignItems: 'center',
        padding: '0 100px',
        gap: 90,
        boxSizing: 'border-box',
      }}
    >
      <NavBar />
      <div style={{ flex: 1.15, opacity: fade }}>
        <SectionHeader
          title="Your Wallet"
          subtitle="Fund anytime · Withdraw anytime"
        />
        <div
          style={{
            marginTop: 34,
            fontSize: 30,
            color: SLATE_300,
            lineHeight: 1.6,
            maxWidth: 760,
            fontWeight: 500,
          }}
        >
          Top up through{' '}
          <span style={{ color: WHITE, fontWeight: 800 }}>UPI</span> anytime —
          no expiry, no minimum, no lock-in. Withdraw your balance whenever you
          like by requesting a withdrawal. Funds are never trapped.
        </div>
        <div
          style={{
            marginTop: 36,
            padding: '22px 28px',
            borderRadius: 14,
            backgroundColor: 'rgba(250,204,21,0.1)',
            border: `1px solid ${YELLOW_400}`,
            fontSize: 26,
            color: YELLOW_400,
            fontWeight: 700,
            maxWidth: 780,
            opacity: noteFade,
            lineHeight: 1.5,
          }}
        >
          Your balance only matters when the auction is resolved.
        </div>
        <div
          style={{
            marginTop: 26,
            padding: '20px 26px',
            borderRadius: 14,
            backgroundColor: 'rgba(96,165,250,0.1)',
            border: `1px solid ${BLUE_400}`,
            fontSize: 24,
            color: BLUE_400,
            fontWeight: 600,
            maxWidth: 800,
            opacity: randomFade,
            lineHeight: 1.5,
          }}
        >
          Keep enough balance — if the highest bidder can&apos;t cover their
          bid at closing, a random participant with sufficient balance wins
          instead.
        </div>
      </div>
      <div
        style={{
          flex: 1,
          opacity: fade,
          transform: `translateY(${cardRise}px)`,
        }}
      >
        <div
          style={{
            backgroundColor: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(24px)',
            borderRadius: 16,
            border: '1px solid rgba(30,41,59,0.5)',
            padding: 32,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: SLATE_400,
            }}
          >
            Wallet Balance
          </div>
          <div
            style={{
              marginTop: 10,
              fontSize: 64,
              fontWeight: 900,
              color: WHITE,
              fontVariantNumeric: 'tabular-nums',
              transform: `scale(${balPulse})`,
              transformOrigin: 'left center',
            }}
          >
            {fmt(5000)}
          </div>
          <div
            style={{
              marginTop: 28,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div
              style={{
                padding: '20px 26px',
                borderRadius: 12,
                backgroundColor: GREEN_600,
                opacity: topUpFade,
              }}
            >
              <span style={{ color: WHITE, fontSize: 28, fontWeight: 800 }}>
                Add Funds via UPI
              </span>
            </div>
            <div
              style={{
                padding: '20px 26px',
                borderRadius: 12,
                backgroundColor: SLATE_800,
                border: `1px solid ${SLATE_700}`,
                opacity: withdrawFade,
              }}
            >
              <span style={{ color: SLATE_300, fontSize: 28, fontWeight: 800 }}>
                Request Withdrawal
              </span>
            </div>
          </div>
          <div
            style={{
              marginTop: 26,
              padding: '16px 20px',
              borderRadius: 12,
              backgroundColor: 'rgba(74,222,128,0.1)',
              border: `1px solid rgba(74,222,128,0.4)`,
              fontSize: 22,
              color: GREEN_400,
              fontWeight: 700,
            }}
          >
            No lock-in · no minimum · funds never trapped
          </div>
        </div>
      </div>
    </Fill>
  );
};

const During: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  const bidTick = interpolate(frame, [0, 900], [21500, 26400], {
    extrapolateRight: 'clamp',
  });
  const bidsTick = Math.round(
    interpolate(frame, [0, 900], [8, 57], { extrapolateRight: 'clamp' }),
  );
  const ruleFade = interpolate(frame, [90, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const btnFade = interpolate(frame, [160, 200], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const btnPulse = 1 + 0.04 * Math.sin(frame / 9);
  const endCount = Math.max(0, 134 - Math.floor(frame / 7));

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        alignItems: 'center',
        padding: '0 100px',
        gap: 80,
        boxSizing: 'border-box',
      }}
    >
      <NavBar />
      <div style={{ flex: 1.2, opacity: fade }}>
        <SectionHeader title="During the Auction" />
        <div
          style={{
            marginTop: 40,
            fontSize: 30,
            color: SLATE_300,
            fontWeight: 500,
            maxWidth: 780,
          }}
        >
          Click the blue{' '}
          <span style={{ color: WHITE, fontWeight: 800 }}>Place Bid</span>{' '}
          button on the auction card. The auction ends on its expiry date —
          whoever holds the highest bid at close wins.
        </div>
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            gap: 20,
          }}
        >
          <div
            style={{
              padding: '24px 34px',
              borderRadius: 12,
              backgroundColor: BLUE_600,
              boxShadow: '0 12px 34px rgba(37,99,235,0.35)',
              transform: `scale(${btnPulse})`,
              opacity: btnFade,
            }}
          >
            <span
              style={{
                color: WHITE,
                fontSize: 34,
                fontWeight: 800,
                letterSpacing: 0.5,
              }}
            >
              Place Bid
            </span>
          </div>
          <div
            style={{
              padding: '24px 34px',
              borderRadius: 12,
              backgroundColor: GREEN_600,
              transform: `scale(${btnPulse})`,
              opacity: btnFade,
            }}
          >
            <span
              style={{
                color: WHITE,
                fontSize: 34,
                fontWeight: 800,
              }}
            >
              Pay via UPI
            </span>
          </div>
        </div>
        <div
          style={{
            marginTop: 40,
            padding: '22px 28px',
            borderRadius: 12,
            backgroundColor: 'rgba(250,204,21,0.1)',
            border: `1px solid ${YELLOW_400}`,
            fontSize: 26,
            color: YELLOW_400,
            fontWeight: 700,
            maxWidth: 760,
            opacity: ruleFade,
          }}
        >
          Your bid must be above the highest bid AND a multiple of Rs. 100
        </div>
      </div>
      <div style={{ flex: 1, opacity: fade }}>
        <div
          style={{
            backgroundColor: 'rgba(15,23,42,0.5)',
            backdropFilter: 'blur(24px)',
            borderRadius: 16,
            border: '1px solid rgba(30,41,59,0.5)',
            padding: 30,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: SLATE_400,
              marginBottom: 18,
            }}
          >
            Online tracking · updates in real time
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <StatTile
              label="Highest Bid"
              value={fmt(bidTick)}
              color={YELLOW_400}
            />
            <StatTile
              label="Total Bids"
              value={String(bidsTick)}
              color={BLUE_400}
            />
          </div>
          <div
            style={{
              marginTop: 22,
              padding: '16px 20px',
              borderRadius: 12,
              backgroundColor: SLATE_800,
              fontSize: 22,
              color: SLATE_300,
              fontWeight: 700,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            Ends in <span style={{ color: YELLOW_400 }}>{endCount} min</span> —
            highest bid at close wins
          </div>
        </div>
      </div>
    </Fill>
  );
};

const FlowStep: React.FC<{
  icon: string;
  label: string;
  frame: number;
  start: number;
}> = ({ icon, label, frame, start }) => {
  const fade = interpolate(frame, [start, start + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const scale = interpolate(frame, [start, start + 18], [0.8, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        flex: 1,
        textAlign: 'center',
        opacity: fade,
        transform: `scale(${scale})`,
      }}
    >
      <div
        style={{
          width: 96,
          height: 96,
          margin: '0 auto',
          borderRadius: 24,
          backgroundColor: 'rgba(96,165,250,0.12)',
          border: `2px solid ${BLUE_400}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 44,
          color: BLUE_400,
          fontWeight: 900,
        }}
      >
        {icon}
      </div>
      <div
        style={{
          marginTop: 18,
          fontSize: 24,
          color: WHITE,
          fontWeight: 700,
        }}
      >
        {label}
      </div>
    </div>
  );
};

const AfterWinning: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  const due = 21500 - 5000;
  const flowFade = interpolate(frame, [90, 130], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const lineWidth = interpolate(frame, [120, 300], [0, 100], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NavBar />
      <div style={{ opacity: fade, textAlign: 'center' }}>
        <SectionHeader
          title="You Won!"
          subtitle="After Winning an Auction"
        />
      </div>
      <div
        style={{
          marginTop: 36,
          padding: '26px 40px',
          borderRadius: 16,
          backgroundColor: 'rgba(250,204,21,0.1)',
          border: `1px solid ${YELLOW_400}`,
          fontSize: 34,
          fontWeight: 800,
          color: YELLOW_400,
          opacity: fade,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        Winning bid {fmt(21500)} - wallet balance {fmt(5000)} ={' '}
        {fmt(due)} due
      </div>
      <div
        style={{
          marginTop: 30,
          padding: '20px 32px',
          borderRadius: 14,
          backgroundColor: 'rgba(248,113,113,0.08)',
          border: `1px solid ${RED_400}`,
          fontSize: 26,
          fontWeight: 700,
          color: RED_400,
          opacity: fade,
          maxWidth: 1500,
          textAlign: 'center',
          lineHeight: 1.5,
        }}
      >
        Pay the amount due via UPI before the expiry — if your wallet can&apos;t
        cover the bid at closing, a random user is selected instead.
      </div>
      <div
        style={{
          marginTop: 60,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 40,
          opacity: flowFade,
          width: 1500,
          justifyContent: 'space-between',
        }}
      >
        <div
          style={{
            position: 'absolute',
            alignSelf: 'center',
            height: 6,
            left: 260,
            right: 260,
            top: '58%',
            backgroundColor: SLATE_800,
            borderRadius: 3,
          }}
        >
          <div
            style={{
              width: `${lineWidth}%`,
              height: 6,
              backgroundColor: BLUE_400,
              borderRadius: 3,
            }}
          />
        </div>
        <FlowStep icon={'\u263E'} label="Scan UPI QR" frame={frame} start={110} />
        <FlowStep icon={'\u20B9'} label="Pay amount due" frame={frame} start={160} />
        <FlowStep
          icon={'\u2191'}
          label="Upload proof"
          frame={frame}
          start={210}
        />
        <FlowStep icon={'\u2713'} label="Verified" frame={frame} start={260} />
      </div>
      <div
        style={{
          marginTop: 60,
          padding: '22px 34px',
          borderRadius: 12,
          backgroundColor: GREEN_600,
          opacity: flowFade,
        }}
      >
        <span style={{ color: WHITE, fontSize: 30, fontWeight: 800 }}>
          Winning and payment confirmed on your auction card
        </span>
      </div>
    </Fill>
  );
};

const TipCard: React.FC<{
  num: string;
  text: string;
  frame: number;
  start: number;
}> = ({ num, text, frame, start }) => {
  const fade = interpolate(frame, [start, start + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const y = interpolate(frame, [start, start + 18], [30, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return (
    <div
      style={{
        flex: 1,
        backgroundColor: 'rgba(15,23,42,0.5)',
        backdropFilter: 'blur(24px)',
        borderRadius: 16,
        border: '1px solid rgba(30,41,59,0.5)',
        padding: 30,
        opacity: fade,
        transform: `translateY(${y}px)`,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          fontSize: 13,
          fontWeight: 800,
          letterSpacing: 2,
          color: BLUE_400,
          marginBottom: 16,
        }}
      >
        TIP {num}
      </div>
      <div style={{ fontSize: 26, color: WHITE, fontWeight: 700, lineHeight: 1.4 }}>
        {text}
      </div>
    </div>
  );
};

const Tips: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '0 100px',
        boxSizing: 'border-box',
      }}
    >
      <NavBar />
      <div style={{ opacity: fade }}>
        <SectionHeader title="Tips for Success" />
      </div>
      <div style={{ display: 'flex', gap: 26, marginTop: 56 }}>
        <TipCard
          num="01"
          text="Start with a smaller auction to gain experience"
          frame={frame}
          start={30}
        />
        <TipCard
          num="02"
          text="Set a max and don't get caught in bidding wars"
          frame={frame}
          start={55}
        />
        <TipCard
          num="03"
          text="Keep enough wallet balance to cover your bid"
          frame={frame}
          start={80}
        />
        <TipCard
          num="04"
          text="Bid in clean multiples of Rs. 100"
          frame={frame}
          start={105}
        />
      </div>
    </Fill>
  );
};

const Closing: React.FC = () => {
  const frame = useFrame();
  const fade = useFadeIn();
  const chips = ['Browse', 'Bid', 'Win', 'Pay via UPI'];
  const ctaFade = interpolate(frame, [200, 250], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  const wordmarkScale = interpolate(frame, [240, 290], [0.85, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <Fill
      style={{
        backgroundColor: SLATE_950,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <NavBar />
      <div style={{ opacity: fade, textAlign: 'center' }}>
        <SectionHeader title="Ready to Bid?" subtitle="Browse · Bid · Win · Pay" />
      </div>
      <div style={{ display: 'flex', gap: 22, marginTop: 50 }}>
        {chips.map((c, i) => {
          const start = 60 + i * 25;
          const op = interpolate(frame, [start, start + 16], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          const y = interpolate(frame, [start, start + 16], [24, 0], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          });
          return (
            <div
              key={c}
              style={{
                padding: '20px 34px',
                borderRadius: 12,
                backgroundColor: SLATE_800,
                fontSize: 28,
                color: WHITE,
                fontWeight: 800,
                opacity: op,
                transform: `translateY(${y}px)`,
              }}
            >
              {c}
            </div>
          );
        })}
      </div>
      <div
        style={{
          marginTop: 50,
          opacity: ctaFade,
          textAlign: 'center',
        }}
      >
        <div
          style={{
            fontSize: 34,
            color: SLATE_300,
            fontWeight: 600,
          }}
        >
          The current auction is online — go check it out!
        </div>
        <div
          style={{
            marginTop: 30,
            display: 'inline-block',
            padding: '22px 48px',
            borderRadius: 12,
            backgroundColor: BLUE_600,
          }}
        >
          <span style={{ color: WHITE, fontSize: 32, fontWeight: 800 }}>
            ecomsense.in/auctions
          </span>
        </div>
      </div>
      <div
        style={{
          marginTop: 70,
          opacity: ctaFade,
          transform: `scale(${wordmarkScale})`,
        }}
      >
        <Brand size={64} />
      </div>
    </Fill>
  );
};

export const TOTAL_FRAMES = VO_LEN.reduce((a, b) => a + b, 0);
const SCENES: Array<React.FC> = [
  Opening,
  WhatIsAuction,
  Preparation,
  Wallet,
  During,
  AfterWinning,
  Tips,
  Closing,
];

export const AuctionExplainer: React.FC = () => (
  <CanvasElement id="AuctionExplainer">
    <Fill style={{ backgroundColor: SLATE_950 }}>
      <Audio
        src={staticFile(`${VIDEO_ID}/vo/pad.mp3`)}
        startFrom={0}
        endAt={TOTAL_FRAMES}
        volume={0}
      />
      {VO_START.map((start, i) => (
        <Sequence key={i} from={start} durationInFrames={VO_LEN[i]}>
          <Audio src={staticFile(VO(i + 1))} startFrom={0} endAt={VO_LEN[i]} volume={1} />
        </Sequence>
      ))}
      <Series>
        {SCENES.map((Scene, i) => (
          <Series.Sequence key={i} durationInFrames={VO_LEN[i]}>
            <Scene />
          </Series.Sequence>
        ))}
      </Series>
    </Fill>
  </CanvasElement>
);