import {musicNotes,MUSIC_STEP_SECONDS} from './music-score.ts';
export type Effect='passage'|'select'|'roll'|'star'|'rotate'|'collision'|'correct'|'wrong'|'key'|'unlock'|'color'|'perfect'|'finish'|'achievement'|'split'|'theme';
function browserAudioContext():AudioContext {
  const Constructor=globalThis.AudioContext??(globalThis as typeof globalThis&{webkitAudioContext?:typeof AudioContext}).webkitAudioContext;
  if(!Constructor)throw new Error('Web Audio desteklenmiyor');
  return new Constructor();
}
/** Small synthesized voices; no network assets and at most eight simultaneous notes. */
export class FeedbackAudio {
  private context:AudioContext|undefined;
  private voices=0;
  private sound=true;
  private music=false;
  private timer:ReturnType<typeof setInterval>|undefined;
  private note=0;
  private nextNote=0;
  private musicVoices=new Set<OscillatorNode>();
  private activeVoices=new Set<OscillatorNode>();
  private background=false;
  private lastImpact=-Infinity;
  private recent=new Map<Effect,number>();
  private createContext:()=>AudioContext;
  constructor(createContext:()=>AudioContext=browserAudioContext){this.createContext=createContext;}
  /** Call directly from a real pointer/key gesture, before any voice-limit checks. */
  async unlock():Promise<boolean>{
    if(this.background)return false;
    try{
      if(!this.context||this.context.state==='closed')this.context=this.createContext();
      const ctx=this.context,wasRunning=ctx.state==='running';
      if(!wasRunning)await ctx.resume();
      if(ctx.state!=='running'||this.background)return false;
      if(this.music&&(!wasRunning||!this.nextNote)){this.nextNote=ctx.currentTime;this.ambient();}
      return true;
    }catch{return false;}
  }
  configure(sound:boolean,music:boolean){
    this.sound=sound;
    if(this.music===music)return;
    this.music=music;
    if(!music){
      if(this.timer)clearInterval(this.timer);this.timer=undefined;this.nextNote=0;
      for(const oscillator of this.musicVoices){try{oscillator.stop();}catch{}}this.musicVoices.clear();
    }else this.startMusic();
  }
  private startMusic(){if(!this.music||this.background||this.timer)return;this.nextNote=this.context?.currentTime??0;this.ambient();this.timer=setInterval(()=>this.ambient(),100);}
  /** Web visibility/page lifecycle now; Capacitor App events can call the same boundary later. */
  setBackground(background:boolean){
    if(this.background===background)return;this.background=background;
    if(background){
      if(this.timer)clearInterval(this.timer);this.timer=undefined;this.nextNote=0;
      for(const voice of this.activeVoices){try{voice.stop();}catch{}}
      void this.context?.suspend?.().catch(()=>{});
    }else {this.startMusic();if(this.context)void this.unlock();}
  }
  dispose(){
    this.setBackground(true);this.activeVoices.clear();this.musicVoices.clear();this.voices=0;
    void this.context?.close?.().catch(()=>{});
  }
  tone(frequency:number,duration=.1,volume=.065,music=false){
    if(this.background||(music?!this.music:!this.sound)||this.voices>=8)return;
    // Never queue oscillators in a suspended context. They cannot finish and
    // would exhaust all eight slots before the first user interaction.
    const ctx=this.context;if(!ctx||ctx.state!=='running')return;
    try{
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,ctx.currentTime);
      gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
      oscillator.connect(gain);gain.connect(ctx.destination);this.voices++;this.activeVoices.add(oscillator);oscillator.onended=()=>{if(!this.activeVoices.delete(oscillator))return;this.voices--;oscillator.disconnect();gain.disconnect();};oscillator.start();oscillator.stop(ctx.currentTime+duration);
    }catch{}
  }
  async test():Promise<boolean>{
    if(!this.sound||!await this.unlock())return false;
    this.tone(523.25,.22,.09);this.tone(783.99,.32,.07);return true;
  }
  effect(effect:Effect,strength=90){
    if(effect==='rotate'||effect==='roll'||effect==='select'||effect==='star'||effect==='passage'){
      const now=performance.now(),interval=effect==='roll'?240:effect==='rotate'?65:90;
      if(now-(this.recent.get(effect)??-Infinity)<interval)return;this.recent.set(effect,now);
    }
    if(effect==='collision'){if(performance.now()-this.lastImpact<100)return;this.lastImpact=performance.now();const power=Math.max(0,Math.min(1,(strength-30)/220));this.tone(140+power*100,.035+power*.025,.008+power*.018);return;}
    const notes:Record<Exclude<Effect,'collision'>,number>={passage:620,select:440,roll:115,star:1397,rotate:330,correct:784,wrong:170,key:1175,unlock:660,color:988,perfect:1318,finish:1046,achievement:1568,split:880,theme:587};
    this.tone(notes[effect],effect==='wrong'?.18:effect==='roll'?.065:.13,effect==='roll'?.008:effect==='passage'?.018:effect==='rotate'||effect==='select'?.025:.065);
  }
  private ambient(){
    const ctx=this.context;if(this.background||!this.music||!ctx||ctx.state!=='running')return;
    if(this.nextNote<ctx.currentTime-.2)this.nextNote=ctx.currentTime;
    while(this.nextNote<ctx.currentTime+.15){
      const at=this.nextNote;
      for(const note of musicNotes(this.note++)){
        // Reserve four of the eight voice slots for gameplay feedback.
        if(this.voices>=4||this.musicVoices.size>=4)break;
        try{
          const oscillator=ctx.createOscillator(),gain=ctx.createGain();
          oscillator.type=note.wave;oscillator.frequency.setValueAtTime(note.frequency,at);
          if(note.endFrequency)oscillator.frequency.exponentialRampToValueAtTime?.(note.endFrequency,at+note.duration);
          gain.gain.setValueAtTime(.0001,at);gain.gain.exponentialRampToValueAtTime(note.volume,at+(note.attack??.012));gain.gain.exponentialRampToValueAtTime(.0001,at+note.duration);
          oscillator.connect(gain);gain.connect(ctx.destination);this.voices++;this.musicVoices.add(oscillator);this.activeVoices.add(oscillator);
          oscillator.onended=()=>{if(!this.activeVoices.delete(oscillator))return;this.voices--;this.musicVoices.delete(oscillator);oscillator.disconnect();gain.disconnect();};
          oscillator.start(at);oscillator.stop(at+note.duration);
        }catch{}
      }
      this.nextNote+=MUSIC_STEP_SECONDS;
    }
  }
}
