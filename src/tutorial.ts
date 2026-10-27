import {freshIntro,type IntroState} from './intro-state.ts';
export const TUTORIAL_LEVELS=[1,2,3,7,8,9,10,28,39] as const;
export type TutorialEvent={type:'select'|'rotate';ring:number}|{type:'play'|'motion'|'success'|'key'|'color'|'split'}|{type:'align';valid:boolean};
export type TutorialView={kind:'select'|'align'|'rotate'|'play'|'motion'|'rings';message:string;step:number;total:number;ring:number|null;direction?:number};
const mechanics:Record<number,{message:string;event:TutorialEvent['type']}>={7:{message:'Top anahtarı toplar; aynı numaralı kilit açılır.',event:'key'},8:{message:'Geçitte pembe → sarı. Yeni rengi sarı kovayla eşleştir.',event:'color'},9:{message:'Noktalı çizgi bağlı halkaları gösterir. Birini sürükle.',event:'rotate'},10:{message:'Bir sürükleme = bir hamle. Önce mavi; sonra pembe.',event:'play'},28:{message:'Ok yönünde geçebilirsin; ters yönde kapı tutar.',event:'play'},39:{message:'×2 bölücü tek topu ikiye ayırır. Kova sayacı ikisini ister.',event:'split'}};
/** Driven only by real selections, committed gestures, physics events and victory. */
export class TutorialLesson{
 readonly level:number;private ringCount:number;private state:IntroState;private rotated=new Set<number>();private skipped=false;private mechanicDone=false;private invalid=false;private mechanicRing=0;
 constructor(level:number,ringCount=2,initial:IntroState=freshIntro(),mechanicRing=0){this.mechanicRing=mechanicRing;this.level=level;this.ringCount=ringCount;this.state={...initial};}
 get snapshot(){return {...this.state};}
 get complete(){return this.skipped||(this.level===1?this.state.solved:this.level===2?this.state.started&&this.state.matched:this.level===3?this.rotated.size>=this.ringCount:this.mechanicDone);}
 handle(event:TutorialEvent){if(this.complete)return;
  if((event.type==='select'||event.type==='rotate')&&(!Number.isInteger(event.ring)||event.ring<0||event.ring>=this.ringCount))return;
  if(this.level===1&&(event.type==='select'||event.type==='rotate')&&event.ring!==this.ringCount-1)return;
  if(event.type==='select')this.state.selected=true;
  if(event.type==='rotate'){this.state.selected=true;this.state.rotated=true;this.rotated.add(event.ring);}
  if(event.type==='align'){this.state.aligned=event.valid;this.invalid=!event.valid;}
  if(event.type==='play')this.state.started=true;
  if(event.type==='motion'&&this.state.started)this.state.matched=true;
  if(event.type==='success')this.state.solved=true;
  if(mechanics[this.level]?.event===event.type&&(this.level!==9||event.type==='rotate'&&event.ring===this.mechanicRing))this.mechanicDone=true;
 }
 skip(){this.skipped=true;}
 get wasSkipped(){return this.skipped;}
 get canRelease(){return this.level!==1||this.complete||this.state.aligned;}
 get view():TutorialView|null{
  if(this.complete)return null;
  if(this.level===1){const ring=this.ringCount-1;
   if(!this.state.selected)return {kind:'select',message:'Dış halkaya dokun ve seç.',ring,step:1,total:6};
   if(!this.state.rotated)return {kind:'rotate',message:'Halkayı parmağınla sürükleyerek döndür.',ring,step:2,total:6};
   if(!this.state.aligned&&!this.state.started)return {kind:'align',message:this.invalid?'Yol henüz açık değil. Dış geçidi aşağıdaki yolla hizala.':'Geçitleri hizala ve toplara yol aç.',ring,step:3,total:6};
   if(!this.state.started)return {kind:'play',message:'Yol açık! Play ile topları bırak.',ring:null,step:4,total:6};
   return {kind:'motion',message:'Her topu aynı renkli kovayla eşleştir.',ring:null,step:5,total:6};
  }
  if(this.level===2)return {kind:'motion',message:'İki geçidi hizala; Play ile akışı izle.',ring:null,step:1,total:1};
  if(this.level===3){const ring=Array.from({length:this.ringCount},(_,i)=>i).find(i=>!this.rotated.has(i))??0;return {kind:'rings',message:'Her halkayı ayrı seçip döndürebilirsin.',ring,step:this.rotated.size+1,total:this.ringCount};}
  return {kind:this.level===9?'rotate':'motion',message:mechanics[this.level]?.message??'',ring:this.level===9?this.mechanicRing:null,step:1,total:1};
 }
}
export function lessonForLevel(level:number,done:readonly number[],ringCount=2,initial?:IntroState,mechanicRing=0):TutorialLesson|null{return TUTORIAL_LEVELS.some(id=>id===level)&&!done.includes(level)?new TutorialLesson(level,ringCount,level===1?initial:undefined,mechanicRing):null;}
