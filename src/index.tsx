import { RealEstateOverview } from './videos/real-estate-overview/RealEstateOverview';
import { ChithiraiShorts } from './videos/chithirai-shorts/ChithiraiShorts';
import React from 'react';
import { setRootComponent, Composition } from '@rendiv/core';
import { MyVideo } from './videos/demo/MyVideo';

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
</>
);

setRootComponent(Root);
