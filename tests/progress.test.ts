import {test} from 'node:test';import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.ts';
import {freshProgress,loadProgress,saveProgress,awardCompletion,buySkin,equipSkin,SAVE_KEY} from '../src/progress.ts';
import {RingSession} from '../src/engine.ts';import {getVerifiedHint} from '../src/hints.ts';import {starRating} from '../src/presentation.ts';
import {LEGACY_SEQUENCE} from './legacy-sequence.ts';
const memory=()=>{let text:string|null=null;return {getItem:()=>text,setItem:(_key:string,value:string)=>{text=value;}};};
test('stars use each level data at all threshold boundaries',()=>{for(const level of LEVELS){assert.equal(starRating(level.stars.three,level.stars),3);assert.equal(starRating(level.stars.three+1,level.stars),2);assert.equal(starRating(level.stars.two,level.stars),2);assert.equal(starRating(level.stars.two+1,level.stars),1);}});
test('coins, stars, owned cosmetics, equipped skin and current level survive saving',()=>{
  const store=memory(),progress=freshProgress();awardCompletion(progress,LEVELS[0],2);progress.coins+=200;buySkin(progress,'neon');progress.currentLevel=17;progress.unlocked=17;
  assert.equal(saveProgress(progress,store),true);assert.deepEqual(loadProgress(store),progress);
});
test('legacy records migrate without losing coins or completed levels',()=>{
  const store=memory();store.setItem(SAVE_KEY,JSON.stringify({coins:75,completed:[1,2,3],stars:{1:3},sound:false}));const data=loadProgress(store);
  assert.equal(data.coins,75);assert.deepEqual(data.completed,[1,2,3]);assert.equal(data.stars[1],3);assert.equal(data.sound,false);assert.deepEqual(data.owned,['classic']);
});
test('invalid records and blocked storage fail safely',()=>{
  const store=memory();store.setItem(SAVE_KEY,'broken');assert.deepEqual(loadProgress(store),freshProgress());
  store.setItem(SAVE_KEY,JSON.stringify({coins:-100,owned:['fake'],skin:'neon',stars:{1:99},completed:[200]}));assert.deepEqual(loadProgress(store),freshProgress());
  assert.equal(saveProgress(freshProgress(),{getItem:()=>null,setItem:()=>{throw Error('blocked');}}),false);
});
test('replays cannot farm the same reward but a better star score gives a one-time bonus',()=>{
  const progress=freshProgress(),level=LEVELS[0];assert.equal(awardCompletion(progress,level,100).gold,level.reward);
  assert.equal(awardCompletion(progress,level,100).gold,0);assert.equal(awardCompletion(progress,level,1).gold,10);assert.equal(awardCompletion(progress,level,1).gold,0);
});
test('purchase is atomic and cannot charge twice, overdraft or equip an unowned skin',()=>{
  const progress=freshProgress();assert.equal(buySkin(progress,'pearl'),'insufficient');assert.equal(equipSkin(progress,'neon'),false);
  progress.coins=100;assert.equal(buySkin(progress,'pearl'),'bought');assert.equal(progress.coins,20);assert.equal(progress.skin,'pearl');
  assert.equal(buySkin(progress,'pearl'),'owned');assert.equal(progress.coins,20);assert.equal(buySkin(progress,'neon'),'insufficient');assert.equal(progress.coins,20);
});
for(const level of LEVELS)test(`hint ${level.id}: only a physically validated plan is offered`,()=>{
  const session=new RingSession();session.selectLevel(level.id-1);const before=[...session.angles],hint=getVerifiedHint(session);assert.ok(hint?.verified);assert.deepEqual(session.angles,before);
  if(level.plan){assert.equal(hint.ring,level.plan.find(action=>action.ring!==undefined)?.ring);assert.equal(hint.action,'align');}else assert.deepEqual(hint.angles,level.sequence?.[0].angles??level.solution);
});
test('live hints validate a copy without advancing the original world',()=>{
  const session=new RingSession();session.selectCustom(LEGACY_SEQUENCE);session.begin();session.preview(0,0);session.preview(1,15);session.commit();const world=session.play()!;
  for(let i=0;i<1200&&!world.states[0].done;i++)world.step();const before=JSON.stringify(world.states),time=world.time;
  const hint=getVerifiedHint(session);assert.equal(hint?.action,'align');assert.deepEqual(hint?.angles,[0,345]);assert.equal(JSON.stringify(world.states),before);assert.equal(world.time,time);
});
