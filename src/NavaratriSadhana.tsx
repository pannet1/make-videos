import { Audio, CanvasElement, Series, staticFile } from '@rendiv/core';
import React from 'react';
import { frames, SEGMENTS, TOTAL_FRAMES } from './theme';
import { HookIntro } from './scenes/HookIntro';
import { Foundation } from './scenes/Foundation';
import { Phase1 } from './scenes/Phase1';
import { Phase2 } from './scenes/Phase2';
import { Phase3 } from './scenes/Phase3';
import { Outro } from './scenes/Outro';

/**
 * Master timeline — 6 back-to-back acts.
 * Audio:  voiceover inside each scene + continuous 432Hz ambient meditation pad.
 */
export const NavaratriSadhana: React.FC = () => (
  <CanvasElement id="NavaratriSadhana">
    {/* Continuous sacred 432Hz ambient pad */}
    <Audio
      src={staticFile('navaratri-sadhana/vo/ambient-pad.mp3')}
      startFrom={0}
      endAt={TOTAL_FRAMES}
      volume={0.15}
    />
    <Series>
      <Series.Sequence durationInFrames={frames(SEGMENTS.hook.seconds)} name="Hook & Introduction">
        <HookIntro />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames(SEGMENTS.foundation.seconds)} name="Mahalaya Amavasya">
        <Foundation />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames(SEGMENTS.phase1.seconds)} name="Phase 1 · Days 1-3">
        <Phase1 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames(SEGMENTS.phase2.seconds)} name="Phase 2 · Days 4-5">
        <Phase2 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames(SEGMENTS.phase3.seconds)} name="Phase 3 · Days 6-9">
        <Phase3 />
      </Series.Sequence>
      <Series.Sequence durationInFrames={frames(SEGMENTS.outro.seconds)} name="Outro & CTA">
        <Outro />
      </Series.Sequence>
    </Series>
  </CanvasElement>
);
