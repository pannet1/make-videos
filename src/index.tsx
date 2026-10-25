import { RealEstateOverview } from './videos/real-estate-overview/RealEstateOverview';
import { ChithiraiShorts } from './videos/chithirai-shorts/ChithiraiShorts';
import React from 'react';
import { setRootComponent, Composition, Still } from '@rendiv/core';
import { MyVideo } from './videos/demo/MyVideo';
import { NavaratriSadhana } from './NavaratriSadhana';
import { HookIntro } from './scenes/HookIntro';
import { Foundation } from './scenes/Foundation';
import { Phase1 } from './scenes/Phase1';
import { Phase2 } from './scenes/Phase2';
import { Phase3 } from './scenes/Phase3';
import { Outro } from './scenes/Outro';
import { Thumbnail } from './Thumbnail';
import { TOTAL_FRAMES, FPS, SEGMENTS, frames } from './theme';

const scale720p = (Component: React.FC): React.FC => () => (
  <div style={{ width: 1920, height: 1080, transform: 'scale(0.6666667)', transformOrigin: 'top left' }}>
    <Component />
  </div>
);

const NavaratriSadhana720p = scale720p(NavaratriSadhana);

const Root: React.FC = () => (
  <>
    <Composition
      id="MyVideo"
      component={MyVideo}
      durationInFrames={150}
      fps={30}
      width={1920}
      height={1080}
    />
    <Composition
      id="ChithiraiShorts"
      component={ChithiraiShorts}
      durationInFrames={1871}
      fps={30}
      width={1080}
      height={1920}
    />
    <Composition
      id="RealEstateOverview"
      component={RealEstateOverview}
      durationInFrames={4136}
      fps={30}
      width={1920}
      height={1080}
    />
    {/* High-speed 1280x720 (720p HD) production master */}
    <Composition
      id="NavaratriSadhana"
      component={NavaratriSadhana720p}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1280}
      height={720}
    />
    {/* Optional full 1080p master */}
    <Composition
      id="NavaratriSadhana1080p"
      component={NavaratriSadhana}
      durationInFrames={TOTAL_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
    <Composition id="NavaratriHook" component={scale720p(HookIntro)} durationInFrames={frames(SEGMENTS.hook.seconds)} fps={FPS} width={1280} height={720} />
    <Composition id="NavaratriFoundation" component={scale720p(Foundation)} durationInFrames={frames(SEGMENTS.foundation.seconds)} fps={FPS} width={1280} height={720} />
    <Composition id="NavaratriPhase1" component={scale720p(Phase1)} durationInFrames={frames(SEGMENTS.phase1.seconds)} fps={FPS} width={1280} height={720} />
    <Composition id="NavaratriPhase2" component={scale720p(Phase2)} durationInFrames={frames(SEGMENTS.phase2.seconds)} fps={FPS} width={1280} height={720} />
    <Composition id="NavaratriPhase3" component={scale720p(Phase3)} durationInFrames={frames(SEGMENTS.phase3.seconds)} fps={FPS} width={1280} height={720} />
    <Composition id="NavaratriOutro" component={scale720p(Outro)} durationInFrames={frames(SEGMENTS.outro.seconds)} fps={FPS} width={1280} height={720} />
    <Still id="NavaratriThumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);

setRootComponent(Root);
