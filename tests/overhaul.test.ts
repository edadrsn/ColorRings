import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,type Level} from '../src/levels.ts';
import {RingSession} from '../src/engine.ts';
import {PhysicsWorld} from '../src/physics.ts';
import {reachedCondition,validateSolution,validatePlanFromSession} from '../src/solutions.ts';
import {advanceAtRate,liveRate} from '../src/clock.ts';
import {SolutionRecording,SolutionPlayback} from '../src/playback.ts';
import {LAB_LEVELS,LIVE_LEVELS} from '../src/modes.ts';
import {SKINS} from '../src/cosmetics.ts';
import {freshProgress,loadProgress,saveProgress,buySkin,awardCompletion} from '../src/progress.ts';
import {claimAchievements,isLevelUnlocked} from '../src/meta.ts';
import {statisticsView,recordVictory,liveScore} from '../src/statistics.ts';
import {paintMotif} from '../src/skin-motifs.ts';
import {createMotionPreview} from '../src/preview.ts';

/** Produce actual target inputs keyed to fixed physics ticks, not wall-clock frames. */
function certifiedTimeline(level:Level){
  const session=new RingSession();session.selectCustom(level);let ticks=0;let initial:number[]=[];
  const commands:{tick:number;angles:number[]}[]=[];
  for(const action of level.plan!){
    if(action.ring!==undefined){assert.equal(session.begin(action.ring),true);assert.equal(session.preview(action.ring,action.to!),true);session.commit();if(session.world)commands.push({tick:ticks,angles:[...session.angles]});}
    if(action.play&&!session.world){const world=session.play()!;initial=[...world.angles];world.onStep=()=>ticks++;}
    if(action.waitFor){const world=session.world!;for(let tick=0;tick<1920&&!world.finished&&!reachedCondition(world,action.waitFor);tick++)world.step();assert.ok(reachedCondition(world,action.waitFor));}
  }
  assert.ok(session.world!.result().success);
  return {initial,commands,states:session.world!.states,result:session.world!.result()};
}
for(const level of LEVELS.filter(l=>l.mastery))test(`mastery ${level.mastery}: 2x preserves the certified fixed-step outcome`,()=>{
  const timeline=certifiedTimeline(level),world=new PhysicsWorld(timeline.initial,level);let tick=0,cursor=0;
  const inputs=()=>{while(cursor<timeline.commands.length&&timeline.commands[cursor].tick===tick)world.setAngles(timeline.commands[cursor++].angles);};
  inputs();world.onStep=()=>{tick++;inputs();};
  for(let frame=0;frame<60*60&&!world.finished;frame++)advanceAtRate(world,1/60,2);
  assert.deepEqual(world.states,timeline.states);assert.deepEqual(world.result(),timeline.result);
});
test('late mastery requires several physical release phases and more planned decisions than stage five',()=>{
  const easy=validateSolution(LEVELS[44]),hard=validateSolution(LEVELS[89]),last=validateSolution(LEVELS[139]);
  assert.equal(easy.moves,4);assert.equal(easy.steps.length,2);assert.ok(hard.moves>=7);assert.ok(last.moves>=8);assert.ok(hard.steps.length>=4);assert.ok(last.steps.length>=5);
  const targets=LEVELS[89].sequence!.map(step=>step.angles.at(-1));assert.ok(new Set(targets).size>=4);
});
test('no sampled static outer-ring orientation solves mastery 50 even with inner rings opened',()=>{
  const level=LEVELS[89];for(let angle=0;angle<360;angle+=5){const world=new PhysicsWorld([0,0,0,angle],level);for(let tick=0;tick<120*8&&!world.finished;tick++)world.step();assert.equal(world.result().success,false,`static ${angle}`);}
});
for(const level of LAB_LEVELS)test(`lab ${level.id}: experimental mechanic is independently certified`,()=>assert.equal(validateSolution(level).success,true));
test('one drag applies linked displacement once, not once per pointer event, and Undo restores both rings',()=>{
  const session=new RingSession();session.selectCustom(LAB_LEVELS[1]);const initial=[...session.angles];session.begin(0);session.preview(0,300);session.preview(0,330);session.preview(0,0);session.commit();
  assert.equal(session.moves,1);assert.equal(session.angles[1],15);assert.equal(session.ringMoves[0],1);assert.equal(session.ringMoves[1]??0,0);assert.equal(session.undo(),true);assert.deepEqual(session.angles,initial);
});
test('ring-specific movement limits cannot be bypassed by another gesture and Restart restores them',()=>{
  const session=new RingSession();session.selectCustom(LAB_LEVELS[2]);assert.equal(session.rotate(0,30),true);assert.equal(session.rotate(0,30),false);session.restart();assert.equal(session.rotate(0,30),true);
});
test('splitter creates exactly one extra physical ball and correct bucket counts; clone is independent',()=>{
  const check=validateSolution(LAB_LEVELS[0]);assert.ok(check.success);assert.equal(check.world.states.length,3);assert.equal(check.world.runs.filter(r=>r.cup==='pink').length,2);
  const clone=check.world.clone();assert.deepEqual(clone.states,check.world.states);clone.states[2].x=0;assert.notEqual(check.world.states[2].x,0);
  assert.equal(validateSolution({...LAB_LEVELS[0],splitters:[]}).success,false);
});
test('splitter state is restored by mechanical Undo and reset for a new attempt',()=>{
  const session=new RingSession();session.selectCustom(LAB_LEVELS[0]);session.begin();session.preview(0,0);session.preview(1,0);session.commit();const world=session.play()!;
  session.begin(0);session.preview(0,5);for(let tick=0;tick<1200&&world.states.length===2&&!world.finished;tick++)world.step();assert.equal(world.states.length,3);session.commit();session.undo();assert.equal(session.world!.states.length,2);assert.equal(session.world!.split.size,0);session.restart();assert.equal(session.play()!.states.length,2);
});

