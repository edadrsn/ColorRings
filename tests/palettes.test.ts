import {test} from 'node:test';
import assert from 'node:assert/strict';
import {PALETTES,COLOR_ORDER,paletteColors} from '../src/palettes.ts';
import {freshProgress,loadProgress,saveProgress} from '../src/progress.ts';
import {effectBudget} from '../src/effects.ts';
import {LEVELS} from '../src/levels.ts';
test('all five palettes map every logical color to one distinct ball/bucket color and stable symbol',()=>{
 const before=JSON.stringify(LEVELS);for(const p of PALETTES){const colors=paletteColors(p.id);assert.equal(new Set(COLOR_ORDER.map(c=>colors[c].hex)).size,5);for(const c of COLOR_ORDER){assert.equal(colors[c].symbol,paletteColors('pastel')[c].symbol);assert.match(colors[c].css,/^#[0-9a-f]{6}$/i);}}
 assert.equal(JSON.stringify(LEVELS),before);
});
test('old v4 save retains inventory, coins and progress and gains safe palette/effect defaults',()=>{
 const p=loadProgress({getItem:()=>JSON.stringify({version:4,coins:177,owned:['classic','neon'],skin:'neon',completed:[1],stars:{1:3}}),setItem:()=>{}});assert.equal(p.coins,177);assert.equal(p.skin,'neon');assert.equal(p.stars[1],3);assert.equal(p.palette,'pastel');assert.equal(p.effectQuality,'medium');
});
test('owned palette and effect quality persist, unowned and invalid selections are rejected on load',()=>{
 const p=freshProgress();p.palettes.push('ocean');p.palette='ocean';p.effectQuality='low';let text='';const storage={getItem:()=>text,setItem:(_k:string,v:string)=>{text=v;}};saveProgress(p,storage);assert.deepEqual(loadProgress(storage),p);text=JSON.stringify({...p,palette:'galaxy',effectQuality:'ultra'});const restored=loadProgress(storage);assert.equal(restored.palette,'pastel');assert.equal(restored.effectQuality,'medium');
});
test('reduced motion disables particles/trails at every quality; low budget stays bounded',()=>{
 for(const q of ['low','medium','high'] as const){assert.equal(effectBudget(q,true).particles,0);assert.equal(effectBudget(q,true).trail,0);}assert.ok(effectBudget('low',false).particles<effectBudget('high',false).particles);assert.ok(effectBudget('high',false).trail<=8);
});
