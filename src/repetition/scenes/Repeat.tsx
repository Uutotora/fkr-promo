import React from 'react';
import {useCurrentFrame} from 'remotion';
import {Base,Brand,C,DATA,Icon,Panel,Pointer,Title,appear,mix,p} from '../kit';

const typed=(f:number,start:number)=>f<start?'':f<start+9?'1':f<start+18?'14':'144';
const Entry:React.FC<{frame:number;second?:boolean}>=({frame:f,second=false})=>{
 const start=second?312:162; const focused=f>=(second?294:144); const done=f>=start+18;
 return <Panel style={{width:1480,height:420,position:'relative',padding:40,boxSizing:'border-box'}}>
  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><div style={{display:'flex',gap:15,alignItems:'center',fontSize:28,fontWeight:600}}><Icon kind={second?'doc':'box'} size={30}/>{second?'Рабочая таблица':'Заявка на материалы'}</div><div style={{fontSize:23,color:C.muted}}>Текущий процесс · схема</div></div>
  <div style={{fontSize:24,color:C.muted,marginTop:28}}>{DATA.address}</div>
  <div style={{marginTop:37,display:'grid',gridTemplateColumns:'1fr 225px 175px',gap:24,color:C.muted,fontSize:21}}><div>Номенклатура</div><div>Количество</div><div>Единица</div></div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 225px 175px',gap:24,alignItems:'center',marginTop:15}}><div><div style={{fontSize:31,fontWeight:550,letterSpacing:-.65}}>{DATA.material}</div><div style={{fontSize:21,color:C.muted,marginTop:10}}>{DATA.code}</div></div><div style={{height:87,borderRadius:15,background:focused?'#EDF3FF':'#F3F4F7',boxShadow:focused?'0 0 32px #316bfd20':'none',display:'flex',alignItems:'center',padding:'0 24px',fontSize:55,fontWeight:600,fontVariantNumeric:'tabular-nums',letterSpacing:-2}}>{typed(f,start)}{focused&&f<start+65&&<span style={{width:3,height:50,background:C.blue,marginLeft:5,opacity:Math.floor(f/18)%2===0?1:.25}}/>}</div><div style={{fontSize:31,color:C.ink2}}>пач.</div></div>
  <div style={{position:'absolute',left:40,bottom:27,fontSize:22,color:done?C.muted:'#9b9dad'}}>{second?'Те же данные. Следующий документ.':'Количество вводится вручную'}</div>
  <Pointer frame={f} keys={second?[[274,1410,360],[294,1128,240],[330,1128,240],[350,1325,335],[376,1370,339]]:[[126,1410,360],[144,1128,240],[180,1128,240],[202,1325,335],[235,1370,339]]} clicks={[second?294:144]} visible={second?[274,393]:[126,249]}/>
 </Panel>;
};

export const RepeatScene:React.FC=()=>{const f=useCurrentFrame();const cut=p(f,252,290);const fly=p(f,450,480);return <Base>
 <div style={{position:'absolute',right:-mix(f,90,136,0,780),top:0,width:735,height:1080,background:C.blue,overflow:'hidden',transform:`perspective(1600px) rotateY(${mix(f,90,136,0,-9)}deg)`,transformOrigin:'100% 50%'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 40% 50%,#6894ff80,transparent 70%)'}}/>
  {[0,1,2].map((i)=><div key={i} style={{position:'absolute',left:50+i*22,top:154+i*258,fontSize:232,lineHeight:1,fontWeight:650,letterSpacing:-16,color:'white',opacity:(i===1?1:.15)*p(f,18+i*6,48+i*6),transform:`translateY(${(1-p(f,18+i*6,48+i*6))*100}px)`}}>144</div>)}
  <div style={{position:'absolute',left:60,bottom:102,fontSize:27,color:'#E5EDFF',opacity:p(f,48,78)}}>Одни и те же данные.</div>
 </div>
 <Brand label={f<110?'':'Цена повторения · ФКР'}/>
 <div style={{position:'absolute',left:100,top:mix(f,90,136,345,167),fontSize:mix(f,90,136,150,80),lineHeight:1.02,letterSpacing:mix(f,90,136,-8,-4),fontWeight:650,opacity:1-fly}}>
   <div style={{overflow:'hidden'}}><div style={{transform:`translateY(${(1-p(f,0,30))*170}px)`}}>Цена</div></div>
   <div style={{overflow:'hidden',marginTop:4}}><div style={{transform:`translateY(${(1-p(f,18,50))*170}px)`}}>повторения.</div></div>
 </div>
 <div style={{position:'absolute',right:111,top:182,width:520,fontSize:30,lineHeight:1.4,color:C.muted,...appear(f,102),opacity:p(f,102,132)*(1-fly)}}>Одна строка данных.<br/>Снова и снова — вручную.</div>
 <div style={{position:'absolute',inset:0,perspective:1800,perspectiveOrigin:'50% 60%'}}>
   <div style={{position:'absolute',left:220,top:mix(f,90,136,650,470),opacity:p(f,90,125),transformStyle:'preserve-3d',transform:`translateX(${-cut*1900}px) translateZ(${-fly*340}px) rotateX(${mix(f,90,136,16,0)+fly*24}deg) rotateY(${-cut*10}deg)`,filter:`blur(${Math.sin(cut*Math.PI)*3}px)`}}><Entry frame={f}/></div>
   {f>=248&&<div style={{position:'absolute',left:220,top:470,transformStyle:'preserve-3d',transform:`translateX(${(1-cut)*1900}px) translateZ(${-fly*340}px) rotateX(${fly*24}deg) rotateY(${(1-cut)*10}deg)`,filter:`blur(${Math.sin(cut*Math.PI)*3}px)`}}><Entry frame={f} second/></div>}
 </div>
 <div style={{position:'absolute',left:100,top:950,fontSize:29,color:C.ink2,letterSpacing:-.3,...appear(f,402),opacity:p(f,402,428)*(1-fly)}}>Повторяется ввод. Повторяется проверка.</div>
 <div style={{position:'absolute',left:1140,top:310,fontSize:108,letterSpacing:-6,fontWeight:650,color:C.orange,opacity:p(f,402,418)*(1-fly),transform:`translateY(${(1-p(f,402,430))*30}px)`}}>И снова.</div>
 </Base>};
