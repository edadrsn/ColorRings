import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.ts';
import {addMazeLayer} from '../src/layout-depth.ts';
import {simulate} from '../src/physics.ts';
import {zipStore,crc32} from '../src/zip-store.ts';

test('new early stages visibly use two, three and four actual colliding rings',()=>{
  assert.deepEqual(LEVELS.slice(40,43).map(l=>l.rings.length),[2,3,4]);assert.equal(LEVELS[3].rings.length,3);assert.equal(LEVELS[5].rings.length,4);assert.equal(LEVELS[47].rings.length,4);
  const l=LEVELS[3],blocked=[...l.solution];blocked[1]=180;assert.equal(simulate(l.solution,l).success,true);assert.equal(simulate(blocked,l).success,false);
});
test('inserting a layer remaps keys, locks, gates, links, plans, limits without mutating the source',()=>{
  const base=JSON.parse(JSON.stringify(LEVELS[0]));base.keys=[{id:'k',lock:'d',x:188,y:270,ring:1}];base.locks=[{id:'d',ring:1,kind:'ring'}];base.colorGates=[{id:'c',ring:1,angle:90,size:100,from:'pink',to:'green'}];base.oneWays=[{ring:1,gap:0,direction:'outward'}];base.links=[{driver:0,follower:1,ratio:-1}];base.plan=[{ring:0,to:0},{ring:1,to:0},{play:true,waitFor:'all'}];base.sequence=[{angles:[0,0],waitFor:'all'}];base.ringLimits=[1,2];base.rules={maxMoves:3};base.targetMoves=2;
  const before=JSON.stringify(base),next=addMazeLayer(base);assert.equal(JSON.stringify(base),before);assert.equal(next.rings.length,3);assert.equal(next.keys![0].ring,2);assert.equal(next.locks![0].ring,2);assert.equal(next.colorGates![0].ring,2);assert.equal(next.oneWays![0].ring,2);assert.equal(next.links![0].follower,2);assert.deepEqual(next.sequence![0].angles,[0,0,0]);assert.deepEqual(next.plan!.filter(a=>a.ring!==undefined).map(a=>a.ring),[0,2,1]);assert.deepEqual(next.ringLimits,[1,2,2]);assert.equal(next.targetMoves,3);assert.equal(next.rules!.maxMoves,4);
});
test('every final level mechanic references a real ring and a matching solution vector',()=>{
  for(const l of LEVELS){assert.equal(l.solution.length,l.rings.length);for(const s of l.sequence??[])assert.equal(s.angles.length,l.rings.length);for(const m of [...l.keys??[],...l.locks??[],...l.colorGates??[],...l.oneWays??[],...l.plan??[]])if(m.ring!==undefined)assert.ok(m.ring>=0&&m.ring<l.rings.length);for(const link of l.links??[])assert.ok(link.driver<l.rings.length&&link.follower<l.rings.length);}
});
test('PNG archive uses valid CRC, stored data, central directory and exact file offsets',()=>{
  const data=new TextEncoder().encode('123456789');assert.equal(crc32(data),0xcbf43926);const zip=zipStore([{name:'K01.png',data}]),view=new DataView(zip.buffer),directory=30+7+9;
  assert.equal(view.getUint32(0,true),0x04034b50);assert.equal(view.getUint32(14,true),0xcbf43926);assert.deepEqual(zip.slice(37,46),data);assert.equal(view.getUint32(directory,true),0x02014b50);assert.equal(view.getUint32(directory+42,true),0);assert.equal(view.getUint32(zip.length-22,true),0x06054b50);assert.equal(view.getUint16(zip.length-14,true),1);assert.equal(zipStore([]).length,22);
});
