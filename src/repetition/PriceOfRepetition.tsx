import React from 'react';
import {AbsoluteFill,Freeze,Sequence,staticFile,useCurrentFrame,useVideoConfig} from 'remotion';
import {Audio} from '@remotion/media';
import '../fonts';
import {RepeatScene} from './scenes/Repeat';
import {LayersScene} from './scenes/Layers';
import {WorkspaceScene} from './scenes/Workspace';
import {ChainScene} from './scenes/Chain';
import {ControlScene} from './scenes/Control';
import {ValueScene} from './scenes/Value';
import {lerp,p} from './kit';

// A document plane crosses the lens on the two changes of context. The cue,
// occlusion and incoming scene all use the same absolute frame clock.
const PagePass:React.FC<{frame:number;start:number;cut:number;end:number}>=({frame,start,cut,end})=>{
 if(frame<start||frame>=end)return null;
 const x=lerp(frame,[start,cut,end],[2300,-180,-2520]);
 return <AbsoluteFill style={{perspective:1800,pointerEvents:'none',overflow:'hidden'}}><div style={{position:'absolute',left:x,top:-100,width:2360,height:1280,borderRadius:38,background:'linear-gradient(125deg,#fff 12%,#F4F7FE 74%,#D9E5FF)',boxShadow:'0 0 100px 30px #316bfd20',transform:`rotateY(${lerp(frame,[start,cut,end],[-8,0,8])}deg) rotateZ(-3deg)`,filter:'blur(1px)'}}/></AbsoluteFill>;
};

export const PriceOfRepetition:React.FC<{withAudio?:boolean}>=({withAudio=true})=>{const {fps}=useVideoConfig();const frame=useCurrentFrame();return <AbsoluteFill
  style={{
   background: '#F3F5F9',
   scale: 1.001
  }}
 >
 <Sequence name="01 · Цена повторения" from={0} durationInFrames={480} premountFor={fps}><RepeatScene/></Sequence>
 <Sequence name="02 · Работа между документами" from={480} durationInFrames={480} premountFor={fps}><LayersScene/></Sequence>
 <Sequence name="03 · Данные нужного объекта" from={960} durationInFrames={480} premountFor={fps}><WorkspaceScene/></Sequence>
 <Sequence name="04 · Связанные документы" from={1440} durationInFrames={840} premountFor={fps}><ChainScene/></Sequence>
 <Sequence name="05 · Текущий шаг и ответственный" from={2280} durationInFrames={720} premountFor={fps}><ControlScene/></Sequence>
 <Sequence name="06 · Ожидаемый эффект" from={3000} durationInFrames={600} premountFor={fps}><ValueScene/></Sequence>
 <PagePass frame={frame} start={450} cut={480} end={510}/>
 <PagePass frame={frame} start={942} cut={960} end={984}/>
 {frame>=2250&&frame<2280&&<AbsoluteFill style={{opacity:p(frame,2250,2280)}}><Freeze frame={0}><ControlScene/></Freeze></AbsoluteFill>}
 {withAudio&&<Audio src={staticFile('audio/repetition/soundtrack.wav')} premountFor={fps}/>}
 </AbsoluteFill>};
