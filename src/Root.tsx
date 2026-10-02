import React from "react";
import { Composition, Folder } from "remotion";
import { Promo } from "./Promo";
import { Film } from "./v2/Film";
import { Film3, FILM3_DURATION } from "./v3/Film3";
import { FilmFinal, FILM_FINAL_DURATION } from "./v3/Intro";
import TL from "./timeline.json";
import {PriceOfRepetition} from './repetition/PriceOfRepetition';
import {RepeatScene} from './repetition/scenes/Repeat';
import {LayersScene} from './repetition/scenes/Layers';
import {WorkspaceScene} from './repetition/scenes/Workspace';
import {ChainScene} from './repetition/scenes/Chain';
import {ControlScene} from './repetition/scenes/Control';
import {ValueScene} from './repetition/scenes/Value';

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="PriceOfRepetition" component={PriceOfRepetition} durationInFrames={3600} fps={60} width={1920} height={1080} defaultProps={{withAudio:true}} />
    <Composition id="PriceOfRepetitionSilent" component={PriceOfRepetition} durationInFrames={3600} fps={60} width={1920} height={1080} defaultProps={{withAudio:false}} />
    <Folder name="Repetition-scenes">
      <Composition id="Repeat" component={RepeatScene} durationInFrames={480} fps={60} width={1920} height={1080}/>
      <Composition id="Layers" component={LayersScene} durationInFrames={480} fps={60} width={1920} height={1080}/>
      <Composition id="Workspace" component={WorkspaceScene} durationInFrames={480} fps={60} width={1920} height={1080}/>
      <Composition id="Chain" component={ChainScene} durationInFrames={840} fps={60} width={1920} height={1080}/>
      <Composition id="Control" component={ControlScene} durationInFrames={720} fps={60} width={1920} height={1080}/>
      <Composition id="Value" component={ValueScene} durationInFrames={600} fps={60} width={1920} height={1080}/>
    </Folder>
    <Composition id="Promo" component={FilmFinal} durationInFrames={Math.round(FILM_FINAL_DURATION * TL.fps)} fps={TL.fps} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Composition id="PromoFinalSilent" component={FilmFinal} durationInFrames={Math.round(FILM_FINAL_DURATION * TL.fps)} fps={TL.fps} width={1920} height={1080} defaultProps={{ withAudio: false }} />
    <Composition id="PromoNoIntro" component={Film3} durationInFrames={FILM3_DURATION * TL.fps} fps={TL.fps} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Composition id="PromoSilent" component={Film3} durationInFrames={FILM3_DURATION * TL.fps} fps={TL.fps} width={1920} height={1080} defaultProps={{ withAudio: false }} />
    <Composition id="PromoV2" component={Film} durationInFrames={TL.duration * TL.fps} fps={TL.fps} width={1920} height={1080} defaultProps={{ withAudio: true }} />
    <Composition id="PromoV1" component={Promo} durationInFrames={76 * TL.fps} fps={TL.fps} width={1920} height={1080} defaultProps={{ withAudio: true }} />
  </>
);
