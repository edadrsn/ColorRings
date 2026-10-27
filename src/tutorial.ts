/** Interaction-only lessons; never rotate a ring or reveal a solution for the player. */
export const TUTORIAL_LEVELS=[1,2,3] as const;
export type TutorialEvent={type:'rotate';ring:number}|{type:'play'}|{type:'motion'};
export type TutorialView={kind:'rotate'|'play'|'motion'|'rings';message:string;step:number;total:number;ring:number|null};
export class TutorialLesson {
  readonly level:number;
  private rotated=new Set<number>();
  private started=false;
  private moved=false;
  private skipped=false;
  private ringCount:number;
  constructor(level:number,ringCount=2){this.level=level;this.ringCount=ringCount;}
  get complete():boolean {
    return this.skipped||(this.level===1?this.rotated.size>0&&this.started:this.level===2?this.started&&this.moved:this.level===3?Array.from({length:this.ringCount},(_,i)=>i).every(i=>this.rotated.has(i)):true);
  }
  handle(event:TutorialEvent):void {
    if(this.complete)return;
    if(event.type==='rotate'&&Number.isInteger(event.ring)&&event.ring>=0)this.rotated.add(event.ring);
    if(event.type==='play')this.started=true;
    if(event.type==='motion'&&this.started)this.moved=true;
  }
  skip(){this.skipped=true;}
  get view():TutorialView|null {
    if(this.complete)return null;
    if(this.level===1){
      const rotated=this.rotated.size>0;
      return {kind:rotated?'play':'rotate',message:rotated?'Güzel! Play ile akışı başlat.':this.started?'Akış sürerken de halkayı döndürebilirsin!':'Halkayı döndürerek yolu aç!',step:rotated?2:1,total:2,ring:rotated?null:0};
    }
    if(this.level===2)return {kind:'motion',message:'Topların doğru kovaya ulaşmasını sağla!',step:1,total:1,ring:null};
    const next=Array.from({length:this.ringCount},(_,i)=>i).find(i=>!this.rotated.has(i))??0;
    return {kind:'rings',message:this.rotated.size?'Şimdi diğer halkayı da döndür!':'Her halkayı ayrı döndürebilirsin!',step:this.rotated.size+1,total:this.ringCount,ring:next};
  }
}
export function lessonForLevel(level:number,done:readonly number[],ringCount=2):TutorialLesson|null {
  return TUTORIAL_LEVELS.some(id=>id===level)&&!done.includes(level)?new TutorialLesson(level,ringCount):null;
}
