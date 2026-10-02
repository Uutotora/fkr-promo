import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {Base, Brand, C, DATA, FONT, Icon, Pill, Pointer} from '../kit';

const glide = Easing.bezier(.65, 0, .25, 1);
const settle = Easing.bezier(.22, 1, .36, 1);
const track = (f: number, frames: number[], values: number[], easing = glide) =>
  interpolate(f, frames, values, {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

// World coordinates describe one continuous route through four document planes.
// Approval intervals are deliberately elided; no signature or external exchange is animated.
const documents = [
  {code: 'ЗПМ', title: 'Заявка на поставку материалов', basis: 'Документ-основание', x: 0, y: 0, z: 0, start: 0, click: -1, ready: 30, action: ''},
  {code: 'ОР', title: 'Отгрузочная разнарядка', basis: 'Из согласованной ЗПМ', x: 1330, y: -32, z: -230, start: 138, click: 168, ready: 210, action: 'Сформировать ОР'},
  {code: 'УГПТ', title: 'Уведомление о готовности к поставке товара', basis: 'На основании ОР', x: 2470, y: 64, z: -640, start: 360, click: 390, ready: 432, action: 'Подготовить шаблон УГПТ'},
  {code: 'УГПМ', title: 'Уведомление о готовности к поставке материала', basis: 'На основании УГПТ', x: 3740, y: 0, z: -910, start: 600, click: 630, ready: 672, action: 'Сформировать УГПМ'},
] as const;

type DocumentMeta = typeof documents[number];

const DocumentPlane: React.FC<{doc: DocumentMeta; index: number; frame: number}> = ({doc, index, frame}) => {
  const filled = frame >= doc.ready;
  const pressed = doc.click < 0 ? 0 : track(frame, [doc.click - 4, doc.click + 2, doc.click + 10], [0, 1, 0], settle);
  const focus = frame >= doc.start && (index === 3 || frame < documents[index + 1].start);
  const sourceReveal = index === 0 ? track(frame, [30, 54], [0, 1], settle) : 1;
  const doneReveal = track(frame, [doc.ready, doc.ready + 18], [0, 1], settle);
  const departure = index < 3 ? track(frame, [documents[index + 1].start, documents[index + 1].start + 34], [0, 1]) : 0;
  const retreat = index < 3 ? track(frame, [documents[index + 1].start, documents[index + 1].start + 24], [0, 680]) : 0;
  const arrival = index === 0 ? 1 : track(frame, [doc.start, doc.start + 12], [0, 1], settle);
  const visibility = arrival * (index === 3 ? 1 : 1 - track(frame, [documents[index + 1].start + 10, documents[index + 1].start + 36], [0, 1]));
  const status = index === 1 ? 'ОР сформирована' : index === 2 ? 'Шаблон УГПТ подготовлен' : 'Согласование УРО в Диадоке';

  if (visibility <= 0) return null;

  return <div style={{
    position: 'absolute', left: -660, top: -245, width: 1320, height: 490,
    transform: `translate3d(${doc.x}px, ${doc.y}px, ${doc.z - retreat}px) rotateY(${-departure * 12}deg)`,
    transformStyle: 'preserve-3d', backfaceVisibility: 'hidden',
    opacity: visibility, filter: departure > 0 ? `blur(${departure * 5}px)` : undefined,
  }}>
    <div style={{position: 'absolute', inset: 0, borderRadius: 30, background: 'white', boxShadow: '0 36px 90px -32px #00023030, 0 0 90px -50px #316bfd77'}}/>
    <div style={{position: 'absolute', inset: 0, borderRadius: 30, opacity: focus ? .85 : .1, background: 'radial-gradient(ellipse at 88% 0%,#316bfd0f,transparent 64%)'}}/>
    <div style={{position: 'absolute', left: 42, top: 34, display: 'flex', alignItems: 'center', gap: 25}}>
      <div style={{height: 66, minWidth: 134, padding: '0 17px', boxSizing: 'border-box', borderRadius: 18, background: index === 0 ? C.blue : C.blue50, color: index === 0 ? 'white' : C.blue, display: 'grid', placeItems: 'center', fontSize: 33, fontWeight: 650}}>{doc.code}</div>
      <div style={{fontSize: index > 1 ? 31 : 37, fontWeight: 600, letterSpacing: -.8, width: 1040, lineHeight: 1.18}}>{doc.title}</div>
    </div>

    <div style={{position: 'absolute', left: 48, top: 124}}>
      <div style={{fontSize: 22, color: C.muted, marginBottom: 8}}>Объект</div>
      <div style={{fontSize: 33, fontWeight: 550, letterSpacing: -.7}}>{DATA.address}</div>
    </div>
    <div style={{position: 'absolute', right: 46, top: 132, opacity: sourceReveal, transform: `translateY(${(1 - sourceReveal) * 16}px)`}}>
      <Pill style={{fontSize: 24, padding: '13px 19px'}}><Icon size={23}/>{doc.basis}</Pill>
    </div>

    {/* The single material row below is a separate plane: it travels, rather than retypes. */}
    <div style={{position: 'absolute', left: 44, right: 44, top: 223, height: 145, borderRadius: 20, background: '#F5F7FA'}}>
      <div style={{position: 'absolute', left: 27, top: 31, fontSize: 25, color: '#9BA3B3', opacity: filled ? 0 : .7}}>Материалы из документа-основания</div>
      <div style={{position: 'absolute', left: 27, top: 79, width: 575, height: 14, borderRadius: 7, background: '#E8EDF5', opacity: filled ? 0 : .7}}/>
      <div style={{position: 'absolute', right: 32, top: 43, width: 185, height: 43, borderRadius: 11, background: '#E8EDF5', opacity: filled ? 0 : .7}}/>
    </div>

    <div style={{position: 'absolute', left: 48, top: 404, display: 'flex', alignItems: 'center', gap: 12, fontSize: 25, color: C.muted}}>
      <Icon kind={index === 0 ? 'doc' : 'arrow'} size={26} color={C.blue}/>
      {index === 0 ? 'Одна партия · исходные данные сохранены' : filled ? 'Реквизиты и объём партии перенесены' : 'Реквизиты и объём — из основания'}
    </div>

    {index > 0 && !filled && <button type="button" aria-label={doc.action} style={{
      position: 'absolute', right: 44, top: 394, width: index === 2 ? 465 : 373, height: 64,
      appearance: 'none', border: 0, borderRadius: 16, fontFamily: FONT,
      background: C.blue, color: 'white', fontSize: 27, fontWeight: 550,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 15,
      boxShadow: '0 13px 30px -15px #316bfd88', transform: `scale(${1 - pressed * .045})`,
    }}>{doc.action}<Icon kind="arrow" size={23} color="white"/></button>}

    {index > 0 && filled && <div style={{position: 'absolute', right: 44, top: 393, opacity: doneReveal, transform: `translateY(${(1 - doneReveal) * 12}px)`}}>
      <Pill tone={index === 3 ? 'orange' : 'blue'} style={{height: 62, boxSizing: 'border-box', padding: '0 21px', fontSize: index === 3 ? 25 : 27}}>
        <Icon kind={index === 3 ? 'time' : 'doc'} size={27} color={index === 3 ? '#BE561B' : C.blue}/>{status}
      </Pill>
    </div>}

    {index > 0 && <Pointer frame={frame}
      keys={[[doc.click - 36, 1284, 566], [doc.click - 3, index === 2 ? 1085 : 1094, 429], [doc.click + 10, index === 2 ? 1085 : 1094, 429], [doc.click + 35, 1268, 495]]}
      clicks={[doc.click]} visible={[doc.click - 31, doc.click + 34]} scale={1.04}/>} 
  </div>;
};

export const TravellingMaterial: React.FC<{frame: number; x: number; y: number; z: number; lift: number}> = ({frame, x, y, z, lift}) => {
  const initialGlow = track(frame, [0, 22, 90], [1, .65, 0], settle);
  const inFlight = lift > .02;
  const landing = Math.max(...[210, 432, 672].map(ready => track(frame, [ready - 12, ready, ready + 30], [0, 1, 0], settle)));
  const transfer = documents.find(doc => doc.click > 0 && frame >= doc.click + 8 && frame <= doc.ready + 12);
  return <div style={{
    position: 'absolute', left: -616, top: -22, width: 1232, height: 145,
    boxSizing: 'border-box', borderRadius: 20,
    background: 'linear-gradient(108deg,#EEF4FF 0%,#E6EEFF 65%,#EAF0FC 100%)',
    transform: `translate3d(${x}px, ${y - lift * 8}px, ${z + 4 + lift * 185}px)`,
    transformStyle: 'preserve-3d',
    boxShadow: `0 ${8 + lift * 26}px ${28 + lift * 58}px -24px #316bfd${inFlight ? '66' : '00'}, 0 0 ${80 + initialGlow * 70 + landing * 25}px -28px rgba(49,107,253,${.12 + initialGlow * .42 + landing * .25})`,
  }}>
    {transfer && <div style={{position: 'absolute', inset: 0, overflow: 'hidden', borderRadius: 20, pointerEvents: 'none'}}>
      <div style={{position: 'absolute', top: -30, bottom: -30, left: -280, width: 270, background: 'linear-gradient(100deg,transparent,rgba(255,255,255,.76),transparent)', transform: `translateX(${track(frame, [transfer.click + 8, transfer.ready + 12], [0, 1600], settle)}px) skewX(-10deg)`}}/>
    </div>}
    <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: 6, borderRadius: '20px 0 0 20px', opacity: .75 + .25 * lift, background: C.blue}}/>
    <div style={{position: 'absolute', left: 25, top: 38, width: 67, height: 67, borderRadius: 18, background: 'white', display: 'grid', placeItems: 'center'}}><Icon kind="box" size={37}/></div>
    <div style={{position: 'absolute', left: 115, top: 27}}>
      <div style={{fontSize: 33, lineHeight: 1.14, letterSpacing: -.75, fontWeight: 600}}>{DATA.material}</div>
      <div style={{marginTop: 15, display: 'flex', gap: 22, alignItems: 'center', fontSize: 24, color: C.muted}}><span style={{color: C.blue, fontWeight: 550}}>{DATA.code}</span><span>{DATA.packs} пач. × 25 кг</span></div>
    </div>
    <div style={{position: 'absolute', right: 33, top: 23, textAlign: 'right'}}>
      <div style={{fontSize: 58, lineHeight: 1.06, letterSpacing: -2.4, fontWeight: 650, fontVariantNumeric: 'tabular-nums', color: C.ink}}>{DATA.qty}<span style={{fontSize: 29, letterSpacing: -.4, marginLeft: 10}}>кг</span></div>
      <div style={{fontSize: 24, marginTop: 12, color: C.blue}}>полный объём партии</div>
    </div>
    {lift > .03 && <div style={{position: 'absolute', top: -29, right: 25, height: 41, padding: '0 18px', borderRadius: 12, background: C.blue, color: 'white', display: 'flex', alignItems: 'center', fontSize: 23, fontWeight: 500, opacity: lift}}>Без повторного ввода</div>}
  </div>;
};

