import {test} from 'node:test';
import assert from 'node:assert/strict';
import {THEMES,themeById,validTheme} from '../src/themes.ts';
import {SKINS} from '../src/cosmetics.ts';
import {freshProgress,buyTheme,buySkin,loadProgress,saveProgress,equipSkin} from '../src/progress.ts';
import {drawThemeBackdrop} from '../src/theme-backdrop.ts';

test('fourteen themes have distinct palettes and new background patterns',()=>{
  assert.equal(THEMES.length,14);assert.equal(new Set(THEMES.map(t=>t.background)).size,14);
  const patterns=THEMES.slice(4).map(theme=>{
    const calls:unknown[]=[];const proxy=new Proxy({}, {get:(_target,key)=>(...args:unknown[])=>calls.push([key,...args])});
    drawThemeBackdrop(proxy as Parameters<typeof drawThemeBackdrop>[0],theme.id);assert.ok(validTheme(theme.id));assert.equal(themeById(theme.id),theme);return JSON.stringify(calls);
  });assert.equal(new Set(patterns).size,10);
});
for(const theme of THEMES.slice(4))test(`${theme.id}: purchase, repeat selection and reload preserve the exact price and inventory`,()=>{
  const p=freshProgress();p.coins=1000;assert.equal(buyTheme(p,theme.id),'bought');assert.equal(p.coins,1000-theme.cost);assert.equal(buyTheme(p,theme.id),'owned');assert.equal(p.coins,1000-theme.cost);
  let value='';const storage={getItem:()=>value,setItem:(_key:string,next:string)=>{value=next;}};saveProgress(p,storage);assert.deepEqual(loadProgress(storage),p);
});
test('ball prices increase moderately, while free and achievement-only cosmetics stay free',()=>{
  const oldPrices={pearl:60,neon:120,stardust:180,galaxy:170,rainbow:190,gold:220,diamond:240,crystal:160,candy:130,fire:180,ice:150,ocean:140,lava:200,cat:180,heart:170,bubble:120};
  for(const [id,old] of Object.entries(oldPrices)){const cost=SKINS.find(s=>s.id===id)!.cost;assert.equal(cost,Math.ceil(old*1.25/10)*10);const p=freshProgress();p.coins=cost-1;assert.equal(buySkin(p,id as 'pearl'),'insufficient');p.coins=cost;assert.equal(buySkin(p,id as 'pearl'),'bought');assert.equal(p.coins,0);}
  assert.ok(SKINS.filter(s=>s.id==='classic'||s.achievement).every(s=>s.cost===0));
});
test('previously bought appearances remain owned without a price adjustment or a new charge',()=>{
  const p=loadProgress({getItem:()=>JSON.stringify({version:4,coins:75,themes:['classic','neon','space'],theme:'space',owned:['classic','pearl','neon'],skin:'neon'}),setItem:()=>{}});
  assert.equal(equipSkin(p,'pearl'),true);assert.equal(buySkin(p,'pearl'),'owned');assert.equal(buyTheme(p,'space'),'owned');assert.equal(p.coins,75);assert.ok(p.themes.includes('neon'));
});
