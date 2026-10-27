import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVEL,LEVELS,BOARD,normalize} from '../src/levels.ts';
import {PhysicsWorld,simulate,ringSegments,classifyCup,BALL_RADIUS,DT} from '../src/physics.ts';
import {RingSession} from '../src/engine.ts';
import {pickRing,rotationDelta,snapRotation,starRating} from '../src/presentation.ts';
import {LEGACY_SEQUENCE} from './legacy-sequence.ts';

test('first prototype contains exactly two nested rings, two balls and two matching buckets',()=>{
  assert.equal(LEVEL.rings.length,2);assert.ok(LEVEL.rings[0].radius<LEVEL.rings[1].radius);
  assert.equal(LEVEL.balls.length,2);assert.equal(LEVEL.cups.length,2);
  for(const ball of LEVEL.balls)assert.ok(LEVEL.cups.some(cup=>cup.color===ball.color));
});
test('the known physical solution rolls through both rings into both correct buckets',()=>{
  const result=simulate([0,0]);assert.equal(result.success,true);
  for(const run of result.balls){assert.equal(run.outcome,'correct');assert.equal(run.cup,run.color);assert.deepEqual(run.crossedRings,[0,1]);assert.ok(run.contacts>=2);}
});
test('the initial scrambled rings retain balls behind real walls',()=>{
  const result=simulate(LEVEL.rings.map(r=>r.initial));assert.equal(result.success,false);
  assert.ok(result.balls.every(ball=>ball.outcome==='stuck'&&ball.crossedRings.length===0));assert.ok(result.duration<=12);
});
test('opening only the inner ring cannot bypass a closed outer ring',()=>{
  const result=simulate([0,105]);assert.equal(result.success,false);
  assert.ok(result.balls.every(ball=>ball.crossedRings.includes(0)&&!ball.crossedRings.includes(1)));
});
test('correct, incorrect-color and missed bucket landings are distinguished',()=>{
  assert.equal(classifyCup(LEVEL.cups[0].x,'pink').outcome,'correct');
  assert.equal(classifyCup(LEVEL.cups[1].x,'pink').outcome,'wrong-cup');
  assert.equal(classifyCup(270,'pink').outcome,'missed');
});
test('same angles produce identical physics independent of render frame rate',()=>assert.deepEqual(simulate([0,0]),simulate([360,-360])));
test('rotating a ring rotates its collision geometry around the same center',()=>{
  const a=ringSegments(0,0)[0].a,b=ringSegments(0,90)[0].a;
  assert.ok(Math.abs(b.x-(BOARD.center.x-(a.y-BOARD.center.y)))<.00001);
  assert.ok(Math.abs(b.y-(BOARD.center.y+(a.x-BOARD.center.x)))<.00001);
});
test('neither ball tunnels through the circular walls in the known solution',()=>{
  const walls=[...ringSegments(0,0),...ringSegments(1,0)];
  for(const run of simulate([0,0]).balls)for(const p of run.frames)for(const segment of walls){
    const dx=segment.b.x-segment.a.x,dy=segment.b.y-segment.a.y;
    const t=Math.max(0,Math.min(1,((p.x-segment.a.x)*dx+(p.y-segment.a.y)*dy)/(dx*dx+dy*dy)));
    const distance=Math.hypot(p.x-segment.a.x-t*dx,p.y-segment.a.y-t*dy);
    assert.ok(distance>=BALL_RADIUS+segment.radius-.4,`wall penetration: ${distance}`);
  }
});
test('trajectories remain finite, bounded in time and cannot randomly disappear',()=>{
  for(const configuration of [[0,0],[270,105],[0,105]]){
    const result=simulate(configuration);assert.ok(result.duration<=12+DT);
    for(const run of result.balls){assert.ok(run.frames.length>0);for(const p of run.frames)assert.ok(Number.isFinite(p.x)&&Number.isFinite(p.y));}
  }
});
test('Undo changes only the ring edited most recently',()=>{
  const s=new RingSession(),initial=[...s.angles];s.rotate(0);s.rotate(1);
  assert.equal(s.undo(),true);assert.equal(s.angles[0],normalize(initial[0]+30));assert.equal(s.angles[1],initial[1]);
  assert.equal(s.undo(),true);assert.deepEqual(s.angles,initial);assert.equal(s.undo(),false);
});
test('a continuous drag contributes one undo entry, not one per pointer event',()=>{
  const s=new RingSession(),initial=[...s.angles];s.begin();for(let i=0;i<100;i++)s.preview(0,i);s.commit();
  assert.equal(s.history.length,1);s.undo();assert.deepEqual(s.angles,initial);
});
test('touching without moving does not create a redundant undo entry',()=>{const s=new RingSession();s.begin();s.commit();assert.equal(s.history.length,0);});
test('rings and Undo remain available after Play without restarting the balls',()=>{
  const s=new RingSession();const world=s.play()!;for(let i=0;i<120;i++)world.step();
  const before=world.time;assert.equal(s.rotate(1),true);assert.equal(s.preview(0,90),true);assert.equal(s.undo(),true);
  assert.equal(s.world,world);assert.equal(world.time,before);assert.equal(s.play(),null);assert.equal(s.phase,'running');
});
test('Restart cancels an active simulation and clears the full undo history',()=>{
  const s=new RingSession();s.rotate(0);s.play();s.restart();assert.equal(s.phase,'planning');assert.equal(s.result,null);assert.equal(s.history.length,0);assert.deepEqual(s.angles,s.level.rings.map(r=>normalize(r.initial)));
});
test('Retry preserves the planned ring angles for correction',()=>{
  const s=new RingSession();s.rotate(1);const angles=[...s.angles];s.play();s.finish();s.retry();assert.equal(s.phase,'planning');assert.deepEqual(s.angles,angles);
});
test('completion requires both balls in the correct buckets',()=>{
  const s=new RingSession();s.begin();s.preview(0,0);s.preview(1,0);s.commit();const world=s.play()!;
  s.finish();assert.equal(s.phase,'running');for(let i=0;i<120*5&&!world.finished;i++)world.step();s.finish();assert.equal(s.phase,'success');
});
test('intro levels are solved by their independently validated physical configurations',()=>{
  for(const level of LEVELS.filter(level=>!level.sequence)){assert.equal(simulate(level.solution,level).success,true);assert.equal(simulate(level.rings.map(r=>r.initial),level).success,false);}
});
test('waiting balls stay alive until the player opens passages during play',()=>{
  for(const level of LEVELS.slice(0,2)){
    const world=new PhysicsWorld(level.rings.map(r=>r.initial),level);
    for(let i=0;i<120*15;i++)world.step();assert.equal(world.finished,false);
    world.setAngles([level.solution[0],world.targets[1]]);for(let i=0;i<180;i++)world.step();
    assert.ok(world.runs.every(run=>run.crossedRings.includes(0)&&!run.crossedRings.includes(1)));
    world.setAngles(level.solution);for(let i=0;i<120*10&&!world.finished;i++)world.step();assert.equal(world.result().success,true);
  }
});
test('large live rotations are swept in small physical steps rather than teleporting walls',()=>{
  const world=new PhysicsWorld([270,105]);world.setAngles([0,0]);world.step();
  assert.equal(world.angles[0],272);assert.equal(world.angles[1],103);
});
test('the same fixed-step input timeline gives the same result at 30, 60 and 120 FPS',()=>{
  function timeline(fps:number){const w=new PhysicsWorld([270,105]);for(let i=0;i<fps;i++)w.advance(1/fps);w.setAngles([0,0]);for(let i=0;i<fps*8&&!w.finished;i++)w.advance(1/fps);return w.result();}
  assert.deepEqual(timeline(30),timeline(60));assert.deepEqual(timeline(60),timeline(120));assert.equal(timeline(60).success,true);
});
test('level changes cancel a live world and reset only the selected level',()=>{
  const session=new RingSession();const old=session.play()!;old.advance(.1);session.selectLevel(1);
  assert.equal(session.world,null);assert.equal(session.level.id,2);assert.equal(session.phase,'planning');
  assert.deepEqual(session.angles,LEVELS[1].rings.map(r=>normalize(r.initial)));session.rotate(0);session.restart();assert.equal(session.level.id,2);
});
test('invalid controls do not corrupt the ring state',()=>{
  const s=new RingSession(),initial=[...s.angles];assert.equal(s.rotate(99),false);assert.equal(s.preview(0,NaN),false);assert.deepEqual(s.angles,initial);
});

