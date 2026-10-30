import {test} from 'node:test';
import assert from 'node:assert/strict';
import {byCoinPrice} from '../src/catalog-order.ts';
import {SKINS} from '../src/cosmetics.ts';
import {THEMES} from '../src/themes.ts';
import {collectionMarkup} from '../src/menu-views.ts';
import {freshProgress} from '../src/progress.ts';
test('price sorting preserves original catalogs and equal-price author order',()=>{
 const items=[{id:'a',cost:200},{id:'b',cost:0},{id:'c',cost:80},{id:'d',cost:80}];
 assert.deepEqual(byCoinPrice(items).map(i=>i.id),['b','c','d','a']);assert.deepEqual(items.map(i=>i.id),['a','b','c','d']);
});
test('every collection filter displays ascending coin prices, regardless of ownership',()=>{
 const p=freshProgress();p.owned.push('diamond','pearl','royal');
 for(const filter of ['all','owned','locked'] as const){
  const ids=[...collectionMarkup(p,()=>[],'',filter).matchAll(/data-skin="([^"]+)"/g)].map(m=>m[1]);
  const costs=ids.map(id=>SKINS.find(s=>s.id===id)!.cost);assert.ok(costs.every((c,i)=>i===0||c>=costs[i-1]),filter);
 }
});
test('themes include all fourteen IDs in increasing price order without changing price or inventory',()=>{
 const before=JSON.stringify(THEMES),themes=byCoinPrice(THEMES);assert.equal(themes.length,14);assert.equal(new Set(themes.map(t=>t.id)).size,14);assert.equal(themes[0].cost,0);assert.ok(themes.every((t,i)=>i===0||t.cost>=themes[i-1].cost));assert.equal(JSON.stringify(THEMES),before);
});
