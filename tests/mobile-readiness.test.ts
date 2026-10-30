import {test} from 'node:test';
import assert from 'node:assert/strict';
import {dragDelta,nextEditableRing,wallArcSpans,type RingDrag} from '../src/ring-input.ts';
import {WebLifecycle} from '../src/web-lifecycle.ts';
import {FeedbackAudio} from '../src/audio.ts';
import {LEVELS} from '../src/levels.ts';
import {RingSession} from '../src/engine.ts';
import {TutorialLesson} from '../src/tutorial.ts';
import {simulate} from '../src/physics.ts';
const point=(degrees:number,radius=180)=>({x:270+Math.cos(degrees*Math.PI/180)*radius,y:280+Math.sin(degrees*Math.PI/180)*radius});
function drag():RingDrag{return {id:1,index:0,previous:0,startX:0,startY:0,moved:false,pending:0};}
test('a touch tap and small jitter select without rotating or spending a move',()=>{
 const d=drag();assert.equal(dragDelta(d,{id:1,x:2,y:1,world:point(1)}),0);assert.equal(dragDelta(d,{id:1,x:0,y:0,world:point(0)}),0);assert.equal(d.moved,false);
 const session=new RingSession();assert.ok(session.begin(0));session.commit();assert.equal(session.moves,0);
});
test('Undo invalidates the first lesson alignment using the restored real physical pose',()=>{
 const session=new RingSession(),lesson=new TutorialLesson(1);session.rotate(1,-105);lesson.handle({type:'rotate',ring:1});lesson.handle({type:'align',valid:simulate(session.angles,session.level).success});assert.equal(lesson.canRelease,true);
 assert.equal(session.undo(),true);lesson.handle({type:'align',valid:simulate(session.angles,session.level).success});assert.equal(lesson.canRelease,false);assert.equal(lesson.view?.kind,'align');assert.equal(session.moves,1);
 session.restart();assert.equal(session.moves,0);assert.equal(session.world,null);
});
test('threshold crossing retains the earlier motion, and a fast release without move events rotates',()=>{
 const d=drag();assert.equal(dragDelta(d,{id:1,x:3,y:0,world:point(2)}),0);assert.equal(dragDelta(d,{id:1,x:8,y:0,world:point(8)}),8);assert.equal(dragDelta(d,{id:1,x:12,y:0,world:point(12)}),4);
 const fast=drag();assert.equal(dragDelta(fast,{id:1,x:50,y:0,world:point(60)}),60);assert.equal(fast.moved,true);
});
test('a second finger cannot steal an active gesture; crossing the center does not jump 180 degrees',()=>{
 const d=drag(),before={...d};assert.equal(dragDelta(d,{id:2,x:40,y:10,world:point(90)}),0);assert.deepEqual(d,before);
 assert.equal(dragDelta(d,{id:1,x:40,y:0,world:point(90,10)}),0);assert.equal(d.moved,false);assert.equal(dragDelta(d,{id:1,x:60,y:0,world:point(180)}),0);assert.equal(dragDelta(d,{id:1,x:70,y:0,world:point(190)}),10);
});
test('wraparound uses the shortest signed rotation and keyboard selection skips inaccessible rings',()=>{
 const d={...drag(),previous:355};assert.equal(dragDelta(d,{id:1,x:30,y:0,world:point(5)}),10);
 assert.equal(nextEditableRing(0,4,1,i=>i===3),3);assert.equal(nextEditableRing(0,4,-1,i=>i===2),2);assert.equal(nextEditableRing(0,4,1,()=>false),-1);assert.equal(nextEditableRing(0,0,1,()=>true),-1);
});
test('selection glow leaves genuine openings empty, including wraparound and overlapping gaps',()=>{
 assert.deepEqual(wallArcSpans({gaps:[]}),[[0,360]]);assert.deepEqual(wallArcSpans({gaps:[{angle:0,size:40}]}),[[20,340]]);
 assert.deepEqual(wallArcSpans({gaps:[{angle:90,size:40},{angle:110,size:40}]}),[[0,70],[130,360]]);assert.deepEqual(wallArcSpans({gaps:[{angle:0,size:360}]}),[]);
 for(const l of LEVELS)for(const ring of l.rings){const walls=wallArcSpans(ring,37);for(const [a,b] of walls){assert.ok(b>a&&a>=0&&b<=360);const middle=(a+b)/2;assert.ok(ring.gaps.every(g=>Math.abs(((middle-g.angle-37+540)%360)-180)>=g.size/2-1e-7));}}
});
test('background, page-cache and freeze transitions preserve manual pause and menu/preview pause',()=>{
 const l=new WebLifecycle();assert.equal(l.shouldPause(false,false,false,false),false);assert.equal(l.shouldPause(true,false,false,false),true);
 l.setPageVisible(false);assert.equal(l.background(false),true);l.setPageVisible(true);l.setFrozen(true);assert.equal(l.background(false),true);l.setFrozen(false);
 assert.equal(l.shouldPause(false,true,false,false),true);assert.equal(l.shouldPause(false,false,true,false),true);assert.equal(l.shouldPause(false,false,false,true),true);assert.equal(l.shouldPause(false,false,false,false),false);
});
test('a resumed fixed-step world matches uninterrupted physics; elapsed background time is not consumed',()=>{
 const level=LEVELS[0],s=new RingSession();s.selectCustom(level);s.angles=[...level.solution];const world=s.play()!;for(let i=0;i<20;i++)world.step();const suspended=world.clone(),reference=world.clone(),l=new WebLifecycle();l.setFrozen(true);
 for(let frame=0;frame<600;frame++)if(!l.shouldPause(false,false,false,false))suspended.advance(1/60);assert.deepEqual(suspended.states,reference.states);assert.equal(suspended.time,reference.time);
 l.setFrozen(false);for(let i=0;i<60;i++){suspended.step();reference.step();}assert.deepEqual(suspended.states,reference.states);assert.equal(suspended.time,reference.time);
});
test('background audio stops effects and music, suppresses delayed callbacks and can resume',async()=>{
 let starts=0,suspends=0,resumes=0,closed=0;const oscillators:{stops:number;onended:(()=>void)|null}[]=[];
 const ctx={state:'suspended',currentTime:0,destination:{},async resume(){this.state='running';resumes++;},async suspend(){this.state='suspended';suspends++;},async close(){closed++;this.state='closed';},createOscillator(){const o={stops:0,onended:null as (()=>void)|null,type:'sine',frequency:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){},start(){starts++;},stop(){this.stops++;}};oscillators.push(o);return o;},createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}};
 const audio=new FeedbackAudio(()=>ctx as unknown as AudioContext);await audio.unlock();audio.configure(true,true);audio.effect('correct');const count=starts;
 audio.setBackground(true);assert.equal(suspends,1);assert.ok(oscillators.every(o=>o.stops>=2));audio.effect('star');audio.tone(660);assert.equal(await audio.unlock(),false);assert.equal(starts,count);
 oscillators.forEach(o=>o.onended?.());audio.setBackground(false);await audio.unlock();assert.ok(resumes>=2);audio.effect('correct');assert.ok(starts>count);audio.dispose();assert.equal(closed,1);
});
test('hidden startup does not create an audio context before a real user gesture',async()=>{
 let contexts=0;const audio=new FeedbackAudio(()=>{contexts++;throw Error('not expected');});audio.configure(true,true);audio.setBackground(true);audio.setBackground(false);assert.equal(contexts,0);audio.dispose();
});