test('radial pocket walls rotate with their parent ring throughout the campaign',()=>{
  for(const level of LEVELS){assert.ok(level.rings.some(r=>r.baffles?.length));for(let i=0;i<level.rings.length;i++){
    const original=ringSegments(i,0,level).filter(segment=>segment.kind==='baffle');
    const rotated=ringSegments(i,90,level).filter(segment=>segment.kind==='baffle');
    assert.equal(original.length,rotated.length);
    original.forEach((segment,j)=>{
      assert.equal(segment.ring,i);
      assert.ok(Math.abs(rotated[j].b.x-(BOARD.center.x-(segment.b.y-BOARD.center.y)))<.00001);
      assert.ok(Math.abs(rotated[j].b.y-(BOARD.center.y+(segment.b.x-BOARD.center.x)))<.00001);
    });
  }}
});
test('a radial wall physically catches a falling ball; removing it opens that pocket',()=>{
  function drop(withBaffle:boolean){
    const level=structuredClone(LEVEL);level.balls[0].x=408;level.balls[0].y=235;
    if(!withBaffle)level.rings[0].baffles=[];
    const world=new PhysicsWorld([0,0],level);for(let i=0;i<60;i++)world.step();return world;
  }
  const blocked=drop(true),open=drop(false);
  assert.ok(blocked.states[0].y<280-BALL_RADIUS);assert.ok(blocked.runs[0].contacts>0);
  assert.ok(open.states[0].y>300);assert.equal(open.runs[0].contacts,0);
});

