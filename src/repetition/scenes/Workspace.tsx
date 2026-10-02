import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Base,Brand,Button,C,DATA,Icon,MaterialRow,Panel,Pill,Pointer,Title,appear,mix,p} from '../kit';
import {TravellingMaterial} from './Chain';

export const WorkspaceScene:React.FC=()=>{const f=useCurrentFrame();const open=p(f,168,210);const qty=f<282?'':f<291?'1':f<300?'14':'144';const fly=p(f,420,480);const sent=f>=396;const query='Нагорная'.slice(0,Math.max(0,Math.min(8,Math.floor((f-78)/6)+1)));return <Base>
 <Brand/>
 <Title frame={f} at={8} sub="Найти объект. Указать количество. Проверить объём." style={{opacity:1-fly}}>Начать с нужных данных.</Title>
 <div style={{position:'absolute',inset:0,perspective:1700}}>
 <Panel style={{position:'absolute',left:310,top:365,width:1300,padding:35,boxSizing:'border-box',opacity:(1-open)*p(f,12,40),transform:`translateY(${-open*110}px) rotateX(${-open*14}deg) scale(${1-open*.08})`}}>
  <div style={{height:78,display:'flex',gap:20,alignItems:'center',padding:'0 24px',background:'#F2F5FB',borderRadius:17,fontSize:37,boxShadow:f>48?'0 0 42px #316bfd16':'none'}}><Icon kind="search" size={33}/><span>{query||<span style={{color:'#979bac'}}>Поиск по системе</span>}</span>{f>=48&&f<160&&<span style={{height:41,width:3,background:C.blue,opacity:Math.floor(f/15)%2===0?1:.3}}/>}</div>
  <div style={{fontSize:22,color:C.muted,margin:'28px 12px 16px'}}>Объекты ремонта</div>
  <div style={{padding:'25px 27px',borderRadius:18,background:C.blue50,opacity:p(f,114,128)}}><div style={{display:'flex',gap:22,alignItems:'center'}}><Icon kind="building" size={42}/><div><div style={{fontSize:32,fontWeight:600}}>{DATA.address}</div><div style={{fontSize:23,color:C.muted,marginTop:9}}>УНОМ 18542 · ООО «Городские системы»</div></div></div></div>
  <div style={{fontSize:21,color:C.muted,marginTop:26}}>Поиск по адресу, УНОМ, подрядчику или договору</div>
 </Panel>
 <Panel style={{position:'absolute',left:195,top:350,width:1530,height:620,padding:38,boxSizing:'border-box',opacity:open*(1-p(f,420,456)),transformStyle:'preserve-3d',transform:`translateY(${(1-open)*80+fly*56}px) translateZ(${-fly*170}px) rotateX(${(1-open)*8+fly*8}deg)`,filter:`blur(${fly*4}px)`}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:32,fontWeight:650}}>Новая заявка</div><Pill tone={sent?'blue':'neutral'}>{sent?'На проверке ТУ':'Кабинет подрядчика'}</Pill></div>
  <div style={{marginTop:27,display:'flex',alignItems:'center',gap:15,fontSize:27}}><Icon kind="building" size={27}/>{DATA.address}</div>
  <div style={{marginTop:24,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:24,color:C.muted}}>ПСД-НГ-001 · лимиты по выбранному объекту</div><Pill><Icon kind="check" size={20}/>ПСД и МГЭ согласованы</Pill></div>
  <div style={{marginTop:25,position:'relative'}}><MaterialRow qty={qty} packs active/><div style={{position:'absolute',right:85,top:31,width:3,height:49,background:C.blue,opacity:f>=264&&f<325&&(Math.floor(f/14)%2===0)?1:0}}/></div>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginTop:23,fontSize:27}}><div style={{opacity:p(f,318,338),color:C.blue,fontWeight:600,fontVariantNumeric:'tabular-nums'}}>144 пач. × 25 кг = 3 600 кг</div><div style={{color:C.muted,fontSize:24}}>Первая заявка · лимит 30%</div></div>
  <div style={{display:'flex',gap:16,marginTop:22,fontSize:23,color:C.muted}}><span>ПСД: 12 000 кг</span><span style={{marginLeft:18}}>МГЭ: 12 000 кг</span><span style={{marginLeft:'auto'}}>Без обоснования 144 пач.</span></div>
  <div style={{position:'absolute',left:38,right:38,bottom:28,display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{fontSize:22,color:sent?C.blue:C.muted,opacity:sent?p(f,396,410):1}}>{sent?'Заявка соответствует смете и направлена в ФКР':'Количество сохраняется в единицах сметы'}</div><Button pressed={Math.max(0,1-Math.abs(f-380)/8)}>{sent?'На проверке ТУ':'Направить на проверку'}</Button></div>
 </Panel>
 </div>
 {f>=420&&<div style={{position:'absolute',inset:0,perspective:1850,perspectiveOrigin:'50% 60%',opacity:p(f,420,446)}}><div style={{position:'absolute',left:960,top:650+(1-p(f,420,468))*48,transformStyle:'preserve-3d',transform:`rotateX(${7*p(f,420,468)}deg)`}}><TravellingMaterial frame={0} x={0} y={0} z={0} lift={p(f,420,468)}/></div></div>}
 <Pointer frame={f} keys={[[20,1615,905],[48,880,440],[115,880,440],[168,1010,589],[220,1440,824],[264,1542,631],[300,1542,631],[321,1610,773],[349,1610,773],[378,1515,911],[408,1515,911]]} clicks={[48,168,264,378]} visible={[20,419]}/>
 </Base>};
