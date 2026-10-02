import React from 'react';
import {Easing, interpolate, useCurrentFrame} from 'remotion';
import {
  Base, Brand, Button, C, DATA, Icon, Panel, Pill, Pointer, SHADOW,
  appear, p,
} from '../kit';

const blend = (a: number, b: number, t: number) => a + (b - a) * t;
const pressure = (frame: number, at: number) =>
  Math.max(0, 1 - Math.abs(frame - at - 2) / 7);

/** The value in every document is kilograms; 144 is the number of packs. */
const ControlMaterial: React.FC<{highlight: number}> = ({highlight}) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: 22, padding: '23px 26px',
    background: `rgba(49,107,253,${.045 + highlight * .04})`, borderRadius: 19,
    boxShadow: `0 14px 38px -28px rgba(49,107,253,${highlight * .5})`,
  }}>
    <div style={{width: 62, height: 62, flexShrink: 0, borderRadius: 17,
      background: 'white', display: 'grid', placeItems: 'center'}}>
      <Icon kind="box" size={34}/>
    </div>
    <div style={{flex: 1, minWidth: 0}}>
      <div style={{fontSize: 32, lineHeight: 1.2, fontWeight: 600, letterSpacing: -.7}}>
        {DATA.material}
      </div>
      <div style={{fontSize: 32, color: C.muted, marginTop: 9}}>{DATA.code}</div>
    </div>
    <div style={{whiteSpace: 'nowrap', textAlign: 'right'}}>
      <div style={{fontSize: 58, fontWeight: 650, lineHeight: 1, letterSpacing: -2,
        fontVariantNumeric: 'tabular-nums', color: C.blue}}>
        {DATA.qty}<span style={{fontSize: 32, marginLeft: 12, fontWeight: 500,
          letterSpacing: 0, color: C.muted}}>кг</span>
      </div>
      <div style={{fontSize: 32, color: C.muted, marginTop: 10}}>144 пач. × 25 кг</div>
    </div>
  </div>
);

type StationProps = {
  frame: number;
  index: number;
  short: string;
  organization: string;
  action: string;
  expanded: number;
  document: number;
  current?: boolean;
};

/** No station is completed: URO owns the current, still unsigned revision. */
const Station: React.FC<StationProps> = ({
  frame, index, short, organization, action, expanded, document, current = false,
}) => {
  const reveal = p(frame, 120 + index * 10, 150 + index * 10);
  const x = blend(blend(350 + index * 416, 142 + index * 551, expanded), 124, document);
  const y = blend(blend(786, 526, expanded), 355 + index * 185, document);
  const width = blend(blend(386, 534, expanded), 438, document);
  const height = blend(blend(86, 247, expanded), 174, document);
  const lock = p(frame, 252, 277);
  const detail = expanded;
  return (
    <div style={{
      position: 'absolute', left: x, top: y + (1 - reveal) * 24, width, height,
      opacity: reveal, borderRadius: blend(16, 24, expanded),
      padding: `${blend(blend(19, 26, expanded), 20, document)}px ${blend(23, 28, expanded)}px`,
      background: current ? 'linear-gradient(120deg,#e9f0ff,#dfe9ff)' : '#f1f3f7',
      color: current ? C.ink : '#73788b',
      boxSizing: 'border-box',
      transform: `translateZ(${current ? 12 + 10 * lock : 4}px)`,
      boxShadow: current
        ? `0 18px 48px -20px rgba(49,107,253,${.14 + lock * .17})`
        : '0 12px 34px -24px rgba(0,2,48,.12)',
    }}>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: blend(48, 35, expanded)}}>
        <span style={{fontSize: 32, fontWeight: 600,
          color: current ? C.blue : '#777d91'}}>
          {expanded > .5 ? (current ? 'Текущий шаг' : 'Далее') : short}
        </span>
        <span style={{width: current ? 12 : 9, height: current ? 12 : 9,
          borderRadius: '50%', background: current ? C.blue : '#b9becb',
          boxShadow: current ? `0 0 ${16 + 10 * lock}px #316bfd55` : 'none'}}/>
      </div>
      <div style={{opacity: detail, marginTop: blend(0, 11, expanded) * (1 - document * .35),
        fontSize: blend(52, 46, document), lineHeight: 1, fontWeight: 650,
        letterSpacing: -1.8}}>{short}</div>
      <div style={{opacity: detail, fontSize: 32, marginTop: 10,
        lineHeight: 1.1, color: current ? C.ink2 : '#7c8193'}}>
        {index === 2 && document > .5 ? 'Подпись подрядчика' : organization}
      </div>
      <div style={{opacity: detail * (1 - document), fontSize: 32, lineHeight: 1.1,
        marginTop: 10, color: current ? C.blue : '#8b90a1'}}>{action}</div>
    </div>
  );
};

