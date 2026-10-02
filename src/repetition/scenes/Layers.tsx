import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Base, Brand, C, DATA, FONT, Icon, Pointer} from '../kit';

const glide = Easing.bezier(.65, 0, .25, 1);
const settle = Easing.bezier(.22, 1, .36, 1);
const t = (f: number, frames: number[], values: number[], easing = glide) => interpolate(f, frames, values, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

const FindPlane: React.FC<{frame: number}> = ({frame: f}) => {
  const enter = t(f, [0, 45], [0, 1], settle);
  const leave = t(f, [192, 217], [0, 1]);
  const scan = t(f, [120, 195], [0, 1]);
  if (f >= 217) return null;
  return <div style={{position: 'absolute', left: 590, top: 344, width: 1160, height: 512, transformStyle: 'preserve-3d', transform: `translate3d(${-leave * 1030}px,${(1 - enter) * 140 - leave * 55}px,${-leave * 650}px) rotateY(${-11 + enter * 8 - leave * 39}deg) rotateX(${(1 - enter) * 18 + 2}deg)`, opacity: enter * (1 - leave)}}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 24, background: 'white', boxShadow: '0 38px 100px -35px #00023033'}}/>
    <div style={{position: 'absolute', left: 38, top: 31, right: 38, display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 14, fontSize: 29, fontWeight: 600}}><Icon size={30}/>Реестр материалов</div>
      <span style={{fontSize: 23, color: C.muted}}>Адрес и номенклатура</span>
    </div>
    <div style={{position: 'absolute', left: 37, top: 100, width: 1086, height: 76, boxSizing: 'border-box', borderRadius: 15, background: '#F0F4FC', display: 'flex', alignItems: 'center', gap: 17, padding: '0 25px', fontSize: 29}}><Icon kind="search" size={28}/>{DATA.address}</div>
    <div style={{position: 'absolute', left: 41, right: 40, top: 210, display: 'flex', justifyContent: 'space-between', color: C.muted, fontSize: 23}}><span>Материал</span><span>Количество</span></div>
    <div style={{position: 'absolute', left: 28, right: 28, top: 259, height: 151, borderRadius: 18, background: 'linear-gradient(105deg,#F3F6FC,#EBF1FD)', overflow: 'hidden'}}>
      <div style={{position: 'absolute', left: 27, top: 29, width: 760}}>
        <div style={{fontSize: 31, lineHeight: 1.2, fontWeight: 600, letterSpacing: -.6}}>Штукатурная смесь фасадная,<br/>25 кг</div>
        <div style={{fontSize: 23, color: C.blue, marginTop: 11}}>{DATA.code}</div>
      </div>
      <div style={{position: 'absolute', right: 31, top: 37, display: 'flex', alignItems: 'baseline', gap: 13}}><span style={{fontSize: 63, letterSpacing: -2, fontWeight: 650}}>144</span><span style={{fontSize: 26, color: C.muted}}>пач.</span></div>
      {scan > 0 && scan < 1 && <div style={{position: 'absolute', left: scan * 1380 - 250, top: 0, width: 240, bottom: 0, background: 'linear-gradient(100deg,transparent,#316BFD23,transparent)', transform: 'skewX(-12deg)'}}/>}
    </div>
    <div style={{position: 'absolute', left: 40, top: 445, display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, color: C.muted}}><Icon kind="search" size={25}/>Поиск по адресу, коду и наименованию</div>
  </div>;
};

