import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,type Level} from '../src/levels.ts';
import {PhysicsWorld,DT} from '../src/physics.ts';
import {RingSession} from '../src/engine.ts';
import {validateSolution} from '../src/solutions.ts';
import {CHALLENGES,LIVE_LEVELS,dailyLevel,localDateKey} from '../src/modes.ts';
import {freshProgress,awardCompletion,buyTheme,loadProgress,saveProgress} from '../src/progress.ts';
import {awardPerfect,awardChallenge,awardDaily,dailyStreak,claimAchievements,unlockedThrough} from '../src/meta.ts';
import {bucketTarget,bucketDelivered} from '../src/buckets.ts';
import {movingSegments} from '../src/mechanics.ts';

for(const level of CHALLENGES)test(`Challenge ${level.id}: physical solution fits movement rules`,()=>{
  assert.equal(validateSolution(level).success,true);
  const moves=level.rings.filter((r,i)=>r.initial!==level.solution[i]).length;
  assert.ok(moves<=level.challenge!.maxMoves);assert.ok(!level.sequence);
});
for(const level of LIVE_LEVELS)test(`Live ${level.id}: initial moving world can reach certified solution`,()=>{
  const world=new PhysicsWorld(level.rings.map(r=>r.initial),level);
  assert.equal(validateSolution(level,world).success,true);
});
test('daily selection is stable on the same date, changes the next day, and every pool entry solves',()=>{
  assert.deepEqual(dailyLevel('2026-10-26'),dailyLevel('2026-10-26'));assert.notEqual(dailyLevel('2026-10-26').name,dailyLevel('2026-10-27').name);
  for(let day=1;day<=20;day++)assert.equal(validateSolution(dailyLevel(`2026-10-${String(day).padStart(2,'0')}`)).success,true);
  assert.equal(localDateKey(new Date(2026,9,26,23,59)),'2026-10-26');
});
test('keys open only assigned doors; clone and Restart isolate mechanism states',()=>{
  const level=LEVELS[29],world=new PhysicsWorld(level.solution,level);
  world.states[0].x=188;world.states[0].y=272;world.step();assert.ok(world.collected.has('a'));assert.ok(world.unlocked.has('a-door'));assert.equal(world.unlocked.has('b-door'),false);
  const clone=world.clone();clone.unlocked.add('b-door');assert.equal(world.unlocked.has('b-door'),false);
  const session=new RingSession();session.selectLevel(29);session.play()!.collected.add('a');session.restart();assert.equal(session.world,null);assert.equal(session.play()!.collected.size,0);
});
test('locked rings reject planning and live rotation until their key is collected',()=>{
  const session=new RingSession();session.selectLevel(24);assert.equal(session.rotate(1,15),false);
  const world=session.play()!;assert.equal(session.rotate(1,15),false);world.states[0].x=188;world.states[0].y=272;world.step();
  assert.equal(session.rotate(1,15),true);
});
test('mechanical Undo restores key, color, time and delivered state from the gesture start',()=>{
  const session=new RingSession();session.selectLevel(26);session.begin();session.preview(0,session.level.solution[0]);session.commit();
  const world=session.play()!;const before=JSON.stringify(world.states),time=world.time;
  assert.equal(session.begin(1),true);session.preview(1,0);world.step();world.collected.add('test');world.unlocked.add('test');world.states[0].color='purple';session.commit();
  assert.equal(session.undo(),true);assert.equal(session.world!.time,time);assert.equal(JSON.stringify(session.world!.states),before);assert.equal(session.world!.collected.has('test'),false);
});
test('color gates determine final matching cup and bucket targets; fills survive Undo and reset',()=>{
  const level=LEVELS[26],result=validateSolution(level);assert.equal(result.success,true);assert.equal(result.world.states[0].color,'green');assert.equal(result.world.runs[0].cup,'green');
  assert.equal(bucketTarget(level,'green'),1);assert.equal(bucketDelivered(result.world,'green'),1);assert.equal(bucketDelivered(new PhysicsWorld(level.solution,level),'green'),0);
  assert.equal(bucketTarget(LEVELS[6],'pink'),2);
});
test('one-way gate physically permits outward travel and blocks inward travel',()=>{
  const base=LEVELS[0],level:Level={...base,rings:[{radius:126,width:12,gaps:[{angle:90,size:90}],initial:0}],balls:[{color:'pink',x:230,y:400}],oneWays:[{ring:0,gap:0,direction:'outward'}]};
  const outward=new PhysicsWorld([0],level);outward.states[0].y=390;outward.states[0].vy=240;for(let i=0;i<45;i++)outward.step();assert.ok(outward.states[0].y>430);
  const inward=new PhysicsWorld([0],level);inward.states[0].y=444;inward.states[0].vy=-320;for(let i=0;i<30;i++)inward.step();assert.ok(Math.hypot(inward.states[0].x-270,inward.states[0].y-280)>=126+14+6-.5);
});
test('moving obstacles and color/lock scenes remain deterministic at 30, 60 and 120 fps',()=>{
  for(const id of [24,27,29,36,40]){
    const level=LEVELS[id-1],certificate=validateSolution(level);assert.ok(certificate.success);
    const commands:{tick:number;angles:number[]}[]=[];let boundary=0;certificate.steps.forEach((step,i)=>{if(i)commands.push({tick:boundary,angles:step.angles});boundary+=Math.round(step.seconds*120);});
    const run=(fps:number)=>{const world=new PhysicsWorld(certificate.steps[0].angles,level);let ticks=0,cursor=0;const input=()=>{while(cursor<commands.length&&commands[cursor].tick===ticks)world.setAngles(commands[cursor++].angles);};input();world.onStep=()=>{ticks++;input();};for(let i=0;i<fps*32&&!world.finished;i++)world.advance(1/fps);return {states:world.states,collected:[...world.collected],result:world.result()};};
    assert.deepEqual(run(30),run(60));assert.deepEqual(run(60),run(120));assert.equal(run(60).result.success,true);
  }
});
test('Perfect Flow requires no hints and goal moves, pays exactly once independently of stars',()=>{
  const p=freshProgress(),level=LEVELS[0];assert.equal(awardPerfect(p,level,1,1),0);assert.equal(awardPerfect(p,level,999,0),0);
  awardCompletion(p,level,1);const coins=p.coins;assert.equal(awardPerfect(p,level,1,0),10);assert.equal(awardPerfect(p,level,1,0),0);assert.equal(p.coins,coins+10);assert.equal(p.stars[1],3);
});
test('challenge constraints, hints, ring budgets and normal progression are separate',()=>{
  const session=new RingSession();session.selectCustom(CHALLENGES[3]);assert.equal(session.rotate(0,30),true);assert.equal(session.rotate(0,30),false);assert.equal(session.rotate(1,30),true);assert.equal(session.rotate(1,30),false);
  const p=freshProgress();assert.equal(awardChallenge(p,1,CHALLENGES[0],3),35);assert.equal(awardChallenge(p,1,CHALLENGES[0],3),0);assert.equal(p.completed.length,0);assert.deepEqual(p.stars,{});
});
test('daily reward is once per calendar key and streak handles month boundaries and missing days',()=>{
  const p=freshProgress();assert.equal(awardDaily(p,'2026-09-30',3),45);assert.equal(awardDaily(p,'2026-09-30',3),0);awardDaily(p,'2026-10-01',2);assert.equal(dailyStreak(p,'2026-10-01'),2);assert.equal(dailyStreak(p,'2026-10-02'),2);assert.equal(dailyStreak(p,'2026-10-03'),0);
});
test('theme purchases are permanent, cannot overdraft or charge twice, and achievements pay once',()=>{
  const p=freshProgress();assert.equal(buyTheme(p,'neon'),'insufficient');p.coins=500;assert.equal(buyTheme(p,'neon'),'bought');assert.equal(p.coins,400);assert.equal(buyTheme(p,'neon'),'owned');
  buyTheme(p,'candy');const reward=claimAchievements(p);assert.ok(reward.names.includes('Style Master'));assert.equal(claimAchievements(p).gold,0);
  let text='';const store={getItem:()=>text,setItem:(_key:string,value:string)=>text=value};saveProgress(p,store);assert.deepEqual(loadProgress(store),p);
});
test('legacy version two keeps original twenty unlocked, and new accounts unlock sequentially',()=>{
  const p=loadProgress({getItem:()=>JSON.stringify({version:2,coins:470,completed:[1,2],stars:{1:3},owned:['classic','pearl'],skin:'pearl'}),setItem:()=>{}});
  assert.equal(unlockedThrough(p),20);assert.equal(p.coins,470);assert.equal(p.skin,'pearl');
  const fresh=freshProgress();assert.equal(unlockedThrough(fresh),1);awardCompletion(fresh,LEVELS[0],2);assert.equal(unlockedThrough(fresh),2);
});
test('a locked passage remains a solid collision wall without its assigned key',()=>{
  const level=LEVELS[23];assert.equal(validateSolution(level).success,true);assert.equal(validateSolution({...level,keys:[]}).success,false);
});
test('moving circular barriers never produce NaN or let a ball pass through their center',()=>{
  const level:Level={...LEVELS[0],rings:[],dividers:[],balls:[{color:'pink',x:270,y:370}],obstacles:[{id:'test',x:270,y:460,axis:'x',amplitude:24,period:3,phase:0,radius:10}],solution:[]};
  const world=new PhysicsWorld([],level);
  for(let step=0;step<360&&!world.finished;step++){world.step();const ball=world.states[0],obstacle=movingSegments(level,world.time)[0];assert.ok(Number.isFinite(ball.x)&&Number.isFinite(ball.y));assert.ok(Math.hypot(ball.x-obstacle.a.x,ball.y-obstacle.a.y)>=24-.1);}
});
test('an actual wrong-color landing finishes as failure, without a successful result',()=>{
  const level:Level={...LEVELS[0],rings:[],dividers:[],solution:[],balls:[{color:'blue',x:180,y:669}]};
  const session=new RingSession();session.selectCustom(level);session.play()!.step();session.finish();assert.equal(session.phase,'failure');assert.equal(session.result!.balls[0].outcome,'wrong-cup');assert.equal(session.result!.success,false);
});
test('all ten achievements derive from stored results and every claim is idempotent',()=>{
  const p=freshProgress();p.completed=LEVELS.map(l=>l.id);p.stars=Object.fromEntries(LEVELS.map(l=>[l.id,3]));p.perfect=[1,2,3,4,5];p.noHintWins=LEVELS.slice(0,10).map(l=>l.id);p.owned=['classic','pearl','neon'];p.themes=['classic','neon','candy'];p.challengeStars={1:3,2:3,3:3,4:3,5:3};
  for(let day=1;day<=7;day++)p.daily[`2026-10-0${day}`]=3;
  assert.equal(claimAchievements(p).names.length,10);const coins=p.coins;assert.equal(claimAchievements(p).gold,0);assert.equal(p.coins,coins);
});
test('invalid daily dates cannot interrupt migration of preferences or erase other records',()=>{
  const p=loadProgress({getItem:()=>JSON.stringify({version:3,coins:99,theme:'neon',themes:['classic','neon'],daily:{'2026-99-01':3,'2026-02-30':2,'2026-10-26':3},music:true,reducedMotion:true}),setItem:()=>{}});
  assert.deepEqual(p.daily,{'2026-10-26':3});assert.equal(p.music,true);assert.equal(p.reducedMotion,true);assert.equal(p.coins,99);assert.equal(p.theme,'neon');
});
