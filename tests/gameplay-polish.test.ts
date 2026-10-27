import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.ts';
import {RingSession} from '../src/engine.ts';
import {PhysicsWorld,BALL_RADIUS} from '../src/physics.ts';
import {RELAY_PATCHES} from '../src/relay-levels.ts';
import {validateSolution,validatePlanFromSession,reachedCondition,verifiedSettlingWait} from '../src/solutions.ts';
import {refineVerifiedPlan} from '../src/plan-search.ts';
import {rollingAngle,impactStyle,PLAY_VIEW,BALL_ART_SIZE,PALETTE_MOTION} from '../src/gameplay-presentation.ts';
import {effectBudget} from '../src/effects.ts';

test('presentation enlarges artwork without altering the fixed collider or cup coordinates',()=>{
 assert.equal(BALL_RADIUS,14);assert.equal(BALL_ART_SIZE,66);assert.deepEqual(PLAY_VIEW,{width:540,height:776});
 assert.ok(LEVELS.every(l=>l.cups.every(c=>c.y+80<PLAY_VIEW.height)));
});
test('surface interpolation follows actual spin and stops completely when physical rotation stops',()=>{
 assert.equal(rollingAngle(2,4,.5),3);assert.equal(rollingAngle(3,3,.9),3);assert.equal(rollingAngle(2,4,2),4);assert.equal(rollingAngle(2,4,-1),2);
});
test('impact squash follows the collision normal with a bounded intensity',()=>{
 const floor=impactStyle(180,0,-1),side=impactStyle(180,1,0);
 assert.ok(floor.scaleX>1&&floor.scaleY<1);assert.ok(side.scaleX<1&&side.scaleY>1);
 assert.ok(impactStyle(1e8).scaleY>=.89);assert.ok(impactStyle(40).particles<floor.particles);
});
test('low effects disable trails; palettes have distinct bounded motion signatures',()=>{
 assert.equal(effectBudget('low',false).trail,0);assert.equal(effectBudget('high',true).trail,0);
 assert.equal(new Set(Object.values(PALETTE_MOTION).map(x=>JSON.stringify(x))).size,5);
 assert.ok(Object.values(PALETTE_MOTION).every(x=>x.trailAlpha<=.5));
});
test('physics emits actual contact strength and normal; telemetry does not alter the simulation',()=>{
 const l=LEVELS[0],a=new PhysicsWorld(l.solution,l),b=new PhysicsWorld(l.solution,l);let contacts=0;
 for(let i=0;i<120*8&&!a.finished;i++){
  a.step();b.step();for(const event of a.events.splice(0))if(event.type==='collision'){
   contacts++;assert.ok(event.strength!>30);assert.ok(Math.abs(Math.hypot(event.nx!,event.ny!)-1)<1e-8);assert.ok(Number.isFinite(event.x));
  }
  b.events.splice(0);
 }
 assert.ok(contacts>0);assert.deepEqual(a.states,b.states);assert.equal(a.result().success,true);
});
for(const patch of RELAY_PATCHES)test(`relay U${patch.id-40}: actual lock, certified live key stage${patch.twist?' and necessary recovery gesture':''}`,()=>{
 const level=LEVELS.find(l=>l.id===patch.id)!,s=new RingSession();s.selectCustom(level);
 assert.equal(s.canRotate(patch.lock.ring),false);if(patch.twist)assert.equal(s.canRotate(0),false);assert.equal(s.rotate(patch.lock.ring,30),false);
 const c=validateSolution(level);assert.equal(c.success,true);assert.equal(c.moves,patch.moves);assert.ok(c.world.collected.has('relay-key'));assert.ok(c.steps.some(x=>x.waitFor==='key:relay-key'));
 assert.ok(level.rules!.requiredKeys!.includes('relay-key'));assert.equal(level.stars.three,patch.moves);
 if(patch.twist){const wait=level.plan!.findIndex(a=>a.waitFor==='key:relay-key');assert.equal(validateSolution({...level,plan:level.plan!.filter((_,i)=>i!==wait+1)}).success,false);}
 // Sample human response delays, not only the solver's instantaneous checkpoint.
 const live=new RingSession();live.selectCustom(level);
 for(const action of level.plan!){
  if(action.ring!==undefined){assert.ok(live.begin(action.ring));assert.ok(live.preview(action.ring,action.to!));live.commit();}
  if(action.play)live.play();
  if(action.waitFor){for(let t=0;t<1920&&!live.world!.finished&&!reachedCondition(live.world!,action.waitFor);t++)live.world!.step();if(action.waitFor==='key:relay-key')break;}
 }
 const checkpoint=live.world!.clone();for(const ticks of [0,30,60,120,240]){live.world=checkpoint.clone();for(let t=0;t<ticks&&!live.world.finished;t++)live.world.step();assert.ok(validatePlanFromSession(live).check.success,`human delay ${ticks/120}s`);}
 s.restart();assert.equal(s.canRotate(patch.lock.ring),false);assert.equal(s.moves,0);
});
test('bounded solution refinement removes a redundant gesture, preserves source and never claims a global minimum',()=>{
 const level=structuredClone(LEVELS[40]),first=level.plan!.find(a=>a.ring!==undefined)!;
 level.plan!.unshift({...first,to:level.rings[first.ring!].initial});const original=JSON.stringify(level),result=refineVerifiedPlan(level,8);
 assert.equal(result.check.success,true);assert.ok(result.removed>=1);assert.ok(result.trials<=8);assert.equal(result.globalMinimum,false);assert.equal(JSON.stringify(level),original);
});
test('solution search preserves key/lock timing and obeys its finite trial budget',()=>{
 const level=LEVELS[100],result=refineVerifiedPlan(level,3);assert.ok(result.check.success);assert.ok(result.trials<=3);
 assert.equal(validateSolution({...level,plan:result.plan}).success,true);
});


test('settling probes certify future real physics without mutating the live world',()=>{
 const level=LEVELS[102],session=new RingSession();session.selectCustom(level);
 for(const a of level.plan!){if(a.ring!==undefined){session.begin(a.ring);session.preview(a.ring,a.to!);session.commit();}if(a.play)session.play();if(a.waitFor){while(!session.world!.finished&&!reachedCondition(session.world!,a.waitFor))session.world!.step();if(a.waitFor==='key:relay-key')break;}}
 for(let i=0;i<6;i++)session.world!.step();const before=JSON.stringify(session.world!.states),time=session.world!.time;
 const wait=verifiedSettlingWait(session);assert.ok(wait?.check.success);assert.ok(wait.ticks<=120);assert.equal(JSON.stringify(session.world!.states),before);assert.equal(session.world!.time,time);
});


