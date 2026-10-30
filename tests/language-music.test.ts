import {test} from 'node:test';
import assert from 'node:assert/strict';
import {Localizer,LANGUAGES,LANGUAGE_KEY,languageCode,loadLanguage,saveLanguage,translate,translationRows} from '../src/i18n.ts';
import {levelBrief,levelBriefs} from '../src/level-brief.ts';
import {LEVELS} from '../src/levels.ts';
import {musicNotes,MUSIC_STEP_SECONDS,MUSIC_BPM} from '../src/music-score.ts';
import {FeedbackAudio} from '../src/audio.ts';

test('all eight languages have complete nonempty catalog columns and unique source keys',()=>{
 assert.equal(LANGUAGES.length,8);const seen=new Set<string>();
 for(const row of translationRows){assert.equal(row.length,LANGUAGES.length,row[0]);assert.ok(row.every(s=>s.trim().length),row[0]);assert.ok(!seen.has(row[0]),row[0]);seen.add(row[0]);for(let i=1;i<LANGUAGES.length;i++)assert.equal(translate(row[0],LANGUAGES[i].id),row[i]);}
});
test('language preference has its own key and tolerates unavailable or invalid storage',()=>{
 const map=new Map([['spin-sort-v1','original-player-save']]),storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};
 assert.equal(loadLanguage(storage),'tr');assert.equal(saveLanguage(storage,'fr'),true);assert.equal(loadLanguage(storage),'fr');assert.equal(map.get('spin-sort-v1'),'original-player-save');
 map.set(LANGUAGE_KEY,'<script>');assert.equal(loadLanguage(storage),'tr');assert.equal(languageCode('en-US'),null);assert.equal(languageCode(null),null);
 const blocked={getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}};assert.equal(loadLanguage(blocked),'tr');assert.equal(saveLanguage(blocked,'de'),false);assert.equal(saveLanguage(null,'en'),false);
});
test('dynamic UI keeps numbers, proper names, whitespace and word boundaries',()=>{
 assert.equal(translate('  12 hamle · hedef 8  ','en'),'  12 moves · target 8  ');
 assert.equal(translate('✦ +125 altın','es'),'✦ +125 oro');assert.equal(translate('Color Rings · Prism','de'),'Color Rings · Prism');
 assert.equal(translate('Storehouse · Goldfish','tr'),'Storehouse · Goldfish');assert.equal(translate('mavilik','en'),'mavilik');
 assert.equal(translate('Play · Undo · Restart','tr'),'Oyna · Geri al · Baştan');
});
test('intro directions and key, gate and splitter instructions are localized in every non-Turkish language',()=>{
 const sources=['Dış halkaya dokun ve seç.','Her topu aynı renkli kovayla eşleştir.','Top anahtarı toplar; aynı numaralı kilit açılır.','Geçitte pembe → sarı. Yeni rengi sarı kovayla eşleştir.','×2 bölücü tek topu ikiye ayırır. Kova sayacı ikisini ister.'];
 for(const {id} of LANGUAGES.slice(1))for(const source of sources)assert.notEqual(translate(source,id),source);
});
test('all 140 level names and all mastery chapter titles have authored translations',()=>{
 const keys=new Set(translationRows.map(r=>r[0]));for(const level of LEVELS){for(const part of level.name.split(' · '))assert.ok(keys.has(part),part);if(level.idea)assert.ok(keys.has(level.idea.title),level.idea.title);}
});
test('switching languages restores source text and preserves elements and event handlers',()=>{
 const originalDocument=Object.getOwnPropertyDescriptor(globalThis,'document'),originalObserver=Object.getOwnPropertyDescriptor(globalThis,'MutationObserver');let callback:MutationCallback;
 const attrs=new Map([['aria-label','İpucu al']]),handler=()=>true;
 const root={nodeType:1,matches:()=>false,closest:()=>null,getAttribute:(k:string)=>attrs.get(k)??null,setAttribute:(k:string,v:string)=>attrs.set(k,v),childNodes:[] as unknown[],onclick:handler};
 const text={nodeType:3,data:'12 hamle · hedef 8',parentElement:root};root.childNodes.push(text);
 Object.defineProperty(globalThis,'document',{configurable:true,value:{documentElement:{lang:'tr'}}});Object.defineProperty(globalThis,'MutationObserver',{configurable:true,value:class{constructor(cb:MutationCallback){callback=cb;}observe(){}disconnect(){}}});
 try{const localizer=new Localizer(root as unknown as HTMLElement,'en');assert.equal(text.data,'12 moves · target 8');assert.equal(attrs.get('aria-label'),'Get a hint');
  localizer.setLanguage('de');assert.equal(text.data,'12 Züge · Ziel 8');localizer.setLanguage('tr');assert.equal(text.data,'12 hamle · hedef 8');assert.equal(attrs.get('aria-label'),'İpucu al');assert.equal(root.onclick,handler);assert.equal(root.childNodes[0],text);
  text.data='14 hamle · hedef 8';callback!([{type:'characterData',target:text} as unknown as MutationRecord],{} as MutationObserver);localizer.setLanguage('fr');assert.equal(text.data,'14 coups · objectif 8');localizer.disconnect();
 }finally{if(originalDocument)Object.defineProperty(globalThis,'document',originalDocument);else Reflect.deleteProperty(globalThis,'document');if(originalObserver)Object.defineProperty(globalThis,'MutationObserver',originalObserver);else Reflect.deleteProperty(globalThis,'MutationObserver');}
});
test('localized level help comes from real goals and does not mutate authored levels',()=>{
 const before=JSON.stringify(LEVELS),keyLevel=LEVELS[6],change=LEVELS[7];assert.match(levelBrief(keyLevel),/anahtarı topla/);assert.match(levelBrief(change),/Renk değiştiren/);
 for(const l of LEVELS)assert.ok(levelBriefs(LEVELS).has(l.lesson));assert.equal(JSON.stringify(LEVELS),before);
 const shared=[{...LEVELS[0],lesson:'shared'},{...LEVELS[3],goals:{pink:9},lesson:'shared'},{...LEVELS[3],goals:{pink:9},lesson:'shared'}];assert.equal(levelBriefs(shared).get('shared'),'Geçitleri hizala ve toplara yol aç.');
});
test('new score varies harmony and melody with quiet bounded voices and rests',()=>{
 assert.equal(MUSIC_BPM,112);assert.equal(MUSIC_STEP_SECONDS,60/112/4);const notes=Array.from({length:256},(_,i)=>musicNotes(i));
 assert.ok(notes.some(n=>!n.length));assert.ok(new Set(notes.flat().map(n=>n.frequency)).size>10);assert.notDeepEqual(notes[0],notes[16]);assert.notDeepEqual(notes[14],notes[78]);
 for(const chord of notes){assert.ok(chord.length<=3);for(const n of chord){assert.ok(n.volume<=.026&&n.volume>0);assert.ok(n.frequency>60&&n.frequency<2400);assert.ok(n.duration>0&&n.duration<3);}}
});
test('music switches off active music voices while preserving independent effect audio',async t=>{
 const voices:{music:boolean;stops:number;onended:(()=>void)|null}[]=[];let destinationCount=0;
 const ctx={state:'running',currentTime:0,destination:{},async resume(){},createOscillator(){const v={music:false,stops:0,onended:null as (()=>void)|null,type:'',frequency:{setValueAtTime(){}},connect(){},disconnect(){},start(){},stop(){this.stops++;}};voices.push(v);return v;},createGain(){return {gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){destinationCount++;},disconnect(){}};}};
 const audio=new FeedbackAudio(()=>ctx as unknown as AudioContext);t.after(()=>audio.configure(false,false));await audio.unlock();audio.configure(true,true);
 assert.equal(voices.length,2);assert.equal(destinationCount,2);audio.effect('correct');assert.equal(voices.length,3);audio.configure(true,false);
 assert.ok(voices.slice(0,2).every(v=>v.stops===2));assert.equal(voices[2].stops,1);
 voices.slice(0,2).forEach(v=>v.onended?.());audio.effect('wrong');assert.equal(voices.length,4);
});
