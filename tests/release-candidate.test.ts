import {bucketTarget} from '../src/buckets.ts';
import {test} from 'node:test';import assert from 'node:assert/strict';
import {LEVELS} from '../src/levels.ts';import {RingSession,rotationMessage} from '../src/engine.ts';import {validateSolution} from '../src/solutions.ts';
import {freshProgress,loadProgress,saveProgress} from '../src/progress.ts';import {freshIntro} from '../src/intro-state.ts';import {TutorialLesson,lessonForLevel} from '../src/tutorial.ts';
import {LocalPlaytest,PLAYTEST_KEY} from '../src/local-playtest.ts';import {reliableCupIndex} from '../src/cup-approach.ts';import {PhysicsWorld} from '../src/physics.ts';import {analyzePuzzle} from '../src/puzzle-analysis.ts';

test('first puzzle has one real required rotation and honest one-move three-star threshold',()=>{
 const s=new RingSession();s.selectLevel(0);assert.equal(s.level.stars.three,1);assert.equal(s.rotate(1,-105),true);s.play();for(let i=0;i<1920&&!s.world!.finished;i++)s.world!.step();s.finish();assert.equal(s.phase,'success');assert.equal(s.moves,1);
});
for(const l of LEVELS.slice(0,20))test(`opening ${l.id}: actual gestures meet calibrated stars`,()=>{const c=validateSolution(l);assert.ok(c.success);assert.equal(c.moves,l.targetMoves);assert.equal(c.moves,l.stars.three);});
test('first key, changer and mini challenge are essential real mechanics',()=>{
 assert.ok(validateSolution(LEVELS[6]).world.collected.has('first-key'));assert.equal(validateSolution({...LEVELS[6],keys:[]}).success,false);
 assert.equal(bucketTarget(LEVELS[7],'yellow'),1);const color=validateSolution(LEVELS[7]);assert.ok(color.world.states.some(b=>b.color==='yellow'));assert.equal(validateSolution({...LEVELS[7],colorGates:[]}).success,false);assert.ok(LEVELS[9].rules!.maxMoves);
});
test('tutorial survives a save, rejects invalid selections and only finishes on real success',()=>{
 const lesson=new TutorialLesson(1);lesson.handle({type:'select',ring:99});assert.equal(lesson.view!.kind,'select');lesson.handle({type:'select',ring:1});lesson.handle({type:'rotate',ring:1});
 const p=freshProgress();p.coins=470;p.onboarding=lesson.snapshot;let saved='';const store={getItem:()=>saved,setItem:(_k:string,v:string)=>{saved=v;}};saveProgress(p,store);const read=loadProgress(store);assert.equal(read.coins,470);assert.deepEqual(read.onboarding,lesson.snapshot);
 const resumed=new TutorialLesson(1,2,read.onboarding);assert.equal(resumed.view!.kind,'align');resumed.handle({type:'align',valid:true});resumed.handle({type:'play'});assert.equal(resumed.complete,false);resumed.handle({type:'success'});assert.ok(resumed.complete);
 const skipped=lessonForLevel(1,[])!;skipped.skip();assert.equal(skipped.wasSkipped,true);assert.equal(skipped.snapshot.solved,false);assert.equal(lessonForLevel(1,[1]),null);assert.equal(lessonForLevel(1,[],2,freshIntro())!.view!.kind,'select');
});
test('mechanic lessons advance on the actual relevant event, not unrelated button presses',()=>{
 for(const [id,event] of [[7,'key'],[8,'color'],[39,'split']] as const){const l=lessonForLevel(id,[])!;l.handle({type:'play'});assert.equal(l.complete,false);l.handle({type:event});assert.ok(l.complete);}
 const linked=new TutorialLesson(9,4,freshIntro(),3);linked.handle({type:'rotate',ring:0});assert.equal(linked.complete,false);linked.handle({type:'rotate',ring:3});assert.ok(linked.complete);
});
test('rotation rejection reports exact lock or movement budget cause',()=>{
 const s=new RingSession();s.selectCustom({...LEVELS[0],locks:[{id:'door',kind:'ring',ring:1}]});assert.equal(s.rotationBlock(1),'locked');assert.match(rotationMessage(s.rotationBlock(1)!),/anahtar/);
 s.selectCustom({...LEVELS[0],rules:{maxMoves:1}});s.rotate(1,15);assert.equal(s.rotationBlock(1),'move-limit');s.restart();assert.equal(s.rotationBlock(1),null);
 s.selectCustom({...LEVELS[0],ringLimits:[0,1]});assert.equal(s.rotationBlock(0),'ring-limit');assert.equal(s.rotationBlock(99),'invalid');
});
test('local playtest is bounded, persists an allowlist and strips unknown personal data',()=>{
 let encoded='[]';const storage={getItem:()=>encoded,setItem:(key:string,value:string)=>{assert.equal(key,PLAYTEST_KEY);encoded=value;}};const recorder=new LocalPlaytest(storage);
 for(let i=0;i<310;i++)recorder.record({event:'start',level:1,mode:'normal',moves:i,seconds:2.123,...{email:'private@example.invalid',url:'secret'}});
 const rows=recorder.export();assert.equal(rows.length,300);assert.equal(rows[0].moves,10);assert.equal(rows[0].seconds,2.1);assert.equal(encoded.includes('private'),false);rows[0].moves=999;assert.equal(recorder.export()[0].moves,10);assert.equal(new LocalPlaytest(storage).export().length,300);recorder.clear();assert.deepEqual(recorder.export(),[]);
});
test('metrics ignore corrupt rows and survive disabled storage without touching game progress',()=>{
 const bad={getItem:()=>JSON.stringify([{event:'start',level:1,mode:'normal',moves:2,seconds:3,secret:'x'},{event:'bad',level:1,moves:2,seconds:-1}]),setItem:()=>{throw Error('blocked');}};
 const recorder=new LocalPlaytest(bad);assert.equal(recorder.export().length,1);assert.doesNotThrow(()=>recorder.record({event:'undo',level:1,mode:'normal',moves:3,seconds:5}));assert.equal(recorder.export().length,2);assert.equal(Object.keys(recorder.export()[0]).length,5);
});
function nearCup(){const l=LEVELS[0],cup=l.cups[0],ball={x:cup.x,y:cup.y-45,color:cup.color,vx:0,vy:180,spin:0,done:false,origin:0};return {l,ball};}
test('bucket approach cue requires correct color/order and a safely clear final path',()=>{
 const {l,ball}=nearCup();assert.equal(reliableCupIndex(l,[ball],0,0),0);assert.equal(reliableCupIndex({...l,rules:{deliveryOrder:['blue']}},[ball],0,0),-1);assert.equal(reliableCupIndex(l,[{...ball,x:270}],0,0),-1);assert.equal(reliableCupIndex(l,[{...ball,vy:-10}],0,0),-1);
 assert.equal(reliableCupIndex({...l,dividers:[{a:{x:ball.x-20,y:ball.y+10},b:{x:ball.x+20,y:ball.y+10},radius:4}]},[ball],0,0),-1);
 assert.equal(reliableCupIndex(l,[ball,{...ball,x:ball.x+3,origin:1}],0,0),-1);
 assert.equal(reliableCupIndex({...l,obstacles:[{id:'moving',x:ball.x,y:ball.y+10,axis:'x',amplitude:20,period:2,phase:0,radius:8}]},[ball],0,0),-1);
});
test('passage events are real outward crossings, not initial positions in outer layers',()=>{
 const world=new PhysicsWorld(LEVELS[0].solution,LEVELS[0]);let crossings=0;for(let i=0;i<1920&&!world.finished;i++){world.step();crossings+=world.events.splice(0).filter(e=>e.type==='passage').length;}assert.ok(crossings>=2);assert.ok(world.result().success);
 const outside={...LEVELS[0],balls:[{color:'pink' as const,x:180,y:550}]};const initial=new PhysicsWorld(outside.solution,outside);initial.step();assert.equal(initial.events.filter(e=>e.type==='passage').length,0);
});
test('puzzle depth audit distinguishes simple K5, staged K20 and ordered mechanical U50',()=>{
 const easy=analyzePuzzle(LEVELS[4],true),middle=analyzePuzzle(LEVELS[19],true),hard=analyzePuzzle(LEVELS[89],true);
 assert.ok(easy.solved&&middle.solved&&hard.solved);assert.ok(middle.phases>easy.phases);assert.ok(hard.phases>middle.phases);assert.ok(hard.moves>easy.moves);assert.ok(hard.essentialActionsInPlan!>=easy.essentialActionsInPlan!);assert.ok(hard.orderSensitivePairs!>0);assert.equal(hard.globalMinimumProven,false);
});