const CopyPlanes: React.FC<{frame: number}> = ({frame: f}) => {
  const enter = t(f, [192, 217], [0, 1]);
  const leave = t(f, [270, 295], [0, 1]);
  const filled = t(f, [226, 238], [0, 1], settle);
  const pressure = t(f, [218, 224, 232], [0, 1, 0], settle);
  if (f < 192 || f >= 295) return null;
  return <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d', transform: `translate3d(${(1 - enter) * 1060}px,${(1 - enter) * 65}px,${-(1 - enter) * 550 - leave * 430}px) rotateY(${(1 - enter) * 29 - leave * 27}deg) scale(${1 - leave * .22})`, opacity: enter * (1 - leave)}}>
    <div style={{position: 'absolute', left: 120, top: 410, width: 767, height: 420, borderRadius: 26, background: 'white', boxShadow: '0 35px 90px -42px #00023030', padding: 34, boxSizing: 'border-box'}}>
      <div style={{fontSize: 24, color: C.muted, display: 'flex', gap: 13, alignItems: 'center'}}><Icon size={26}/>Исходный документ</div>
      <div style={{fontSize: 28, marginTop: 25, fontWeight: 550}}>{DATA.address}</div>
      <div style={{fontSize: 32, fontWeight: 600, letterSpacing: -.7, marginTop: 24, lineHeight: 1.22}}>Штукатурная смесь фасадная,<br/>25 кг</div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 30}}><span style={{fontSize: 26, color: C.blue}}>{DATA.code}</span><span style={{fontSize: 64, letterSpacing: -2, fontWeight: 650}}>144 <span style={{fontSize: 26, fontWeight: 450, color: C.muted}}>пач.</span></span></div>
    </div>
    <div style={{position: 'absolute', left: 914, top: 570, width: 90, height: 90, borderRadius: 28, display: 'grid', placeItems: 'center', background: '#E7EEFF', transform: `translateX(${filled * 12}px)`}}><Icon kind="arrow" size={46}/></div>
    <div style={{position: 'absolute', left: 1060, top: 410, width: 735, height: 420, borderRadius: 26, background: 'linear-gradient(125deg,#E8F0FF,#F6F8FE)', padding: 34, boxSizing: 'border-box'}}>
      <div style={{fontSize: 24, color: C.muted}}>Рабочая таблица</div>
      <div style={{fontSize: 27, marginTop: 25, fontWeight: 550}}>{DATA.address}</div>
      <div style={{fontSize: 28, fontWeight: 550, marginTop: 26}}>{DATA.code}</div>
      <label style={{position: 'absolute', left: 34, top: 215, fontSize: 25, color: C.muted}}>Количество</label>
      <div style={{position: 'absolute', left: 34, top: 259, width: 667, height: 120, borderRadius: 17, background: 'white', boxShadow: f >= 222 ? `0 0 ${34 + pressure * 18}px -12px #316bfd55` : 'none', transform: `scale(${1 - pressure * .018})`, overflow: 'hidden'}}>
        <div style={{position: 'absolute', left: 29, top: 16, fontSize: 69, fontWeight: 650, letterSpacing: -2.5, opacity: filled, transform: `translateY(${(1 - filled) * 14}px)`}}>144</div>
        {f < 232 && <div style={{position: 'absolute', left: 34, top: 27, height: 59, width: 3, borderRadius: 2, background: C.blue, opacity: f >= 218 ? 1 : 0}}/>}
        <span style={{position: 'absolute', right: 31, top: 46, fontSize: 27, color: C.muted}}>пач.</span>
      </div>
    </div>
    <Pointer frame={f} keys={[[190,1530,962],[218,1355,736],[222,1355,736],[246,1355,736],[277,1690,977]]} clicks={[222]} visible={[192,284]}/>
  </div>;
};

const ComparePlane: React.FC<{frame: number}> = ({frame: f}) => {
  const enter = t(f, [270, 295], [0, 1]);
  const closing = t(f, [420, 446], [0, 1], settle);
  const scan = t(f, [330, 390], [0, 1]);
  if (f < 270) return null;
  return <div style={{position: 'absolute', left: 120, top: 433 + closing * 136, right: 120, height: 446, transformStyle: 'preserve-3d', transform: `translate3d(${(1 - enter) * 270}px,${(1 - enter) * 170}px,${-(1 - enter) * 650}px) rotateX(${(1 - enter) * 32}deg) rotateY(${(1 - enter) * -18}deg) scale(${1 - closing * .12})`, transformOrigin: '50% 50%', opacity: enter}}>
    <div style={{position: 'absolute', left: 0, top: 0, right: 0, display: 'flex', alignItems: 'baseline', gap: 24, color: C.muted, fontSize: 26}}><Icon kind="doc" size={28}/><span>{DATA.material}</span><span style={{marginLeft: 'auto', color: C.blue}}>{DATA.code}</span></div>
    <div style={{position: 'absolute', left: 0, top: 68, width: 508, height: 247, borderRadius: 25, background: 'white', boxShadow: '0 25px 80px -43px #00023025', padding: '26px 35px', boxSizing: 'border-box'}}>
      <div style={{fontSize: 26, color: C.muted}}>Количество</div><div style={{fontSize: 128, letterSpacing: -6, fontWeight: 650, lineHeight: 1.1, marginTop: 15}}>144<span style={{fontSize: 31, fontWeight: 450, color: C.muted, letterSpacing: -.5, marginLeft: 17}}>пач.</span></div>
    </div>
    <div style={{position: 'absolute', left: 549, top: 119, width: 258, textAlign: 'center'}}><div style={{fontSize: 78, fontWeight: 500, letterSpacing: -2}}>× 25</div><div style={{fontSize: 25, color: C.muted, marginTop: 8}}>кг в упаковке</div></div>
    <div style={{position: 'absolute', left: 860, top: 129, fontSize: 86, color: C.muted}}>=</div>
    <div style={{position: 'absolute', right: 0, top: 68, width: 650, height: 247, borderRadius: 25, background: 'linear-gradient(115deg,#E7EEFF,#EDF3FF)', padding: '26px 36px', boxSizing: 'border-box', overflow: 'hidden'}}>
      <div style={{fontSize: 26, color: C.blue}}>Объём партии</div><div style={{fontSize: 128, letterSpacing: -6, fontWeight: 650, lineHeight: 1.1, marginTop: 15, color: C.blue}}>3 600<span style={{fontSize: 38, fontWeight: 450, letterSpacing: -.5, marginLeft: 15}}>кг</span></div>
      {scan > 0 && scan < 1 && <div style={{position: 'absolute', top: 0, bottom: 0, width: 180, left: scan * 880 - 180, background: 'linear-gradient(100deg,transparent,#FFFFFFA0,transparent)'}}/>}
    </div>
    <div style={{position: 'absolute', left: 0, right: 0, top: 354, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 28, color: C.muted}}><span>{DATA.address}</span><span>Основание: {DATA.basis}</span></div>
  </div>;
};

