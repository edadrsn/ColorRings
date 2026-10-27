import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.ts';
import {validateSolution} from '../src/solutions.ts';
import {PhysicsWorld,simulate} from '../src/physics.ts';

test('campaign preserves forty originals and adds one hundred distinct mastery layouts',()=>{
  assert.equal(LEVELS.length,140);assert.equal(new Set(LEVELS.map(l=>l.name)).size,140);
  const signatures=LEVELS.map(l=>JSON.stringify({rings:l.rings.map(({initial,...shape})=>shape),balls:l.balls,cups:l.cups,keys:l.keys,locks:l.locks,colorGates:l.colorGates,oneWays:l.oneWays,obstacles:l.obstacles,dividers:l.dividers,links:l.links,splitters:l.splitters,rules:l.rules}));
  assert.equal(new Set(signatures).size,140);
  assert.equal(LEVELS[0].rings.length,2);assert.equal(LEVELS[4].rings.length,3);assert.equal(LEVELS[14].rings.length,4);
  assert.ok(LEVELS.some(l=>l.balls.length===6));
});
for(const level of LEVELS)test(`level ${level.id}: authored solution reaches every matching bucket`,()=>{
  const check=validateSolution(level);assert.equal(check.success,true,`${level.name}: ${check.result.balls.map(b=>b.outcome).join(',')}`);
  assert.equal(check.result.balls.length,level.goals?Object.values(level.goals).reduce((n,count)=>n+(count??0),0):level.balls.length);
  assert.ok(check.result.balls.every(run=>run.outcome==='correct'&&run.cup===run.color));
  assert.ok(level.stars.three>0&&level.stars.two>=level.stars.three);assert.ok(level.reward>=25);
  assert.equal(simulate(level.rings.map(r=>r.initial),level).success,false,`level ${level.id} starts already solved`);
});

test('four-ring six-ball physics is stable across 30, 60 and 120 render schedules',()=>{
  function run(fps:number){const level=LEVELS[18],world=new PhysicsWorld(level.solution,level);for(let i=0;i<fps*10&&!world.finished;i++)world.advance(1/fps);return world.result();}
  assert.deepEqual(run(30),run(60));assert.deepEqual(run(60),run(120));assert.equal(run(60).success,true);
});
test('the last wave level remains solvable at different frame schedules',()=>{
  function run(fps:number){const level=LEVELS[19],world=new PhysicsWorld(level.sequence![0].angles,level);for(let i=0;i<fps*3;i++)world.advance(1/fps);world.setAngles(level.sequence![1].angles);for(let i=0;i<fps*10&&!world.finished;i++)world.advance(1/fps);return world.result();}
  assert.deepEqual(run(30),run(60));assert.deepEqual(run(60),run(120));assert.equal(run(60).success,true);
});

