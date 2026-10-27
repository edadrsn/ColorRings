import type {SkinId} from './cosmetics.ts';
import {paintMotif} from './skin-motifs.ts';
export const MATERIALS:Record<SkinId,{light:string;mid:string;dark:string}>={
 classic:{light:'#ffe5fa',mid:'#ff65c4',dark:'#8a1267'},pearl:{light:'#ffffff',mid:'#e4def5',dark:'#736f9d'},neon:{light:'#c4ffff',mid:'#00d9fb',dark:'#063c9c'},stardust:{light:'#caa6ff',mid:'#6c24ce',dark:'#190a4c'},galaxy:{light:'#a08aff',mid:'#35238d',dark:'#070e35'},rainbow:{light:'#fff6bc',mid:'#fa5da9',dark:'#6046d2'},gold:{light:'#fffbd2',mid:'#efb414',dark:'#6b3106'},diamond:{light:'#efffff',mid:'#75d3ff',dark:'#175da1'},crystal:{light:'#d2fff7',mid:'#33b9c9',dark:'#145778'},candy:{light:'#ffe0f5',mid:'#f078ca',dark:'#952779'},fire:{light:'#fff79c',mid:'#ff7825',dark:'#a21016'},ice:{light:'#ffffff',mid:'#9ce4ff',dark:'#367ab5'},ocean:{light:'#9bffeb',mid:'#13aed2',dark:'#063c81'},lava:{light:'#ffda72',mid:'#b62e22',dark:'#240b19'},cat:{light:'#ffe7bd',mid:'#dfaa65',dark:'#85532c'},panda:{light:'#ffffff',mid:'#edeaf8',dark:'#928dad'},star:{light:'#fffbc5',mid:'#ffce3c',dark:'#c17712'},heart:{light:'#ffe4f2',mid:'#ff5ca3',dark:'#a80e62'},bubble:{light:'#f3ffff',mid:'#a3bce2',dark:'#3f426a'},cosmic:{light:'#e4a1ff',mid:'#8b3bd3',dark:'#160e4e'},prism:{light:'#ffffff',mid:'#acdadc',dark:'#625a9d'},orbit:{light:'#d3e9ff',mid:'#3753b9',dark:'#0c164a'},royal:{light:'#e3b1ff',mid:'#9450c6',dark:'#39145e'},
};
/** Original cached raster materials. The outside chromatic seal always identifies the gameplay color. */
export function paintSphere(ctx:CanvasRenderingContext2D,skin:SkinId,color:{css:string;light:string;dark:string}){
 const m=skin==='classic'?{light:color.light,mid:color.css,dark:color.dark}:MATERIALS[skin];
 const disc=(r:number)=>{ctx.beginPath();ctx.arc(64,62,r,0,Math.PI*2);};
 const halo=ctx.createRadialGradient(64,62,30,64,62,58);halo.addColorStop(0,color.css+'90');halo.addColorStop(.65,color.css+'20');halo.addColorStop(1,color.css+'00');ctx.fillStyle=halo;ctx.fillRect(0,0,128,128);
 ctx.save();ctx.shadowColor='#03091d90';ctx.shadowBlur=10;ctx.shadowOffsetY=8;ctx.fillStyle=m.dark;disc(36);ctx.fill();ctx.restore();
 const sphere=ctx.createRadialGradient(49,42,1,70,73,51);sphere.addColorStop(0,m.light);sphere.addColorStop(.25,m.light);sphere.addColorStop(.53,m.mid);sphere.addColorStop(1,m.dark);ctx.fillStyle=sphere;disc(36);ctx.fill();
 ctx.save();disc(35);ctx.clip();
 if(skin==='rainbow'||skin==='bubble'||skin==='prism'){
  const g=ctx.createConicGradient(-1.6,64,62);['#ffa8d3','#ffde83','#9dffd0','#82d9ff','#bb94ff','#ffa8d3'].forEach((c,i)=>g.addColorStop(i/5,c));ctx.globalAlpha=skin==='bubble'?.55:.85;ctx.fillStyle=g;ctx.fillRect(26,24,76,76);ctx.globalAlpha=1;
  if(skin==='bubble'){ctx.fillStyle='#13234170';disc(29);ctx.fill();}
 }
 if(skin==='galaxy'||skin==='cosmic'||skin==='stardust'||skin==='orbit'){
  for(let i=0;i<5;i++){const g=ctx.createRadialGradient(41+i*12,48+i*5,0,41+i*12,48+i*5,24);g.addColorStop(0,i%2?'#329bff77':'#f57aff66');g.addColorStop(1,'#a84bff00');ctx.fillStyle=g;ctx.fillRect(24,24,80,80);}
  for(let i=0;i<36;i++){ctx.fillStyle=i%4?'#ffffffbb':'#ffe4b5';ctx.beginPath();ctx.arc(30+(i*37)%68,29+(i*19)%65,i%8===0?1.8:.7,0,Math.PI*2);ctx.fill();}
 }
 if(skin==='diamond'||skin==='crystal'||skin==='prism'||skin==='gold'){
  for(let i=0;i<10;i++){const a=i*Math.PI/5;ctx.fillStyle=i%3===0?'#ffffff9c':i%2?'#00274b20':'#fff3aa40';ctx.beginPath();ctx.moveTo(61,58);ctx.lineTo(64+Math.cos(a)*38,62+Math.sin(a)*38);ctx.lineTo(64+Math.cos(a+.63)*38,62+Math.sin(a+.63)*38);ctx.closePath();ctx.fill();}
 }
 if(skin==='fire'||skin==='lava'){
  ctx.fillStyle='#1b061b';ctx.fillRect(25,65,78,34);for(let i=0;i<7;i++){const x=33+i*10;ctx.fillStyle=i%2?'#ffdf67':'#ff6b24';ctx.beginPath();ctx.moveTo(x-4,100);ctx.bezierCurveTo(x-12,70,x+13,68,x+4,37+i%3*9);ctx.bezierCurveTo(x+24,71,x+12,85,x+19,100);ctx.closePath();ctx.fill();}
 }
 if(skin==='cat'||skin==='panda'){
  ctx.fillStyle=skin==='cat'?'#fff3d7':'#fff';ctx.beginPath();ctx.ellipse(64,72,27,23,0,0,Math.PI*2);ctx.fill();
  for(const x of [49,79]){ctx.fillStyle=skin==='cat'?'#7d482d':'#202337';ctx.beginPath();ctx.ellipse(x,58,skin==='panda'?10:4,skin==='panda'?12:6,x<64?-.25:.25,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff';ctx.beginPath();ctx.arc(x-1,55,2,0,Math.PI*2);ctx.fill();}
  ctx.fillStyle='#452a3b';ctx.beginPath();ctx.moveTo(58,73);ctx.lineTo(70,73);ctx.lineTo(64,80);ctx.closePath();ctx.fill();ctx.strokeStyle='#5b3e50';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(64,79);ctx.quadraticCurveTo(58,87,54,80);ctx.moveTo(64,79);ctx.quadraticCurveTo(70,87,74,80);ctx.stroke();
  if(skin==='cat'){ctx.fillStyle='#b66c3d';for(const x of [42,81]){ctx.beginPath();ctx.moveTo(x,48);ctx.lineTo(x-1,28);ctx.lineTo(x+13,43);ctx.closePath();ctx.fill();ctx.fillStyle='#efb3a1';ctx.fillRect(x+3,36,4,10);}ctx.strokeStyle='#956445';for(const side of [-1,1])for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(64+side*12,75+i*5);ctx.lineTo(64+side*29,70+i*11);ctx.stroke();}}
 }else if(skin==='pearl'){
  ctx.strokeStyle='#f7efffbd';ctx.lineWidth=7;ctx.beginPath();ctx.ellipse(63,60,29,13,-.55,0,Math.PI*2);ctx.stroke();
 }else if(skin==='neon'){
  ctx.fillStyle='#122161';disc(28);ctx.fill();for(const [stroke,start] of [['#ff4bd7',0],['#21ffff',Math.PI]] as const){ctx.shadowColor=stroke;ctx.shadowBlur=10;ctx.strokeStyle=stroke;ctx.lineWidth=5;ctx.beginPath();ctx.arc(64,62,27,start,start+Math.PI);ctx.stroke();}ctx.shadowBlur=0;
 }else if(skin!=='classic'&&skin!=='galaxy'&&skin!=='fire')paintMotif(ctx,skin);
 ctx.restore();
 // Glass reflections and a colored seal survive every material, even a white pearl or gold sphere.
 ctx.strokeStyle=color.css;ctx.shadowColor=color.css;ctx.shadowBlur=5;ctx.lineWidth=3.2;disc(36);ctx.stroke();ctx.shadowBlur=0;
 ctx.strokeStyle='#ffffffb0';ctx.lineWidth=1;disc(34);ctx.stroke();
 ctx.fillStyle='#ffffffdc';ctx.beginPath();ctx.ellipse(51,42,11,6,-.55,0,Math.PI*2);ctx.fill();ctx.fillStyle='#ffffff55';ctx.beginPath();ctx.ellipse(78,82,9,3,-.6,0,Math.PI*2);ctx.fill();
 ctx.fillStyle=color.css;ctx.beginPath();ctx.ellipse(64,93,12,4,0,0,Math.PI*2);ctx.fill();ctx.strokeStyle='#ffffffbb';ctx.lineWidth=1;ctx.stroke();
}