test('soft and strong collision voices have different bounded pitch and volume',async()=>{
 const {FeedbackAudio}=await import('../src/audio.ts');const samples:{frequency:number;volume:number}[]=[];
 for(const strength of [35,240]){const sample={frequency:0,volume:0};samples.push(sample);const context={state:'running',currentTime:0,destination:{},resume:async()=>{},createOscillator:()=>({frequency:{setValueAtTime:(v:number)=>sample.frequency=v},connect(){},disconnect(){},start(){},stop(){},onended:null}),createGain:()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime:(v:number)=>sample.volume=Math.max(sample.volume,v)},connect(){},disconnect(){}})};const audio=new FeedbackAudio(()=>context as unknown as AudioContext);await audio.unlock();audio.effect('collision',strength);}
 assert.ok(samples[1].frequency>samples[0].frequency);assert.ok(samples[1].volume>samples[0].volume);assert.ok(samples[1].volume<=.026);
});

test('guided first Play cannot bypass actual path alignment, and Skip releases the guide',()=>{
 const l=new TutorialLesson(1);assert.equal(l.canRelease,false);l.handle({type:'select',ring:0});assert.equal(l.view!.kind,'select');l.handle({type:'select',ring:1});l.handle({type:'rotate',ring:1});l.handle({type:'align',valid:false});assert.equal(l.canRelease,false);l.handle({type:'align',valid:true});assert.ok(l.canRelease);const skip=new TutorialLesson(1);skip.skip();assert.ok(skip.canRelease);
});
test('failure feedback identifies actual wrong-cup and missed outcomes from physical runs',async()=>{
 const {failureFeedback}=await import('../src/failure-feedback.ts');const base=LEVELS[0];
 for(const missed of [false,true]){const l={...base,cups:base.cups.map(c=>({...c,x:missed?-1000:c.x,color:missed?c.color:c.color==='pink'?'blue' as const:'pink' as const}))};const world=new PhysicsWorld(l.solution,l);for(let i=0;i<1920&&!world.finished;i++)world.step();assert.equal(world.result().success,false);assert.match(failureFeedback(world),missed?/dışına/:/kovaya düştü/);}
});
test('logical color names retain their hue families in every theme palette',async()=>{
 const {PALETTES}=await import('../src/palettes.ts');const ranges=[[300,355],[185,245],[30,65],[85,185],[245,290]];
 for(const p of PALETTES)p.colors.forEach((hex,i)=>{const [r,g,b]=[1,3,5].map(n=>parseInt(hex.slice(n,n+2),16)/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;let h=max===r?((g-b)/d)%6:max===g?(b-r)/d+2:(r-g)/d+4;h=(h*60+360)%360;assert.ok(h>=ranges[i][0]&&h<=ranges[i][1],`${p.id} color ${i}: hue ${h}`);});
});

test('running tutorial highlights actual moving balls instead of leaving ghost circles at launch points',async()=>{
 const {BoardGuidance}=await import('../src/guidance.ts');const circles:number[][]=[];
 let opacity=0;
 const graphics=()=>({visible:true,setDepth(){return this;},clear(){return this;},setAlpha(value:number){opacity=value;return this;},setVisible(v:boolean){this.visible=v;return this;},lineStyle(){return this;},strokeCircle(x:number,y:number){circles.push([x,y]);return this;},strokeEllipse(){return this;}});
 const guide=new BoardGuidance({add:{graphics}} as never,LEVELS[0],true);guide.setTutorial({kind:'motion',message:'eşleştir',step:5,total:6,ring:null});
 guide.update(100,LEVELS[0].solution,false,false,[{x:150,y:580,color:'pink'},{x:390,y:670,color:'blue',done:true}]);
 assert.deepEqual(circles,[[150,580]]);
 assert.equal(opacity,1);
});