test('a short motion preview can include a newborn ball without mutating the level',()=>{
  const base=LAB_LEVELS[0],ball=base.balls[0],level={...base,splitters:[{...base.splitters![0],x:ball.x,y:ball.y+5}]};
  const before=JSON.stringify(level),paths=createMotionPreview(level,level.solution);
  assert.equal(paths.length,3);assert.equal(JSON.stringify(level),before);assert.ok(paths.every(path=>path.points.length>0));
});

test('mastery 100 remains solvable when the player waits twenty seconds at every checkpoint',()=>{
  const session=new RingSession();session.selectCustom(LEVELS[139]);
  for(const action of session.level.plan!){
    if(action.ring!==undefined){assert.ok(session.begin(action.ring));assert.ok(session.preview(action.ring,action.to!));session.commit();}
    if(action.play&&!session.world)session.play();
    if(action.waitFor){
      let ticks=0;while(ticks++<1920&&!session.world!.finished&&!reachedCondition(session.world!,action.waitFor))session.world!.step();
      assert.ok(reachedCondition(session.world!,action.waitFor),action.waitFor);
      for(let tick=0;tick<2400&&!session.world!.finished;tick++)session.world!.step();
    }
  }
  assert.ok(session.world!.result().success);assert.equal(session.moves,8);
});
test('replay includes planning gestures and reproduces actual successful split trajectory without touching progress',()=>{
  const level=LAB_LEVELS[0],recording=new SolutionRecording(level,[{from:level.rings.map(r=>r.initial),to:[0,0]}]),world=new PhysicsWorld([0,0],level);recording.attach(world);while(!world.finished&&world.time<16)world.step();assert.ok(recording.playable);
  const progress=freshProgress(),saved=JSON.stringify(progress),player=new SolutionPlayback(recording);assert.deepEqual(player.world.angles,level.rings.map(r=>(r.initial%360+360)%360));
  while(!player.finished)player.advance(1/60);assert.deepEqual(player.world.states,world.states);assert.deepEqual(player.world.angles,world.angles);assert.ok(player.world.result().success);assert.equal(JSON.stringify(progress),saved);
});
test('replay of captured Undo can move backwards in simulation time without altering source frames',()=>{
  const level=LEVELS[23],recording=new SolutionRecording(level),world=new PhysicsWorld(level.solution,level);recording.capture(world);world.collected.add('test');world.time=2;recording.capture(world);world.collected.clear();world.time=.5;recording.capture(world);
  const before=JSON.stringify(recording.frames),player=new SolutionPlayback(recording);player.advance(1/120);assert.ok(player.world.collected.has('test'));player.advance(1/120);assert.equal(player.world.collected.has('test'),false);assert.equal(player.world.time,.5);assert.equal(JSON.stringify(recording.frames),before);
});

