import { CanvasElement, Series } from '@rendiv/core';
import React from 'react';
import { frames } from './theme';
import { HookIntro } from './scenes/HookIntro';
import { Foundation } from './scenes/Foundation';
import { Phase1 } from './scenes/Phase1';
import { Phase2 } from './scenes/Phase2';
import { Phase3 } from './scenes/Phase3';
import { Outro } from './scenes/Outro';
import { SEGMENTS } from './theme';

/**
 * Master 10:30 timeline — 6 back-to-back acts.
 * Voiceover lives INSIDE each scene (edge-tts ta-IN-ValluvarNeural, Tamil),
 * so standalone per-scene compositions render with sound too.
 * Source: videos/navaratri-sadhana/vo/*.txt
 * Audio:  public/navaratri-sadhana/vo/*.mp3
 */
export const NavaratriSadhana: React.FC = () => (
  <CanvasElement id="NavaratriSadhana">
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