export const LayersScene: React.FC = () => {
  const f = useCurrentFrame();
  const stage = f < 192 ? 0 : f < 270 ? 1 : 2;
  const captionFrame = stage === 0 ? 18 : stage === 1 ? 192 : 270;
  const caption = t(f, [captionFrame, captionFrame + 17], [0, 1], settle);
  const close = t(f, [420, 438], [0, 1], settle);
  const macro = t(f, [330, 342, 355, 379], [0, 1, 1, 0]);

  return <Base>
    <Brand label="Текущий процесс · схематично"/>
    <div style={{position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 78% 55%,#316BFD0B,transparent 56%)'}}/>
    <div style={{position: 'absolute', left: 100, top: stage === 0 ? 209 : 164, opacity: caption * (1 - close), transform: `translateY(${(1 - caption) * 22}px)`}}>
      <div style={{fontSize: 25, color: C.blue, fontWeight: 550, letterSpacing: .2, marginBottom: 15}}>0{stage + 1} / РУЧНАЯ РАБОТА</div>
      <div style={{fontSize: stage === 0 ? 133 : 114, lineHeight: .99, letterSpacing: -6.5, fontWeight: 650}}>{['Найти', 'Перенести', 'Сверить'][stage]}</div>
      <div style={{fontSize: 30, color: C.muted, lineHeight: 1.42, marginTop: stage === 0 ? 33 : 22, maxWidth: stage === 0 ? 410 : 1470}}>{stage === 0 ? <>Адрес.<br/>Номенклатура.<br/>Документ.</> : stage === 1 ? 'Те же реквизиты. В другом документе.' : 'Количество и основание.'}</div>
    </div>
    <div style={{position: 'absolute', inset: 0, perspective: 1800, perspectiveOrigin: '50% 60%', overflow: 'hidden', clipPath: 'inset(337px 0 100px 0)'}}>
      <FindPlane frame={f}/><CopyPlanes frame={f}/><ComparePlane frame={f}/>
    </div>
    <div style={{position: 'absolute', left: 100, top: 169, opacity: close, transform: `translateY(${(1 - close) * 21}px)`}}>
      <div style={{fontSize: 89, lineHeight: 1.04, letterSpacing: -4, fontWeight: 650}}>Время уходит<br/>на повторы.</div>
      <div style={{fontSize: 30, color: C.muted, marginTop: 22}}>Их можно сократить.</div>
    </div>
    <div style={{position: 'absolute', left: 100, right: 100, bottom: 66, fontSize: 25, color: C.muted, opacity: 1 - close}}>Данные проходят через документы. Специалист связывает их вручную.</div>
    {/* A single purposeful quantity macro at the scan cue, then back to the complete check. */}
    {macro > 0 && <div style={{position: 'absolute', inset: 0, zIndex: 60, background: C.blue, opacity: macro, transform: `perspective(1800px) translateZ(${(1 - macro) * -420}px) rotateY(${(1 - macro) * -12}deg) scale(${.82 + macro * .18})`, transformOrigin: '77% 62%', color: 'white', overflow: 'hidden', fontFamily: FONT}}>
      <Brand light label="Текущий процесс · схематично"/>
      <div style={{position: 'absolute', left: 108, top: 182, fontSize: 36, color: '#D5E2FF'}}>Количество и основание.</div>
      <div style={{position: 'absolute', left: 105, top: 271, fontSize: 69, color: '#D5E2FF', letterSpacing: -1.9}}>144 пач. × 25 кг</div>
      <div style={{position: 'absolute', left: 91, top: 399, fontSize: 278, fontWeight: 650, lineHeight: 1, letterSpacing: -16}}>3 600<span style={{fontSize: 111, letterSpacing: -3, marginLeft: 31}}>кг</span></div>
      <div style={{position: 'absolute', left: 109, right: 105, top: 799, fontSize: 32, display: 'flex', justifyContent: 'space-between', color: '#E5EDFF'}}><span>{DATA.material}</span><span>{DATA.code}</span></div>
    </div>}
  </Base>;
};