test('a long recorded attempt keeps bounded frames and its successful ending',()=>{
  const level=LEVELS[0],recording=new SolutionRecording(level),world=new PhysicsWorld(level.solution,level);
  for(let tick=0;tick<37000;tick++)recording.capture(world);
  recording.attach(world);while(!world.finished&&world.time<16)world.step();
  assert.ok(recording.compressed);assert.ok(recording.frames.length<36000);assert.ok(recording.playable);
  const player=new SolutionPlayback(recording);while(!player.finished)player.advance(.2);
  assert.deepEqual(player.world.states,world.states);assert.ok(player.world.result().success);
});
test('new statistics use measured wins and do not invent historical move or time data',()=>{
  const old=loadProgress({getItem:()=>JSON.stringify({version:3,coins:210,completed:[1,2,3],stars:{1:3},owned:['classic','pearl']}),setItem:()=>{}});assert.equal(statisticsView(old).averageMoves,null);assert.equal(old.statistics.seconds,0);recordVictory(old,6);recordVictory(old,10);old.statistics.seconds=12.5;assert.equal(statisticsView(old).averageMoves,8);assert.equal(statisticsView(old).seconds,12.5);assert.equal(old.coins,210);
});
test('mastery unlocks independently while preserving classic progression and all v3 inventory',()=>{
  const p=loadProgress({getItem:()=>JSON.stringify({version:3,coins:210,currentLevel:8,completed:[1,2,3,4,5,6,7],unlocked:8,stars:{1:3},owned:['classic','pearl'],theme:'candy',themes:['classic','candy']}),setItem:()=>{}});
  assert.ok(isLevelUnlocked(p,LEVELS[40]));assert.equal(isLevelUnlocked(p,LEVELS[41]),false);awardCompletion(p,LEVELS[40],2);assert.equal(p.masteryUnlocked,2);assert.equal(p.unlocked,8);assert.ok(isLevelUnlocked(p,LEVELS[41]));assert.equal(p.skin,'classic');assert.ok(p.owned.includes('pearl'));assert.equal(p.theme,'candy');
});
test('all new statistics, live records, speed and mastery progress survive a v4 round trip',()=>{
  const p=freshProgress();p.statistics={wins:8,moves:48,seconds:154};p.liveBest={1:1200};p.liveTutorialDone=true;p.speed=2;p.masteryUnlocked=17;let text='';const store={getItem:()=>text,setItem:(_key:string,value:string)=>text=value};saveProgress(p,store);assert.deepEqual(loadProgress(store),p);
});
test('twenty distinct appearances retain old ids and achievement-only skins cannot be bought',()=>{
  assert.equal(SKINS.length,23);assert.equal(new Set(SKINS.map(s=>s.id)).size,23);assert.deepEqual(SKINS.slice(0,4).map(s=>s.id),['classic','pearl','neon','stardust']);
  const p=freshProgress();p.coins=999;assert.equal(buySkin(p,'panda'),'invalid');p.noHintWins=Array.from({length:10},(_,i)=>i+1);claimAchievements(p);assert.ok(p.owned.includes('panda'));const coins=p.coins;claimAchievements(p);assert.equal(p.coins,coins);
});
test('sixteen new motifs produce distinct original Canvas paths, independent of physical radius',()=>{
  const signatures=SKINS.slice(4).map(skin=>{const calls:unknown[]=[];const ctx=new Proxy({}, {get:(_target,key)=>(...args:unknown[])=>calls.push([key,...args]),set:(_target,key,value)=>{calls.push([key,value]);return true;}}) as CanvasRenderingContext2D;paintMotif(ctx,skin.id);return JSON.stringify(calls);});assert.equal(new Set(signatures).size,19);
});
test('Live has five increasing starting rates, a separate score and a physically valid steering path',()=>{
  assert.equal(LIVE_LEVELS.length,5);assert.ok(liveRate(1)<liveRate(5));assert.ok(liveScore(2,10,4)>liveScore(8,30,4));
  for(const level of LIVE_LEVELS)assert.equal(validateSolution(level,new PhysicsWorld(level.rings.map(r=>r.initial),level)).success,true);
});
test('live plan assistance validates the remaining linked state and budgets without mutating it',()=>{
  const session=new RingSession();session.selectCustom(LEVELS[139]);const before=JSON.stringify({angles:session.angles,moves:session.moves});const result=validatePlanFromSession(session);assert.ok(result.check.success);assert.equal(result.directive?.ring,1);assert.equal(JSON.stringify({angles:session.angles,moves:session.moves}),before);
});
