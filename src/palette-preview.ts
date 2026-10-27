import {COLOR_ORDER,paletteColors,type PaletteId} from './palettes.ts';
import {PALETTE_BACKDROPS} from './visual-theme.ts';
import {paintSphere} from './materials.ts';
const cached=new Map<PaletteId,string>();
export function palettePreview(id:PaletteId){
 if(cached.has(id))return cached.get(id)!;const canvas=document.createElement('canvas');canvas.width=320;canvas.height=200;const ctx=canvas.getContext('2d')!,p=PALETTE_BACKDROPS[id],colors=paletteColors(id);
 const bg=ctx.createLinearGradient(0,0,320,200);bg.addColorStop(0,p.top);bg.addColorStop(1,p.bottom);ctx.fillStyle=bg;ctx.fillRect(0,0,320,200);
 ctx.lineCap='round';for(let i=0;i<2;i++){ctx.strokeStyle='#0b163440';ctx.lineWidth=12;ctx.beginPath();ctx.arc(160,96,44+i*34,.35,Math.PI*2-.35);ctx.stroke();ctx.strokeStyle=p.wall;ctx.lineWidth=9;ctx.beginPath();ctx.arc(160,92,44+i*34,.35,Math.PI*2-.35);ctx.stroke();ctx.strokeStyle='#ffffff60';ctx.lineWidth=2;ctx.stroke();}
 COLOR_ORDER.forEach((c,i)=>{const sphere=document.createElement('canvas');sphere.width=sphere.height=128;paintSphere(sphere.getContext('2d')!,'classic',colors[c]);const a=-2.3+i*1.05;ctx.drawImage(sphere,160+Math.cos(a)*62-27,92+Math.sin(a)*62-27,54,54);});
 const url=canvas.toDataURL();cached.set(id,url);return url;
}
