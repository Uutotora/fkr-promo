import React from 'react';
import {Img,staticFile,useCurrentFrame} from 'remotion';
import {Base,Brand,C,Icon,appear,mix,p} from '../kit';

export const ValueScene:React.FC=()=>{const f=useCurrentFrame();const converge=p(f,240,312);const branded=p(f,295,330);return <Base blue>
 <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 50%,#5888ff,transparent 73%)',opacity:.6}}/>
 <div style={{opacity:1-branded}}><Brand light label="Ожидаемый эффект внедрения"/></div>
 <div style={{position:'absolute',left:100,top:173,fontSize:78,letterSpacing:-4,fontWeight:620,lineHeight:1.1,opacity:1-converge}}>Меньше повторов.<br/>Больше времени на решения.</div>
 <div style={{position:'absolute',inset:0,perspective:1500}}>
 {[['Меньше повторного ввода','Реквизиты переходят в следующий документ','doc'],['Меньше ручных сверок','Объём и основание видны при вводе','check'],['Прозрачный маршрут','Текущий шаг и ответственный — рядом','time']].map(([title,sub,icon],i)=>{const enter=p(f,30+i*60,60+i*60);return <div key={title} style={{position:'absolute',left:100+i*578,top:482,width:552,height:288,borderRadius:24,background:'#fff',color:C.ink,boxShadow:'0 25px 70px -25px #08216c55',boxSizing:'border-box',padding:33,opacity:enter*(1-converge),transform:`translate3d(${(960-(100+i*578+276))*converge}px,${(1-enter)*90-converge*40}px,${converge*-600}px) rotateY(${converge*(i-1)*35}deg)`}}><div style={{display:'flex',alignItems:'center',gap:16,marginBottom:27}}><div style={{height:51,width:51,borderRadius:14,background:C.blue50,display:'grid',placeItems:'center'}}><Icon kind={icon} size={29}/></div><div style={{height:5,width:38,borderRadius:3,background:C.orange}}/></div><div style={{fontSize:36,letterSpacing:-1.4,fontWeight:650,lineHeight:1.15}}>{title}</div><div style={{fontSize:24,lineHeight:1.4,color:C.muted,marginTop:17,maxWidth:445}}>{sub}</div></div>;})}
 </div>
 <div style={{position:'absolute',left:100,bottom:116,fontSize:23,color:'#dce6ff',opacity:p(f,180,210)*(1-converge)}}>Согласования сохраняются. Повторные операции сокращаются.</div>
 <div style={{position:'absolute',inset:0,background:'#F3F5F9',opacity:branded}}/>
 <div style={{position:'absolute',left:480,top:292,width:960,display:'flex',flexDirection:'column',alignItems:'center',opacity:branded,transform:`translateY(${(1-branded)*32}px) scale(${.96+branded*.04})`}}><Img src={staticFile('img/fkr-logo.png')} style={{width:475}}/><div style={{marginTop:68,fontSize:65,letterSpacing:-3.2,lineHeight:1.1,fontWeight:650,textAlign:'center',color:C.ink,...appear(f,390)}}>Данные переходят дальше.<br/>Решения остаются за людьми.</div><div style={{marginTop:30,fontSize:26,color:C.muted,opacity:p(f,420,450)}}>ФКР · Единая система капитального ремонта</div></div>
 <div style={{position:'absolute',left:0,right:0,bottom:65,textAlign:'center',fontSize:20,color:C.muted,opacity:branded}}>Демонстрационный прототип</div>
 </Base>};
