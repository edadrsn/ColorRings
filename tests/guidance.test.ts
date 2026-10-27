import {test} from 'node:test';
import assert from 'node:assert/strict';
import {lessonForLevel,TutorialLesson} from '../src/tutorial.ts';
import {createMotionPreview,MotionPreviewCache,PREVIEW_DISTANCE,PREVIEW_STEPS} from '../src/preview.ts';
import {PhysicsWorld} from '../src/physics.ts';
import {LEVELS,type Level} from '../src/levels.ts';
import {freshProgress,loadProgress,saveProgress,SAVE_KEY} from '../src/progress.ts';

test('lesson one requires real selection, drag, alignment, Play and a successful puzzle',()=>{
 const lesson=new TutorialLesson(1);assert.equal(lesson.view?.kind,'select');
 lesson.handle({type:'select',ring:1});assert.equal(lesson.view?.kind,'rotate');
 lesson.handle({type:'rotate',ring:1});lesson.handle({type:'align',valid:false});assert.equal(lesson.view?.kind,'align');assert.equal(lesson.complete,false);
 lesson.handle({type:'align',valid:true});assert.equal(lesson.view?.kind,'play');
 lesson.handle({type:'play'});lesson.handle({type:'motion'});assert.equal(lesson.complete,false);assert.equal(lesson.view?.step,5);
 lesson.handle({type:'success'});assert.equal(lesson.complete,true);assert.equal(lesson.view,null);
});
test('lesson two waits for actual movement after Play, not just the Play click',()=>{
  const lesson=new TutorialLesson(2);lesson.handle({type:'motion'});assert.equal(lesson.complete,false);
  lesson.handle({type:'play'});assert.equal(lesson.complete,false);
  lesson.handle({type:'motion'});assert.equal(lesson.complete,true);
});
test('lesson three requires both independent rings, and accepts either order',()=>{
  for(const first of [0,1]){
    const lesson=new TutorialLesson(3);lesson.handle({type:'rotate',ring:first});lesson.handle({type:'rotate',ring:first});
    assert.equal(lesson.complete,false);assert.equal(lesson.view?.ring,first===0?1:0);
    lesson.handle({type:'rotate',ring:1-first});assert.equal(lesson.complete,true);
  }
});
test('skipping, reopening and non-tutorial levels do not trap or repeatedly prompt the player',()=>{
  const lesson=lessonForLevel(1,[])!;lesson.skip();assert.equal(lesson.view,null);
  assert.equal(lessonForLevel(1,[1]),null);assert.equal(lessonForLevel(4,[]),null);
  assert.equal(lessonForLevel(1,[])?.complete,false);
});
test('tutorial and preview settings round-trip without altering existing progress',()=>{
  const progress=freshProgress();progress.coins=470;progress.completed=[1,2,3,20];progress.stars={1:3,20:2};progress.unlocked=21;
  progress.owned.push('neon');progress.skin='neon';progress.tutorialDone=[1,3];progress.motionPreview=false;
  let text='';const store={getItem:()=>text,setItem:(_key:string,value:string)=>{text=value;}};
  assert.equal(saveProgress(progress,store),true);assert.deepEqual(loadProgress(store),progress);
});
test('old saves infer finished lessons; explicit replay state and invalid fields are respected',()=>{
  const old={coins:75,completed:[1,2,3,8],stars:{8:3},owned:['classic','pearl'],skin:'pearl'};
  const read=(value:unknown)=>loadProgress({getItem:()=>JSON.stringify(value),setItem:()=>{}});
  const migrated=read(old);assert.deepEqual(migrated.tutorialDone,[1,2,3,8]);assert.equal(migrated.coins,75);assert.equal(migrated.skin,'pearl');
  assert.deepEqual(read({...old,tutorialDone:[]}).tutorialDone,[]);
  assert.deepEqual(read({...old,tutorialDone:[1,1,'2',null,99,3]}).tutorialDone,[1,3]);
  assert.equal(SAVE_KEY,'spin-sort-v1');
});
for(const level of LEVELS)test(`preview ${level.id}: bounded points come from the real solver, with no state mutation`,()=>{
  const angles=level.rings.map(r=>r.initial),before=JSON.stringify({level,angles});
  const paths=createMotionPreview(level,angles),world=new PhysicsWorld(angles,level);
  const frames=level.balls.map(ball=>[{x:ball.x,y:ball.y}]);
  for(let i=0;i<PREVIEW_STEPS&&!world.finished;i++){world.step();world.states.forEach((s,j)=>frames[j].push({x:s.x,y:s.y}));}
  for(const [i,path] of paths.entries()){
    assert.deepEqual(path.points[0],{x:level.balls[i].x,y:level.balls[i].y});
    assert.ok(path.points.length<=PREVIEW_STEPS+1);let distance=0;
    for(let j=0;j<path.points.length;j++){
      const point=path.points[j];assert.ok(frames[i].some(frame=>frame.x===point.x&&frame.y===point.y));
      if(j)distance+=Math.hypot(point.x-path.points[j-1].x,point.y-path.points[j-1].y);
    }
    assert.ok(distance<=PREVIEW_DISTANCE+.00001);
  }
  assert.equal(JSON.stringify({level,angles}),before);
});
test('preview follows changed geometry, not solution metadata',()=>{
  // Put the ball close enough to meet the inner ring within the short horizon.
  // A distant wall should correctly have no effect on the initial free fall.
  const level:Level={...LEVELS[0],balls:[{color:'pink',x:230,y:375}]},closed=[90,0],open=[0,0];
  assert.notDeepEqual(createMotionPreview(level,closed),createMotionPreview(level,open));
  const noSolution={...level,solution:[123,456]} as Level;
  assert.deepEqual(createMotionPreview(level,open),createMotionPreview(noSolution,open));
});
test('preview cache avoids idle work, throttles changed poses, and never shows stale geometry',()=>{
  const cache=new MotionPreviewCache(),level=LEVELS[0],angles=level.solution;
  const first=cache.get(level,angles,0);assert.equal(cache.get(level,angles,50),first);
  assert.equal(cache.get(level,[30,0],100).length,0);
  const next=cache.get(level,[30,0],180);assert.notEqual(next,first);
  assert.equal(cache.get(level,[30,0],400),next);
  cache.reset();assert.notEqual(cache.get(level,angles,401),first);
});
