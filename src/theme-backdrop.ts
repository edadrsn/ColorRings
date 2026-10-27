import type Phaser from 'phaser';
import {themeById,type ThemeId} from './themes.ts';

/** Static, original vector accents: no images, extra physics or per-frame objects. */
export function drawThemeBackdrop(g:Phaser.GameObjects.Graphics,id:ThemeId){
  g.clear();g.setAlpha(1);
  const accent=Number.parseInt(themeById(id).edge.slice(1),16);
  if(id==='prism'){g.lineStyle(1.5,accent,.35);for(let i=0;i<18;i++){const x=20+(i*113)%500,y=24+(i*97)%720;g.strokeTriangle(x,y-16,x+12,y+9,x-13,y+7);}}else if(id==='velvet'){g.lineStyle(1,0xffd38b,.3);for(let i=0;i<23;i++){const x=20+(i*89)%500,y=20+(i*127)%720;g.lineBetween(x-4,y,x+4,y);g.lineBetween(x,y-4,x,y+4);}}else if(id==='space'||id==='midnight'){
    for(let i=0;i<32;i++){g.fillStyle(accent,.18+(i%3)*.12);g.fillCircle(18+(i*79)%500,30+(i*113)%720,i%3===0?1.6:.8);}
    if(id==='midnight'){g.lineStyle(1,accent,.14);for(let i=0;i<7;i++)g.lineBetween(30+i*68,40+(i%2)*45,98+i*68,40+((i+1)%2)*45);g.fillStyle(accent,.1);g.fillCircle(450,70,32);}
  }else if(id==='aurora'){
    for(let i=0;i<5;i++){g.lineStyle(16-i*2,i%2?0xb6a4ef:accent,.05);g.beginPath();for(let x=0;x<=540;x+=12){const y=65+i*23+Math.sin(x/100+i)*28;if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}g.strokePath();}
  }else if(id==='ocean'||id==='desert'){
    for(let i=0;i<5;i++){g.lineStyle(id==='ocean'?2:12,accent,id==='ocean'?.24:.12);g.beginPath();for(let x=0;x<=540;x+=10){const y=550+i*38+Math.sin(x/(id==='ocean'?65:120)+i)*12;if(x===0)g.moveTo(x,y);else g.lineTo(x,y);}g.strokePath();}
  }else if(id==='sunset'){
    for(let i=3;i>0;i--){g.fillStyle(0xf1ac88,.05);g.fillCircle(270,190,65+i*50);}g.lineStyle(2,accent,.28);g.lineBetween(24,600,516,600);
  }else if(id==='forest'||id==='sakura'){
    for(let i=0;i<22;i++){const x=18+(i*83)%500,y=25+(i*139)%720;g.fillStyle(id==='forest'?0x7ca66a:0xe09abf,.13);g.fillEllipse(x,y,id==='forest'?7:9,id==='forest'?18:5);}
  }else if(id==='glacier'){
    g.lineStyle(1.5,accent,.55);for(let i=0;i<16;i++){const x=22+(i*113)%490,y=35+(i*151)%710;g.beginPath();g.moveTo(x,y-8);g.lineTo(x+5,y);g.lineTo(x,y+8);g.lineTo(x-5,y);g.closePath();g.strokePath();}
  }
}
