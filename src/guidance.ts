import {paletteColors,type PaletteId} from './palettes.ts';
import type Phaser from 'phaser';
import {BOARD,COLORS,type Level,type Vec} from './levels.ts';
import {MotionPreviewCache} from './preview.ts';
import type {TutorialView} from './tutorial.ts';

/** Two reused graphics layers, without textures, particles, or a second animation loop. */
export class BoardGuidance {
  private colors=paletteColors('pastel');
  setPalette(id:PaletteId){this.colors=paletteColors(id);this.drawn=null;}

  private paths:Phaser.GameObjects.Graphics;
  private cue:Phaser.GameObjects.Graphics;
  private cache=new MotionPreviewCache();
  private preview=true;
  private lesson:TutorialView|null=null;
  private drawn:unknown=null;
  private readonly level:Level;
  private reduced:boolean;
  private hint:{ring:number;direction:number;until:number}|null=null;
  constructor(scene:Phaser.Scene,level:Level,reduced:boolean){
    this.level=level;this.reduced=reduced;
    this.paths=scene.add.graphics().setDepth(2);this.cue=scene.add.graphics().setDepth(12);
  }
  setPreview(enabled:boolean){this.preview=enabled;if(!enabled)this.hide();}
  setReducedMotion(reduced:boolean){this.reduced=reduced;}
  showHint(ring:number,direction:number,time:number){this.hint={ring,direction,until:time+3200};}
  setTutorial(view:TutorialView|null){this.lesson=view;this.cue.clear();}
  reset(){this.cache.reset();this.drawn=null;this.hint=null;this.hide();}
  hide(){this.paths.setVisible(false);this.cue.setVisible(false);}
  update(time:number,angles:readonly number[],planning:boolean,dragging:boolean){
    if(this.hint&&time>=this.hint.until)this.hint=null;
    const motionLesson=this.lesson?.kind==='motion';
    this.paths.setVisible(planning&&this.preview&&!dragging);
    if(this.paths.visible){
      const paths=this.cache.get(this.level,angles,time);
      if(paths!==this.drawn){
        this.paths.clear();this.drawn=paths;
        for(const path of paths){
          this.paths.lineStyle(2.5,this.colors[path.color].hex,.72);this.dashedPath(this.paths,path.points);
          // A small endpoint dot avoids suggesting a route beyond this short horizon.
          if(path.points.length>3){const end=path.points.at(-1)!;this.paths.fillStyle(this.colors[path.color].hex,.65);this.paths.fillCircle(end.x,end.y,2.5);}
        }
      }
    }
    const cue=this.cue;cue.clear();cue.setVisible(!!(this.lesson||this.hint)&&!dragging);
    if(!cue.visible)return;
    if(motionLesson&&planning){
      const alpha=this.reduced ? .5 : .42+.16*Math.sin(time/280);
      for(const ball of this.level.balls){cue.lineStyle(2,this.colors[ball.color].hex,alpha);cue.strokeCircle(ball.x,ball.y,23);}
    }
    const index=this.hint?.ring??this.lesson?.ring;
    if(index===null||index===undefined)return;
    const radius=this.level.rings[index].radius,phase=this.reduced ? .45 : (time%1800)/1800;
    const start=this.hint?.direction===-1?-.25:-.9,end=this.hint?.direction===-1?-.9:-.25;
    cue.lineStyle(3,0xa98cc7,.6);
    for(let a=Math.min(start,end);a<Math.max(start,end);a+=.1){cue.beginPath();cue.arc(BOARD.center.x,BOARD.center.y,radius,a,Math.min(a+.05,Math.max(start,end)));cue.strokePath();}
    const x=BOARD.center.x+Math.cos(end)*radius,y=BOARD.center.y+Math.sin(end)*radius;
    const sign=end>start?1:-1,tx=-Math.sin(end)*sign,ty=Math.cos(end)*sign;
    cue.lineBetween(x,y,x-tx*9-ty*5,y-ty*9+tx*5);cue.lineBetween(x,y,x-tx*9+ty*5,y-ty*9-tx*5);
    const angle=start+(end-start)*Math.min(1,phase*1.45);
    const px=BOARD.center.x+Math.cos(angle)*radius,py=BOARD.center.y+Math.sin(angle)*radius;
    cue.setAlpha(this.reduced?1:phase>.85?(1-phase)/.15:1);
    // Original, outlined finger/palm drawing. The fingertip follows the dotted arc.
    cue.fillStyle(0xffffff,.96);cue.lineStyle(2.2,0xa48ab9,1);
    cue.fillRoundedRect(px-4,py,9,24,4);cue.strokeRoundedRect(px-4,py,9,24,4);
    cue.fillRoundedRect(px-12,py+18,29,24,8);cue.strokeRoundedRect(px-12,py+18,29,24,8);
    cue.fillStyle(0xffffff);cue.fillRect(px-2,py+15,5,14);
    cue.lineStyle(1.5,0xc4b0d3,.8);cue.lineBetween(px+7,py+23,px+7,py+31);
  }
  private dashedPath(graphics:Phaser.GameObjects.Graphics,points:Vec[]){
    let distance=0;
    for(let i=1;i<points.length;i++){
      const a=points[i-1],b=points[i],length=Math.hypot(b.x-a.x,b.y-a.y);let travelled=0;
      while(travelled<length){
        const phase=distance%11,amount=Math.min(length-travelled,phase<6?6-phase:11-phase);
        if(amount<.00001){distance+=.00001;continue;}
        if(phase<6)graphics.lineBetween(a.x+(b.x-a.x)*travelled/length,a.y+(b.y-a.y)*travelled/length,a.x+(b.x-a.x)*(travelled+amount)/length,a.y+(b.y-a.y)*(travelled+amount)/length);
        travelled+=amount;distance+=amount;
      }
    }
  }
}
