import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,type Level} from '../src/levels.ts';
import {auditLayouts,mazeProfile,mazeDistance,MIN_MAZE_DISTANCE} from '../src/layout-audit.ts';
import {AUTHORED_LAYOUTS} from '../src/authored-layouts.ts';

test('all 9730 same-path and cross-path maze comparisons pass the structural similarity threshold',()=>{
  const audit=auditLayouts(LEVELS);assert.equal(LEVELS.length,140);assert.equal(Object.keys(AUTHORED_LAYOUTS).length,140);assert.equal(audit.exactDuplicates,0);assert.deepEqual(audit.pairs,[]);
  for(let i=0;i<LEVELS.length;i++)assert.ok(audit.nearest[i].distance+1e-9>=MIN_MAZE_DISTANCE,`closest duplicate for ${LEVELS[i].id}`);
});
test('maze audit ignores cosmetics, rewards, names, ball colors and initial ring rotations',()=>{
  const source=LEVELS[0],copy:Level=JSON.parse(JSON.stringify(source));copy.id=999;copy.name='Another title';copy.reward=999;copy.stars={three:500,two:1000};copy.rings.forEach(r=>{r.initial+=137;r.radius+=2;r.width+=.4;});copy.balls.forEach(b=>b.color='blue');assert.equal(mazeProfile(source).fingerprint,mazeProfile(copy).fingerprint);
});
test('independent rotations and mirror copies of the walls are detected as the same maze',()=>{
  for(const source of [LEVELS[0],LEVELS[2],LEVELS[38],LEVELS[139]]){
    const rotated:Level=JSON.parse(JSON.stringify(source));rotated.rings.forEach((r,i)=>{r.gaps.forEach(g=>g.angle+=30+i*20);r.baffles?.forEach(b=>b.angle+=30+i*20);});assert.equal(mazeProfile(source).fingerprint,mazeProfile(rotated).fingerprint);
    const mirror:Level=JSON.parse(JSON.stringify(source));mirror.rings.forEach(r=>{r.gaps.forEach(g=>g.angle=(360-g.angle)%360);r.baffles?.forEach(b=>b.angle=(360-b.angle)%360);});assert.equal(mazeProfile(source).fingerprint,mazeProfile(mirror).fingerprint);assert.equal(mazeDistance(mazeProfile(source),mazeProfile(mirror)),0);
  }
});
test('small geometric nudges cannot turn a duplicate into an accepted new maze',()=>{
  const source=LEVELS[0],copy:Level=JSON.parse(JSON.stringify(source));copy.rings.forEach(r=>{r.gaps.forEach(g=>g.angle+=1);r.baffles?.forEach(b=>b.angle+=1);r.width+=.2;});assert.ok(mazeDistance(mazeProfile(source),mazeProfile(copy))<MIN_MAZE_DISTANCE);
});
test('every generated window has physical room for the full marble diameter',()=>{
  for(const level of LEVELS)for(const ring of level.rings)for(const gap of ring.gaps){const opening=2*ring.radius*Math.sin(gap.size*Math.PI/360)-ring.width;assert.ok(opening>=32,`${level.id}: ${opening.toFixed(2)}px opening`);}
});