/** Local frames 0–719. This scene opens the pending UGPM; it never signs it. */
export const ControlScene: React.FC = () => {
  const frame = useCurrentFrame();
  const route = p(frame, 210, 258);
  const document = p(frame, 402, 452);
  const decision = p(frame, 552, 584);
  const enter = p(frame, 0, 76);
  const lock = p(frame, 252, 277);
  const shellX = blend(310, 100, route);
  const shellY = blend(358, 350, route);
  const shellWidth = blend(1300, 1720, route);
  const cameraTurn = Math.sin(route * Math.PI) * -3;
  const documentTurn = Math.sin(document * Math.PI) * 2.5;
  const exit = interpolate(frame, [672, 718], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    easing: Easing.bezier(.68, 0, .24, 1),
  });
  const exitColor = p(frame, 679, 710);
  const dim = 1 - .75 * p(frame, 675, 709);
  // Match the current station's projected rectangle before lifting it out of
  // the 3D stage. The blue surface then becomes ValueScene's background.
  const liftScale = 2100 / (2100 - 22);
  const liftX = 960 + (124 - 960) * liftScale;
  const liftY = 1080 * .62 + (355 - 1080 * .62) * liftScale;

  return (
    <Base>
      <Brand/>
      <div style={{position: 'absolute', left: 100, top: 151, right: 100,
        opacity: p(frame, 24, 52) * dim,
        transform: `translateY(${(1 - p(frame, 24, 52)) * 24}px)`}}>
        <div style={{position: 'relative', height: 168}}>
          <div style={{position: 'absolute', inset: 0, opacity: 1 - decision,
            transform: `translateY(${-decision * 24}px)`, fontSize: 76, fontWeight: 650,
            lineHeight: 1.06, letterSpacing: -3.6}}>
            Понятно, где работа.<br/>
            И кто действует дальше.
          </div>
          <div style={{position: 'absolute', inset: 0, opacity: decision,
            transform: `translateY(${(1 - decision) * 24}px)`}}>
            <div style={{fontSize: 76, lineHeight: 1.06, letterSpacing: -3.6,
              fontWeight: 650}}>Всё для следующего решения.</div>
            <div style={{fontSize: 32, lineHeight: 1.3, color: C.muted, marginTop: 22}}>
              Документ, основание и ответственный — в одной карточке.
            </div>
          </div>
        </div>
      </div>

      <div style={{position: 'absolute', inset: 0, perspective: 2100,
        perspectiveOrigin: '50% 62%', opacity: dim}}>
        <div style={{position: 'absolute', inset: 0, transformStyle: 'preserve-3d',
          transformOrigin: '50% 61%',
          transform: `translate3d(0px,${(1 - enter) * 18}px,0px) rotateX(${(1 - enter) * 5 + documentTurn}deg) rotateY(${(1 - enter) * -6 + cameraTurn}deg) scale(${.965 + enter * .035})`}}>

          <Panel style={{position: 'absolute', left: shellX, top: shellY,
            width: shellWidth, height: blend(550, 568, route), opacity: 1 - document,
            transform: 'translateZ(0px)', overflow: 'visible'}}>
            <div style={{position: 'absolute', left: 40, top: 31, display: 'flex',
              alignItems: 'center', gap: 19}}>
              <Icon kind="doc" size={49}/>
              <span style={{fontSize: 51, lineHeight: 1, fontWeight: 650, letterSpacing: -2}}>УГПМ</span>
              <span style={{fontSize: 32, color: C.muted, marginLeft: 12}}>Уведомление подрядчику</span>
            </div>
            <div style={{position: 'absolute', left: 40, top: 110, display: 'flex',
              alignItems: 'center', gap: 24}}>
              <Pill style={{fontSize: 32}}>Согласование УРО в Диадоке</Pill>
              <span style={{fontSize: 32, color: C.ink2}}>УРО ГАУ</span>
            </div>
            <div style={{position: 'absolute', left: 40, right: 40, top: 183,
              opacity: 1 - route, transform: `translateY(${-route * 34}px)`}}>
              <ControlMaterial highlight={0}/>
            </div>
            <div style={{position: 'absolute', left: 40, top: 353,
              opacity: 1 - route, fontSize: 32, color: C.muted}}>{DATA.address}</div>
            <div style={{position: 'absolute', right: 39, top: 350,
              opacity: 1 - route, transform: 'translateZ(14px)'}}>
              <Button secondary pressed={pressure(frame, 210)} style={{height: 66, fontSize: 32,
                boxShadow: '0 10px 32px -22px #316bfd66'}}>
                История и статусы обмена
              </Button>
            </div>
            <div style={{position: 'absolute', left: 42, bottom: 32, opacity: route,
              display: 'flex', alignItems: 'center', gap: 15, color: C.muted, fontSize: 32}}>
              <Icon kind="time" color={C.orange} size={30}/>
              Следующее действие: согласовать УРО
            </div>
            <div style={{position: 'absolute', right: 42, bottom: 28,
              opacity: route, transform: 'translateZ(14px)'}}>
              <Button pressed={pressure(frame, 372)} style={{height: 64, fontSize: 32}}>
                Шаблон и выгрузка
              </Button>
            </div>
          </Panel>

          <Station frame={frame} index={0} short="УРО" organization="УРО ГАУ"
            action="Согласование" current expanded={route} document={document}/>
          <Station frame={frame} index={1} short="ОПМ" organization="ОПМ ФКР"
            action="Подпись ОПМ" expanded={route} document={document}/>
          <Station frame={frame} index={2} short="Подрядчик" organization="ООО «Городские системы»"
            action="Подпись подрядчика" expanded={route} document={document}/>

          <Panel style={{position: 'absolute', left: 612, top: 350,
            width: 1140, height: 547, opacity: document,
            transformOrigin: '0 50%',
            transform: `translate3d(${(1 - document) * 24}px,${(1 - document) * 15}px,${document * 12}px) rotateY(${(1 - document) * -4}deg)`,
            boxShadow: SHADOW, padding: 35, boxSizing: 'border-box'}}>
            <div style={{display: 'flex', gap: 20, alignItems: 'center', ...appear(frame, 407, 22)}}>
              <div style={{width: 67, height: 67, flexShrink: 0, borderRadius: 18,
                background: C.blue50, display: 'grid', placeItems: 'center'}}><Icon size={39}/></div>
              <div>
                <div style={{fontSize: 46, fontWeight: 650, lineHeight: 1, letterSpacing: -1.7}}>УГПМ</div>
                <div style={{fontSize: 32, color: C.muted, marginTop: 8}}>Уведомление подрядчику</div>
              </div>
              <Pill tone="orange" style={{marginLeft: 'auto', fontSize: 32,
                padding: '13px 18px', whiteSpace: 'nowrap'}}>Основание: УГПТ</Pill>
            </div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, marginTop: 25,
              ...appear(frame, 414, 22)}}>
              <Pill style={{fontSize: 32}}>Согласование УРО в Диадоке</Pill>
              <span style={{fontSize: 32, color: C.muted}}>Редакция 1</span>
            </div>
            <div style={{fontSize: 32, color: C.ink2, marginTop: 28, marginBottom: 22,
              letterSpacing: -.35, ...appear(frame, 418, 22)}}>{DATA.address}</div>
            <div style={appear(frame, 424, 24)}><ControlMaterial highlight={lock}/></div>
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginTop: 23, fontSize: 32, lineHeight: 1.2, ...appear(frame, 430, 24)}}>
              <div style={{color: C.muted}}>Дата поставки <span style={{color: C.ink2,
                fontWeight: 600, marginLeft: 15}}>{DATA.date}</span></div>
              <div style={{color: C.muted}}>Подрядчик: <span style={{color: C.ink2}}>подпись ожидается</span></div>
            </div>
          </Panel>
        </div>
      </div>

      <div style={{position: 'absolute', left: 100, right: 100, top: 939,
        ...appear(frame, 552, 30), opacity: decision * dim,
        display: 'flex', alignItems: 'center', gap: 16, fontSize: 32, color: C.muted}}>
        <span style={{height: 9, width: 9, borderRadius: '50%', background: C.orange}}/>
        Меньше ручного выяснения статуса
      </div>

      <Pointer frame={frame}
        keys={[[152, 1637, 959], [195, 1350, 741], [219, 1350, 741],
          [263, 793, 817], [333, 1208, 916], [362, 1564, 851], [381, 1564, 851],
          [453, 1762, 942]]}
        clicks={[210, 372]} visible={[160, 468]} scale={1.1}/>

      {frame >= 672 && <div style={{
        position: 'absolute', zIndex: 200,
        left: blend(liftX, 0, exit), top: blend(liftY, 0, exit),
        width: blend(438 * liftScale, 1920, exit),
        height: blend(174 * liftScale, 1080, exit),
        borderRadius: blend(24 * liftScale, 0, exit), overflow: 'hidden',
        background: 'linear-gradient(120deg,#e9f0ff,#dfe9ff)',
        boxShadow: `0 24px 70px -20px rgba(49,107,253,${.3 * p(frame, 672, 681) * (1 - exit)})`,
      }}>
        <div style={{position: 'absolute', inset: 0, background: C.blue, opacity: exitColor}}/>
        <div style={{position: 'absolute', inset: 0, opacity: exitColor,
          background: 'radial-gradient(ellipse at 65% 65%,#5d8dff50,transparent 65%)'}}/>
        <div style={{position: 'absolute', inset: 0, opacity: exitColor * .6,
          background: 'radial-gradient(ellipse at 50% 50%,#5888ff,transparent 73%)'}}/>
        <div style={{position: 'absolute', left: 28 * liftScale, top: 20 * liftScale,
          opacity: 1 - p(frame, 673, 690),
          transform: `translate3d(${exit * 55}px,${-exit * 18}px,0px)`,
          width: (438 - 56) * liftScale}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            fontSize: 32 * liftScale, lineHeight: `${35 * liftScale}px`, fontWeight: 600, color: C.blue}}>
            Текущий шаг
            <span style={{width: 12, height: 12, borderRadius: '50%', background: C.blue}}/>
          </div>
          <div style={{fontSize: 46 * liftScale, fontWeight: 650, letterSpacing: -1.8 * liftScale,
            lineHeight: 1, marginTop: 7.15 * liftScale}}>УРО</div>
          <div style={{fontSize: 32 * liftScale, lineHeight: 1.1, marginTop: 10 * liftScale,
            color: C.ink2}}>УРО ГАУ</div>
        </div>
      </div>}
    </Base>
  );
};
