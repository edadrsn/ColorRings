import {test} from 'node:test';
import assert from 'node:assert/strict';
import {FeedbackAudio} from '../src/audio.ts';

function audioFixture(){
  let constructed=0,started=0,resumed=0,failResume=false;
  const oscillators:{onended:(()=>void)|null}[]=[];
  const context={state:'suspended',currentTime:0,destination:{},
    async resume(){resumed++;if(failResume)throw new Error('blocked');this.state='running';},
    createOscillator(){const oscillator={type:'',frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){started++;},stop(){},onended:null as (()=>void)|null};oscillators.push(oscillator);return oscillator;},
    createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};},
  };
  const audio=new FeedbackAudio(()=>{constructed++;return context as unknown as AudioContext;});
  return {audio,context,oscillators,get constructed(){return constructed;},get started(){return started;},get resumed(){return resumed;},set failResume(value:boolean){failResume=value;}};
}

test('ambient startup and pre-gesture effects do not create a blocked context or fill voice slots',async t=>{
  const f=audioFixture();t.after(()=>f.audio.configure(false,false));f.audio.configure(true,true);
  for(let i=0;i<24;i++)f.audio.tone(440);
  assert.equal(f.constructed,0);assert.equal(f.started,0);
  assert.equal(await f.audio.unlock(),true);assert.equal(f.constructed,1);
  const before=f.started;f.audio.effect('correct');assert.equal(f.started,before+1);
});

test('suspended audio drops notes and resumes on the next gesture without losing voice slots',async()=>{
  const f=audioFixture();await f.audio.unlock();f.context.state='suspended';
  for(let i=0;i<24;i++)f.audio.tone(440);
  assert.equal(f.started,0);assert.equal(await f.audio.unlock(),true);f.audio.effect('rotate');assert.equal(f.started,1);assert.equal(f.resumed,2);
});

test('eight active voices remain capped, ended voices are released',async()=>{
  const f=audioFixture();await f.audio.unlock();for(let i=0;i<24;i++)f.audio.tone(440);
  assert.equal(f.started,8);f.oscillators[0].onended!();f.audio.tone(440);assert.equal(f.started,9);
});

test('a rejected unlock is retryable and cannot enqueue inaudible oscillators',async()=>{
  const f=audioFixture();f.failResume=true;assert.equal(await f.audio.unlock(),false);f.audio.tone(440);assert.equal(f.started,0);
  f.failResume=false;assert.equal(await f.audio.test(),true);assert.equal(f.started,2);
});

test('sound test respects mute and disabled music never starts an ambient voice',async()=>{
  const f=audioFixture();f.audio.configure(false,false);assert.equal(await f.audio.test(),false);assert.equal(f.constructed,0);
  await f.audio.unlock();f.audio.effect('correct');assert.equal(f.started,0);f.audio.configure(true,false);assert.equal(await f.audio.test(),true);assert.equal(f.started,2);
});

test('missing Web Audio reports failure instead of throwing from UI interaction',async()=>{
  const audio=new FeedbackAudio(()=>{throw new Error('unsupported');});assert.equal(await audio.unlock(),false);assert.equal(await audio.test(),false);assert.doesNotThrow(()=>audio.effect('finish'));
});
