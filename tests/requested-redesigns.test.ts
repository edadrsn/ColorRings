import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.ts';
import {RingSession} from '../src/engine.ts';
import {PhysicsWorld} from '../src/physics.ts';
import {advanceAtRate} from '../src/clock.ts';
import {reachedCondition,validateSolution} from '../src/solutions.ts';
import {lessonForLevel} from '../src/tutorial.ts';

for(const id of [3,9,29,36,39,40,44,46])test(`requested redesign ${id}: actual legal inputs solve and 2x preserves every final ball state`,()=>{
  const level=LEVELS[id-1],session=new RingSession();session.selectCustom(level);let tick=0;const commands:{tick:number;angles:number[]}[]=[];let initial:number[]=[];
  for(const action of level.plan!){
    if(action.ring!==undefined){assert.ok(session.begin(action.ring));assert.ok(session.preview(action.ring,action.to!));session.commit();if(session.world)commands.push({tick,angles:[...session.angles]});}
    if(action.play&&!session.world){initial=[...session.angles];session.play()!.onStep=()=>tick++;}
    if(action.waitFor){let budget=1920;while(budget--&&!session.world!.finished&&!reachedCondition(session.world!,action.waitFor))session.world!.step();assert.ok(reachedCondition(session.world!,action.waitFor));}
  }
  session.finish();assert.equal(session.phase,'success');const world=new PhysicsWorld(initial,level);let ticks=0,cursor=0;
  const input=()=>{while(cursor<commands.length&&commands[cursor].tick===ticks)world.setAngles(commands[cursor++].angles);};input();world.onStep=()=>{ticks++;input();};
  for(let frame=0;frame<3600&&!world.finished;frame++)advanceAtRate(world,1/60,2);
  assert.deepEqual(world.states,session.world!.states);assert.deepEqual(world.result(),session.world!.result());
});
test('the eight selected levels have visibly and mechanically different profiles',()=>{
  const chosen=[3,9,29,36,39,40,44,46].map(id=>LEVELS[id-1]);
  assert.deepEqual(chosen.map(l=>l.rings.length),[3,4,2,4,4,3,2,3]);
  assert.equal(new Set(chosen.map(l=>JSON.stringify({rings:l.rings.map(r=>({radius:r.radius,gaps:r.gaps,baffles:r.baffles})),balls:l.balls,cups:l.cups,links:l.links,keys:l.keys,splitters:l.splitters}))).size,8);
  assert.equal(LEVELS[35].balls.length,6);assert.equal(LEVELS[28].obstacles!.length,2);assert.equal(LEVELS[43].balls.filter(b=>Math.hypot(b.x-270,b.y-280)>LEVELS[43].rings[0].radius).length,1);
});
test('classic final requires a key and six physical deliveries through two distinct splitters',()=>{
  const l=LEVELS[39],c=validateSolution(l);assert.ok(c.success);assert.equal(c.world.states.length,6);assert.equal(c.world.deliveryOrder.length,6);assert.equal(c.world.collected.size,1);assert.equal(c.steps.length,5);assert.equal(l.rings.length,3);assert.equal(l.splitters!.length,2);
});
test('orbit workshop recolors yellow to purple and duplicates blue only after its key is obtained',()=>{
  const c=validateSolution(LEVELS[38]);assert.ok(c.success);assert.ok(c.world.collected.has('orbit-key'));assert.equal(c.world.runs.filter(r=>r.cup==='blue').length,2);assert.equal(c.world.runs.filter(r=>r.cup==='purple').length,1);
});
test('classic third tutorial now waits for the newly introduced third ring',()=>{
  const lesson=lessonForLevel(3,[],3)!;lesson.handle({type:'rotate',ring:0});lesson.handle({type:'rotate',ring:1});assert.equal(lesson.complete,false);assert.equal(lesson.view!.ring,2);lesson.handle({type:'rotate',ring:2});assert.equal(lesson.complete,true);
});
test('Undo and Restart restore both rings of the redesigned live linked gate',()=>{
  const session=new RingSession();session.selectCustom(LEVELS[45]);const before=[...session.angles];assert.ok(session.rotate(1,-180));assert.notEqual(session.angles[2],before[2]);assert.ok(session.undo());assert.deepEqual(session.angles,before);session.restart();assert.equal(session.moves,0);assert.deepEqual(session.angles,before);
});
test('final key unlock survives physical Undo and is cleared by Restart',()=>{
  const session=new RingSession();session.selectCustom(LEVELS[39]);assert.equal(session.canRotate(2),false);session.rotate(0,-150);session.rotate(1,90);const world=session.play()!;
  for(let i=0;i<1200&&!world.collected.has('final-switch');i++)world.step();assert.equal(session.canRotate(2),true);assert.ok(session.rotate(2,-70));for(let i=0;i<20;i++)world.step();assert.ok(session.undo());assert.ok(session.world!.collected.has('final-switch'));assert.notEqual(session.world,world);session.restart();assert.equal(session.world,null);assert.equal(session.canRotate(2),false);assert.equal(session.moves,0);
});
