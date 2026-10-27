import type {TutorialView} from './tutorial.ts';
/** Requires a real rotation during motion and a correct delivery, in either order. */
export class LiveTutorial{
 private rotated=false;private delivered=false;private skipped=false;
 rotate(running:boolean){if(running)this.rotated=true;}
 deliver(correct:boolean){if(correct)this.delivered=true;}
 skip(){this.skipped=true;}
 get complete(){return this.skipped||this.rotated&&this.delivered;}
 get view():TutorialView|null{if(this.complete)return null;return {kind:this.rotated?'motion':'rotate',ring:this.rotated?null:0,total:2,step:this.rotated?2:1,message:this.rotated?'Güzel! Şimdi bir topu kendi renkli kovasına ulaştır.':'Toplar hareket ederken halkayı sürükle. Pause ile istediğinde bekletebilirsin.'};}
}
