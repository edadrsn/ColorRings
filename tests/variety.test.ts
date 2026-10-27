import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,type Level} from '../src/levels.ts';
import {levelsMarkup} from '../src/menu-views.ts';
import {freshProgress,loadProgress} from '../src/progress.ts';
const mastery=LEVELS.filter(level=>level.mastery);
/** Ignore names, start angles, tiny wall-width/radius differences and rewards. */
function task(level:Level){
  return JSON.stringify({rings:level.rings.length,balls:level.balls.length,layers:level.balls.map(ball=>level.rings.filter(r=>Math.hypot(ball.x-270,ball.y-280)>r.radius).length),colors:new Set(level.balls.map(b=>b.color)).size,
    openings:level.rings.map(r=>r.gaps.map(g=>Math.floor(g.size/20))),order:level.rules?.deliveryOrder,keys:level.keys?.length??0,locks:level.locks?.map(l=>l.kind),gates:level.colorGates?.map(g=>[g.from,g.to]),links:level.links?.map(l=>[l.driver,l.follower,l.ratio]),split:level.splitters?.length??0,obstacles:level.obstacles?.length??0,budget:!!level.rules?.maxMoves});
}
test('first twelve levels introduce four genuinely different physical tasks in groups of three',()=>{
  assert.equal(mastery.length,100);
  const first=mastery.slice(0,12);assert.equal(new Set(first.map(l=>l.idea!.id)).size,4);
  assert.ok(first.slice(0,3).every(l=>l.sequence!.length===1&&!l.keys?.length));assert.deepEqual(first.slice(0,3).map(l=>l.rings.length),[2,3,4]);
  assert.ok(first.slice(3,6).every(l=>l.sequence!.length===2&&l.rules!.deliveryOrder!.length===2));
  assert.ok(first.slice(6,9).every(l=>l.rings.length>=3));assert.equal(first[8].balls.length,4);
  assert.ok(first.slice(9,12).every(l=>l.keys!.length>0&&l.locks!.length>0));
  assert.ok(new Set(first.slice(0,10).map(task)).size>=8);
});
test('no idea lasts over three consecutive levels and every next group changes physical task profiles',()=>{
  let previous='',run=0;const groups:Level[][]=[];
  for(const level of mastery){const id=level.idea!.id;run=id===previous?run+1:1;if(id!==previous)groups.push([]);groups.at(-1)!.push(level);previous=id;assert.ok(run<=3);}
  assert.equal(groups.length,34);
  for(let i=1;i<groups.length;i++)assert.notDeepEqual([...new Set(groups[i].map(task))].sort(),[...new Set(groups[i-1].map(task))].sort(),`repeated task block ${i}`);
});
test('the map shows all 100 stages, including the final short group, under 34 idea headings',()=>{
  const p=freshProgress();p.masteryUnlocked=100;const html=levelsMarkup(p,'mastery',41);
  assert.equal((html.match(/data-level=/g)??[]).length,100);assert.equal((html.match(/<section class="chapter">/g)??[]).length,34);assert.ok(html.includes('data-level="139"'));assert.ok(html.includes('100 · Büyük final'));
});
test('layout redesign keeps prior mastery completion, coins and purchased collections',()=>{
  const p=loadProgress({getItem:()=>JSON.stringify({version:4,coins:420,currentLevel:45,masteryUnlocked:6,completed:[41,42,43,44],stars:{41:3,42:2},owned:['classic','pearl'],skin:'pearl',themes:['classic','aurora'],theme:'aurora'}),setItem:()=>{}});
  assert.deepEqual(p.completed,[41,42,43,44]);assert.equal(p.stars[41],3);assert.equal(p.masteryUnlocked,6);assert.equal(p.coins,420);assert.equal(p.skin,'pearl');assert.equal(p.theme,'aurora');
});
