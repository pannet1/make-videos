import React from 'react';
import { setRootComponent, Composition } from '@rendiv/core';
import { MyVideo } from './videos/demo/MyVideo';
import { AuctionExplainer, TOTAL_FRAMES } from './videos/auction-explainer/AuctionExplainer';

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
      id="AuctionExplainer"
      component={AuctionExplainer}
      durationInFrames={TOTAL_FRAMES}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);

setRootComponent(Root);
