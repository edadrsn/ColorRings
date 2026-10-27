import {paletteColors,type PaletteId} from './palettes.ts';
import type Phaser from 'phaser';
import {COLORS,radians,type Level} from './levels.ts';
import type {PhysicsWorld} from './physics.ts';
import {mechanicPoint,movingSegments,passageSegments} from './mechanics.ts';
export class MechanicsView {
  private colors=paletteColors('pastel');
  setPalette(id:PaletteId){this.colors=paletteColors(id);}

  private graphics:Phaser.GameObjects.Graphics;
  private level:Level;
  private opened=new Map<string,number>();
  private keyLabels:Phaser.GameObjects.Text[]=[];
  private lockLabels:Phaser.GameObjects.Text[]=[];
  private budgets:Phaser.GameObjects.Text[]=[];
  private remaining:number[]=[];
  constructor(scene:Phaser.Scene,level:Level){this.level=level;this.graphics=scene.add.graphics().setDepth(3);
    const label=(text:string)=>scene.add.text(0,0,text,{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#5f4870',backgroundColor:'#fff7dc'}).setPadding(2).setOrigin(.5).setDepth(6);
    this.keyLabels=(level.keys??[]).map((_,i)=>label(String(i+1)));this.lockLabels=(level.locks??[]).map(lock=>label(String(Math.max(0,level.keys?.findIndex(key=>key.lock===lock.id)??0)+1)));
    this.budgets=(level.ringLimits??[]).map(()=>label(''));
    for(const splitter of level.splitters??[])label('×2').setPosition(splitter.x,splitter.y-2);
  }
  setBudgets(values:number[]){this.remaining=[...values];}
  update(angles:number[],world:PhysicsWorld|null,time:number,reduced=false){
    const g=this.graphics;g.clear();const unlocked=world?.unlocked??new Set<string>();
    this.budgets.forEach((label,i)=>label.setText(`${this.remaining[i]??this.level.ringLimits![i]}`).setPosition(270,265-this.level.rings[i].radius));
    for(const link of this.level.links??[]){const a=270-this.level.rings[link.driver].radius,b=270-this.level.rings[link.follower].radius;g.lineStyle(1.5,0xd1b0ed,.65);for(let x=Math.min(a,b);x<Math.max(a,b);x+=9)g.lineBetween(x,280,Math.min(x+4,Math.max(a,b)),280);for(const x of [a,b]){g.fillStyle(0xbb98d9,.9);g.fillCircle(x,280,5);g.lineStyle(1,0xffffff,.9);g.strokeCircle(x,280,5);}}
    for(const splitter of this.level.splitters??[]){g.fillStyle(0xb497cc,.85);g.fillRoundedRect(splitter.x-22,splitter.y-17,44,35,9);g.lineStyle(2,0xffffff,.8);g.strokeRoundedRect(splitter.x-22,splitter.y-17,44,35,9);for(const outlet of splitter.outlets){g.fillStyle(this.colors[splitter.color].hex);g.fillCircle(splitter.x+outlet.x,splitter.y+outlet.y,5);}}
    for(const id of this.opened.keys())if(!unlocked.has(id))this.opened.delete(id);
    for(const lock of this.level.locks??[])if(unlocked.has(lock.id)){
      if(!this.opened.has(lock.id))this.opened.set(lock.id,time);
      const elapsed=time-this.opened.get(lock.id)!;
      if(!reduced&&elapsed<.45){const ring=this.level.rings[lock.ring],angle=radians((lock.kind==='ring'?270:ring.gaps[lock.gap??0].angle)+angles[lock.ring]),x=270+Math.cos(angle)*ring.radius,y=280+Math.sin(angle)*ring.radius;g.lineStyle(3,0xffda8c,1-elapsed/.45);g.strokeCircle(x,y,10+elapsed*45);}
    }
    for(const segment of passageSegments({...this.level,oneWays:[]},angles,unlocked)){g.lineStyle(segment.radius*2,0xe9bb64,.95);g.lineBetween(segment.a.x,segment.a.y,segment.b.x,segment.b.y);}
    this.keyLabels.forEach((label,i)=>label.setVisible(!world?.collected.has(this.level.keys![i].id)));
    this.lockLabels.forEach((label,i)=>label.setVisible(!unlocked.has(this.level.locks![i].id)));
    for(const [i,key] of (this.level.keys??[]).entries())if(!world?.collected.has(key.id)){
      const point=mechanicPoint(key,key.ring,angles),color=i%2?0x6ccac7:0xe9bb64;
      g.fillStyle(color,.2);g.fillCircle(point.x,point.y,16);g.lineStyle(4,color,1);g.strokeCircle(point.x,point.y,8);g.lineBetween(point.x+5,point.y+4,point.x+14,point.y+13);g.lineBetween(point.x+11,point.y+10,point.x+15,point.y+6);
      this.keyLabels[i].setPosition(point.x-3,point.y-13);
    }
    for(const [i,lock] of (this.level.locks??[]).entries())if(!unlocked.has(lock.id)){
      const ring=this.level.rings[lock.ring],angle=radians((lock.kind==='ring'?270:ring.gaps[lock.gap??0].angle)+angles[lock.ring]),x=270+Math.cos(angle)*ring.radius,y=280+Math.sin(angle)*ring.radius;
      g.fillStyle(i%2?0x6ccac7:0xe9bb64);g.fillRoundedRect(x-9,y-4,18,16,4);g.lineStyle(2,0xffffff,.9);g.strokeCircle(x,y-5,6);
      this.lockLabels[i].setPosition(x,y+3);
    }
    for(const gate of this.level.colorGates??[]){
      const radius=this.level.rings[gate.ring].radius,a=radians(gate.angle+angles[gate.ring]);
      for(const [offset,color] of [[-9,gate.from],[9,gate.to]] as const){const x=270+Math.cos(a)*(radius+offset),y=280+Math.sin(a)*(radius+offset);g.fillStyle(this.colors[color].hex,.9);g.fillCircle(x,y,6);g.lineStyle(1.5,0xffffff,.9);g.strokeCircle(x,y,6);}
    }
    for(const gate of this.level.oneWays??[]){const ring=this.level.rings[gate.ring],a=radians(ring.gaps[gate.gap].angle+angles[gate.ring]),sign=gate.direction==='outward'?1:-1,x=270+Math.cos(a)*ring.radius,y=280+Math.sin(a)*ring.radius,dx=Math.cos(a)*sign,dy=Math.sin(a)*sign;
      g.lineStyle(3,0x7abfb6,reduced?.85:.75+.2*Math.sin(time*4));g.lineBetween(x-dx*10,y-dy*10,x+dx*10,y+dy*10);g.lineBetween(x+dx*10,y+dy*10,x+dx*2-dy*6,y+dy*2+dx*6);g.lineBetween(x+dx*10,y+dy*10,x+dx*2+dy*6,y+dy*2-dx*6);
    }
    for(const segment of movingSegments(this.level,world?.time??0)){g.fillStyle(0x8e7ba7,.9);g.fillCircle(segment.a.x,segment.a.y,segment.radius);g.lineStyle(2,0xffffff,.8);g.strokeCircle(segment.a.x,segment.a.y,segment.radius);}
    for(const exit of this.level.exits??[]){g.lineStyle(2,this.colors[exit.color].hex,.45);g.strokeEllipse(exit.x,exit.y,28,13);g.lineBetween(exit.x,exit.y+10,exit.x,exit.y+28);}
  }
}
