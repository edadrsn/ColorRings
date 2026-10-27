import type {SkinId} from './cosmetics.ts';
/** Original motifs over the color-coded sphere; gameplay color remains visible. */
export function paintMotif(ctx:CanvasRenderingContext2D,skin:SkinId){
  ctx.save();ctx.beginPath();ctx.arc(64,64,32,0,Math.PI*2);ctx.clip();ctx.strokeStyle='#fff5dfdb';ctx.fillStyle='#fff6dfd9';ctx.lineWidth=2.8;
  const star=(x:number,y:number,r:number)=>{ctx.beginPath();for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2,d=i%2?r*.42:r;const px=x+Math.cos(a)*d,py=y+Math.sin(a)*d;i?ctx.lineTo(px,py):ctx.moveTo(px,py);}ctx.closePath();ctx.fill();};
  if(skin==='galaxy'){for(const rotation of [-.55,.8]){ctx.beginPath();ctx.ellipse(64,64,30,11,rotation,0,Math.PI*2);ctx.stroke();}for(let i=0;i<7;i++){ctx.beginPath();ctx.arc(42+i*7,47+(i*11)%32,1.5,0,Math.PI*2);ctx.fill();}}
  if(skin==='rainbow'){['#ffcf91b0','#fff5b3c0','#baffd5a0','#b7ddffa0'].forEach((color,i)=>{ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(52,82,15+i*6,Math.PI,Math.PI*2);ctx.stroke();});}
  if(skin==='gold'){ctx.strokeStyle='#ffe89c';ctx.lineWidth=6;ctx.beginPath();ctx.arc(64,64,28,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff4c9';star(72,58,9);}
  if(skin==='diamond'||skin==='crystal'){const n=skin==='diamond'?4:7;ctx.beginPath();for(let i=0;i<n;i++){const a=Math.PI*2*i/n-Math.PI/2,x=64+Math.cos(a)*29,y=64+Math.sin(a)*29;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.closePath();ctx.stroke();for(let i=0;i<n;i++){const a=Math.PI*2*i/n-Math.PI/2;ctx.beginPath();ctx.moveTo(64,64);ctx.lineTo(64+Math.cos(a)*29,64+Math.sin(a)*29);ctx.stroke();}}
  if(skin==='candy'){ctx.translate(64,64);ctx.rotate(-.6);ctx.fillStyle='#fff9ef75';for(let x=-36;x<40;x+=16)ctx.fillRect(x,-40,7,80);}
  if(skin==='fire'){for(let i=0;i<3;i++){const x=47+i*16;ctx.beginPath();ctx.moveTo(x,83);ctx.bezierCurveTo(x-14,68,x+4,62,x+1,43-i*3);ctx.bezierCurveTo(x+18,66,x+11,75,x,83);ctx.fill();}}
  if(skin==='ice'){for(let i=0;i<6;i++){const a=i*Math.PI/3,x=64+Math.cos(a)*25,y=64+Math.sin(a)*25;ctx.beginPath();ctx.moveTo(64,64);ctx.lineTo(x,y);ctx.moveTo(x-Math.cos(a+.5)*10,y-Math.sin(a+.5)*10);ctx.lineTo(x,y);ctx.lineTo(x-Math.cos(a-.5)*10,y-Math.sin(a-.5)*10);ctx.stroke();}}
  if(skin==='ocean'){for(let row=0;row<3;row++){const y=55+row*13;ctx.beginPath();ctx.moveTo(31,y);for(let x=31;x<97;x+=22)ctx.bezierCurveTo(x+5,y-8,x+16,y+8,x+22,y);ctx.stroke();}}
  if(skin==='lava'){ctx.strokeStyle='#fff0a2';for(const points of [[[38,39],[55,56],[49,69],[69,87]],[[91,43],[74,61],[83,76],[95,84]],[[32,79],[48,69],[64,71],[74,61]]]){ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();}}
  if(skin==='cat'||skin==='panda'){ctx.fillStyle=skin==='panda'?'#302b507f':'#ffffffc9';for(const x of [52,76]){ctx.beginPath();ctx.ellipse(x,61,skin==='panda'?9:4,skin==='panda'?11:5,skin==='panda'?(x<64?-.5:.5):0,0,Math.PI*2);ctx.fill();}ctx.fillStyle='#fff8ec';ctx.beginPath();ctx.moveTo(59,72);ctx.lineTo(69,72);ctx.lineTo(64,77);ctx.closePath();ctx.fill();if(skin==='cat'){ctx.beginPath();ctx.moveTo(39,51);ctx.lineTo(42,32);ctx.lineTo(54,45);ctx.moveTo(74,45);ctx.lineTo(86,32);ctx.lineTo(90,51);ctx.stroke();for(const sign of [-1,1]){ctx.beginPath();ctx.moveTo(64+sign*10,73);ctx.lineTo(64+sign*27,68);ctx.moveTo(64+sign*10,78);ctx.lineTo(64+sign*27,81);ctx.stroke();}}else {ctx.fillStyle='#fff';for(const x of [52,76]){ctx.beginPath();ctx.arc(x,59,2.3,0,Math.PI*2);ctx.fill();}}}
  if(skin==='star'){star(64,63,25);ctx.fillStyle='#ffffff70';star(85,84,7);}
  if(skin==='heart'){ctx.beginPath();ctx.moveTo(64,86);ctx.bezierCurveTo(26,62,43,38,64,54);ctx.bezierCurveTo(86,36,102,62,64,86);ctx.fill();}
  if(skin==='bubble'){for(const [x,y,r] of [[51,64,15],[79,52,10],[78,80,9]]){ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#ffffff99';ctx.beginPath();ctx.arc(x-r*.3,y-r*.35,2.5,0,Math.PI*2);ctx.fill();}}
  if(skin==='cosmic'){ctx.beginPath();for(let i=0;i<100;i++){const a=i*.13,r=2+i*.27,x=64+Math.cos(a)*r,y=64+Math.sin(a)*r;i?ctx.lineTo(x,y):ctx.moveTo(x,y);}ctx.stroke();star(80,48,7);}
  if(skin==='prism'){ctx.strokeStyle='#e9ffffe8';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(35+i*12,37);ctx.lineTo(45+i*12,91);ctx.stroke();}star(62,60,13);}
  if(skin==='orbit'){ctx.strokeStyle='#fff2b8';ctx.beginPath();ctx.ellipse(64,64,32,13,-.65,0,Math.PI*2);ctx.stroke();star(85,48,8);star(44,81,5);}
  if(skin==='royal'){ctx.fillStyle='#ffe397';ctx.beginPath();ctx.moveTo(42,78);ctx.lineTo(38,49);ctx.lineTo(54,61);ctx.lineTo(64,39);ctx.lineTo(75,61);ctx.lineTo(91,49);ctx.lineTo(86,78);ctx.closePath();ctx.fill();ctx.fillRect(42,81,44,5);}
  ctx.restore();
}