test('sequential level sends one color home while the other is physically retained in a bay',()=>{
  const level=LEGACY_SEQUENCE,world=new PhysicsWorld(level.rings.map(r=>r.initial),level);
  world.setAngles(level.sequence![0].angles);
  for(let i=0;i<1200&&!world.states[0].done&&!world.finished;i++)world.step();
  assert.equal(world.runs[0].outcome,'correct');assert.equal(world.states[1].done,false);assert.equal(world.finished,false);
  for(let i=0;i<600;i++)world.step();
  assert.equal(world.states[1].done,false);assert.ok(world.states[1].y<500);assert.equal(world.result().success,false);
  world.setAngles(level.sequence![1].angles);
  for(let i=0;i<1200&&!world.finished;i++)world.step();assert.equal(world.result().success,true);
});
test('one fixed outer orientation cannot solve the sequential level even with the inner passage open',()=>{
  const level=LEGACY_SEQUENCE;
  for(let angle=0;angle<360;angle+=15)assert.equal(simulate([0,angle],level).success,false,`unexpected shortcut at ${angle}`);
});
test('both release orders are valid physical solutions, not a hardcoded pink-first rule',()=>{
  const level=LEGACY_SEQUENCE,world=new PhysicsWorld([0,345],level);
  for(let i=0;i<1200&&!world.states[1].done&&!world.finished;i++)world.step();
  assert.equal(world.runs[1].outcome,'correct');assert.equal(world.states[0].done,false);
  world.setAngles([0,15]);for(let i=0;i<1200&&!world.finished;i++)world.step();assert.equal(world.result().success,true);
});
test('Undo changes a pocket opening without rewinding a ball already in its bucket',()=>{
  const session=new RingSession();session.selectCustom(LEGACY_SEQUENCE);session.begin();session.preview(0,0);session.preview(1,15);session.commit();
  const world=session.play()!;for(let i=0;i<1200&&!world.states[0].done;i++)world.step();
  assert.equal(world.states[0].done,true);session.rotate(1,-30);assert.equal(session.angles[1],345);
  session.undo();assert.equal(session.angles[1],15);assert.equal(world.states[0].done,true);assert.equal(session.world,world);
  session.rotate(1,-30);for(let i=0;i<1200&&!world.finished;i++)world.step();session.finish();assert.equal(session.phase,'success');
});
test('redesigned third level selection and Restart preserve three layers and two exits',()=>{
  const session=new RingSession();assert.equal(session.selectLevel(2),true);session.rotate(1);session.restart();
  assert.equal(session.level.id,3);assert.equal(session.level.rings.length,3);assert.equal(session.level.rings[2].gaps.length,2);
  assert.deepEqual(session.angles,session.level.rings.map(r=>normalize(r.initial)));assert.equal(session.world,null);
});

// Presentation behavior that can be verified without a browser or a Canvas mock.
test('ring hit targets select inner/outer rings and ignore the center and empty page',()=>{
  assert.equal(pickRing({x:270+126,y:280},LEVEL),0);
  assert.equal(pickRing({x:270,y:280+213},LEVEL),1);
  assert.equal(pickRing({x:270,y:280},LEVEL),-1);
  assert.equal(pickRing({x:0,y:0},LEVEL),-1);
});
test('drag rotation crosses the +/-180 degree seam smoothly and release still snaps to 15 degrees',()=>{
  assert.equal(rotationDelta(179,-179),2);assert.equal(rotationDelta(-179,179),-2);
  assert.equal(snapRotation(358),0);assert.equal(snapRotation(22),15);assert.equal(snapRotation(24),30);
});
test('stars use committed gestures and Undo does not erase the move count',()=>{
  assert.equal(starRating(3),3);assert.equal(starRating(16),2);assert.equal(starRating(30),1);
  const session=new RingSession();session.begin();for(let i=0;i<100;i++)session.preview(0,i);session.commit();
  assert.equal(session.moves,1);session.undo();assert.equal(session.moves,1);session.restart();assert.equal(session.moves,0);
});
test('render interpolation exposes the previous physical state without changing the fixed-step solver',()=>{
  const world=new PhysicsWorld([0,0]),initial={...world.states[0]};world.advance(DT/2);
  assert.equal(world.states[0].y,initial.y);assert.ok(Math.abs(world.renderAlpha-.5)<1e-9);
  world.advance(DT);assert.equal(world.previous[0].y,initial.y);assert.ok(world.states[0].y>initial.y);
  assert.ok(Math.abs(world.renderAlpha-.5)<1e-9);
});
