import {ECONOMY} from './economy-config.ts';
import type {Color} from './levels.ts';
export const COLOR_ORDER:Color[]=['pink','blue','yellow','green','purple'];
export const PALETTES=[
  {id:'pastel',name:'Pastel',cost:ECONOMY.palettePrices['pastel'],description:'Pembe, gök mavisi, şeftali, mint ve lavanta.',colors:['#f15db3','#42b6f5','#f1c76c','#40ba86','#9c72de']},
  {id:'neon',name:'Neon',cost:ECONOMY.palettePrices['neon'],description:'Elektrik mavisi ve canlı neon ışıkları.',colors:['#ff36a9','#168dff','#ffe32c','#59e747','#a95bff']},
  {id:'candy',name:'Candy',cost:ECONOMY.palettePrices['candy'],description:'Şeker pembesi, mavi, limon, mint ve leylak.',colors:['#ff67b6','#5ebcff','#ffd94f','#5cdb9d','#ba86ff']},
  {id:'ocean',name:'Ocean',cost:ECONOMY.palettePrices['ocean'],description:'Pembe mercan, deniz mavisi, kum altını ve lavanta.',colors:['#f78fb8','#2197db','#f4d973','#26b6a2','#a18be4']},
  {id:'galaxy',name:'Galaxy',cost:ECONOMY.palettePrices['galaxy'],description:'Kozmik mor, yıldız sarısı ve elektrik turkuazı.',colors:['#f851ce','#5260f4','#f9cf3c','#27d8cc','#a45aee']},
] as const;
export type PaletteId=typeof PALETTES[number]['id'];
export const validPalette=(id:unknown):id is PaletteId=>PALETTES.some(p=>p.id===id);
export const paletteById=(id:PaletteId)=>PALETTES.find(p=>p.id===id)!;
const symbols=['●','✦','▲','■','◆'];
const mix=(hex:string,target:number,t:number)=>'#'+[1,3,5].map(i=>Math.round(parseInt(hex.slice(i,i+2),16)*(1-t)+target*t).toString(16).padStart(2,'0')).join('');
/** Presentation only. Color identifiers and every physical state remain unchanged. */
export function paletteColors(id:PaletteId){return Object.fromEntries(COLOR_ORDER.map((color,i)=>{const css=paletteById(id).colors[i];return [color,{css,hex:parseInt(css.slice(1),16),symbol:symbols[i],light:mix(css,255,.6),mid:mix(css,255,.13),dark:mix(css,0,.42)}];})) as Record<Color,{css:string;hex:number;symbol:string;light:string;mid:string;dark:string}>;}
