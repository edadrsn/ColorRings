export type Effect='rotate'|'collision'|'correct'|'wrong'|'key'|'unlock'|'color'|'perfect'|'finish'|'achievement'|'split'|'theme';
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
  private lastImpact=0;
  private createContext:()=>AudioContext;
  constructor(createContext:()=>AudioContext=browserAudioContext){this.createContext=createContext;}
  /** Call directly from a real pointer/key gesture, before any voice-limit checks. */
  async unlock():Promise<boolean>{
    try{
      if(!this.context||this.context.state==='closed')this.context=this.createContext();
      const ctx=this.context,wasRunning=ctx.state==='running';
      if(!wasRunning)await ctx.resume();
      if(ctx.state!=='running')return false;
      if(!wasRunning&&this.music)this.ambient();
      return true;
    }catch{return false;}
  }
  configure(sound:boolean,music:boolean){this.sound=sound;this.music=music;if(!music&&this.timer){clearInterval(this.timer);this.timer=undefined;}if(music&&!this.timer){this.ambient();this.timer=setInterval(()=>this.ambient(),1600);}}
  tone(frequency:number,duration=.1,volume=.065,music=false){
    if((music?!this.music:!this.sound)||this.voices>=8)return;
    // Never queue oscillators in a suspended context. They cannot finish and
    // would exhaust all eight slots before the first user interaction.
    const ctx=this.context;if(!ctx||ctx.state!=='running')return;
    try{
      const oscillator=ctx.createOscillator(),gain=ctx.createGain();oscillator.type='sine';oscillator.frequency.setValueAtTime(frequency,ctx.currentTime);
      gain.gain.setValueAtTime(.0001,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(volume,ctx.currentTime+.012);gain.gain.exponentialRampToValueAtTime(.0001,ctx.currentTime+duration);
      oscillator.connect(gain);gain.connect(ctx.destination);this.voices++;oscillator.onended=()=>{this.voices--;oscillator.disconnect();gain.disconnect();};oscillator.start();oscillator.stop(ctx.currentTime+duration);
    }catch{}
  }
  async test():Promise<boolean>{
    if(!this.sound||!await this.unlock())return false;
    this.tone(523.25,.22,.09);this.tone(783.99,.32,.07);return true;
  }
  effect(effect:Effect){
    if(effect==='collision'){if(performance.now()-this.lastImpact<100)return;this.lastImpact=performance.now();this.tone(180,.045,.016);return;}
    const notes:Record<Exclude<Effect,'collision'>,number>={rotate:330,correct:784,wrong:170,key:1175,unlock:660,color:988,perfect:1318,finish:1046,achievement:1568,split:880,theme:587};
    this.tone(notes[effect],effect==='wrong'?.18:.13,effect==='rotate'?.035:.065);
  }
  private ambient(){this.tone([261.63,329.63,392,329.63][this.note++%4],1.35,.014,true);}
}