export const ChainScene: React.FC = () => {
  const frame = useCurrentFrame();
  const cameraFrames = [0, 138, 162, 360, 384, 600, 624, 780, 839];
  const x = track(frame, cameraFrames, [0, 0, 1330, 1330, 2470, 2470, 3740, 3740, 3740]);
  const y = track(frame, cameraFrames, [0, 0, -32, -32, 64, 64, 0, 0, 18]);
  const z = track(frame, cameraFrames, [0, 0, -230, -230, -640, -640, -910, -910, -800]);
  const lift = Math.max(
    track(frame, [0, 24, 103], [1, 1, 0], settle),
    track(frame, [138, 158, 180, 210], [0, 1, 1, 0]),
    track(frame, [360, 380, 402, 432], [0, 1, 1, 0]),
    track(frame, [600, 620, 642, 672], [0, 1, 1, 0]),
  );
  const flightBank = [138, 360, 600].reduce((sum, start, i) => {
    const progress = track(frame, [start, start + 24], [0, 1]);
    return sum + Math.sin(progress * Math.PI) * (i === 1 ? -5.8 : 5.8);
  }, 0);
  const active = frame < 138 ? 0 : frame < 360 ? 1 : frame < 600 ? 2 : 3;
  const exit = track(frame, [780, 839], [0, 1]);
  const drop = track(frame, [0, 18, 72], [1, .35, 0], settle);

  return <Base>
    <div style={{position: 'absolute', inset: 0, background: `radial-gradient(ellipse at 55% 67%,rgba(49,107,253,${.10 + drop * .18}),transparent 64%),radial-gradient(ellipse at 17% 79%,#FD843114,transparent 42%)`}}/>
    <div style={{position: 'absolute', left: 210, top: 446, width: 1510, height: 386, borderRadius: 80, background: 'linear-gradient(110deg,#316BFD44,#316BFD99 54%,#A3BDFF44)', filter: 'blur(39px)', opacity: track(frame, [0, 20, 114], [.94, .82, 0], settle), transform: `perspective(1800px) rotateX(16deg) rotateY(${track(frame, [0, 114], [-14, 0], settle)}deg) scale(${track(frame, [0, 80], [1.04, 1], settle)})`}}/>
    <Brand label="Демонстрация прототипа"/>
    <div style={{position: 'absolute', left: 100, top: 151, right: 100, opacity: 1 - exit * .8, transform: `translateY(${-exit * 21}px)`}}>
      <div style={{fontSize: 72, lineHeight: 1.06, fontWeight: 650, letterSpacing: -3.2}}>Данные переходят дальше.</div>
      <div style={{fontSize: 28, color: C.muted, marginTop: 20, letterSpacing: -.3}}>Реквизиты и объём партии — из документа-основания</div>
    </div>

    <div style={{position: 'absolute', left: 100, right: 100, top: 307, display: 'flex', alignItems: 'center', gap: 17, opacity: 1 - exit * .7}}>
      {documents.map((doc, index) => <React.Fragment key={doc.code}>
        {index > 0 && <Icon kind="arrow" size={26} color={index <= active ? C.blue : '#BAC5D9'}/>}
        <div style={{height: 54, padding: '0 24px', borderRadius: 15, display: 'flex', alignItems: 'center', gap: 13, background: active === index ? C.blue : index < active ? '#E2EAFC' : '#EAEEF5', color: active === index ? 'white' : index < active ? C.blue : C.muted, boxShadow: active === index ? '0 12px 35px -16px #316bfd88' : 'none', fontSize: 28, fontWeight: 600}}><span style={{fontSize: 19, opacity: .6}}>0{index + 1}</span>{doc.code}</div>
      </React.Fragment>)}
      <span style={{marginLeft: 'auto', fontSize: 23, color: C.muted}}>Одна партия · {DATA.code}</span>
    </div>

    <div style={{position: 'absolute', inset: 0, perspective: 1850, perspectiveOrigin: '50% 60%', overflow: 'hidden', clipPath: 'inset(377px 0 112px 0)'}}>
      <div style={{position: 'absolute', left: 960, top: 650 - exit * 28, width: 0, height: 0, transformStyle: 'preserve-3d', transform: `rotateX(${track(frame, [0, 106], [7, 0], settle) + Math.abs(flightBank) * .22}deg) rotateY(${flightBank}deg) translate3d(${-x}px, ${-y}px, ${-z}px)`}}>
        <DocumentPlane doc={documents[0]} index={0} frame={frame}/>
        <DocumentPlane doc={documents[1]} index={1} frame={frame}/>
        <DocumentPlane doc={documents[2]} index={2} frame={frame}/>
        <DocumentPlane doc={documents[3]} index={3} frame={frame}/>
        <TravellingMaterial frame={frame} x={x} y={y} z={z} lift={lift}/>
      </div>
    </div>

    <div style={{position: 'absolute', left: 100, right: 100, bottom: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 30, fontSize: 23, color: C.muted, opacity: 1 - exit * .55}}>
      <span>Этапы и согласования показаны в сокращении</span>
      <span>Данные демопрототипа</span>
    </div>
  </Base>;
};

export const Chain = ChainScene;
