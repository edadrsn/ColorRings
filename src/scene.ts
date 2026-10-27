import {RenderTelemetry} from './render-telemetry.ts';
import {BALL_ART_SIZE,PALETTE_MOTION,rollingAngle,impactStyle} from './gameplay-presentation.ts';
import {presentationTheme} from './visual-theme.ts';
import {paletteColors,type PaletteId} from './palettes.ts';
import {effectBudget,type EffectQuality} from './effects.ts';
import Phaser from 'phaser';
import { LEVELS, COLORS, angularDistance, normalize, type Level, type Color } from './levels.ts';
import { BALL_RADIUS, geometry, type PhysicsWorld } from './physics.ts';
import { createArtwork, createSkinArtwork, ballTexture,colorTexture, ringTexture,createThemeArtwork,themedRingTexture } from './artwork.ts';
import type {SkinId} from './cosmetics.ts';
import { pickRing, rotationDelta, snapRotation, interpolateRotation, DeliveryCombo } from './presentation.ts';
import {BoardGuidance} from './guidance.ts';
import type {TutorialView} from './tutorial.ts';
import {MechanicsView} from './mechanics-view.ts';
import {bucketTarget,bucketDelivered} from './buckets.ts';
import {THEMES,themeById,type ThemeId} from './themes.ts';
import type {Effect} from './audio.ts';
import {advanceAtRate} from './clock.ts';
import {SolutionPlayback,type SolutionRecording} from './playback.ts';
import {drawThemeBackdrop} from './theme-backdrop.ts';

type Callbacks = { ready:()=>void; begin:(index:number)=>boolean; change:(index:number,angle:number)=>void; end:()=>void; arrive:(color:Color,correct:boolean)=>void; finish:()=>void; motion?:()=>void;effect?:(effect:Effect)=>void;tick?:(seconds:number)=>void };
type Drag = { id:number; index:number; previous:number; startX:number; startY:number; moved:boolean };
export class RingsScene extends Phaser.Scene {
  private callbacks:Callbacks;
  private telemetry=new RenderTelemetry();
  private lastRenderAt:number|null=null;
  private rings:Phaser.GameObjects.Image[]=[];
  private glows:Phaser.GameObjects.Graphics[]=[];
  private balls:Phaser.GameObjects.Container[]=[];
  private cups:Phaser.GameObjects.Container[]=[];
  private cupChecks:Phaser.GameObjects.Text[]=[];
  private trails:Phaser.GameObjects.Image[][]=[];
  private trailHeads:number[]=[];
  private trailTimes:number[]=[];
  private particles:Phaser.GameObjects.Arc[]=[];
  private particleHead=0;
  private level:Level=LEVELS[0];
  private world:PhysicsWorld|null=null;
  private arrived=new Set<number>();
  private angles=this.level.rings.map(r=>normalize(r.initial));
  private visualAngles=[...this.angles];
  private interactive=true;
  private drag:Drag|null=null;
  private reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  private showSymbols=true;
  private skin:SkinId='classic';
  private palette:PaletteId='pastel';
  private colors=paletteColors('pastel');
  private quality:EffectQuality='medium';
  private impactTimes:number[]=[];
  private lastVelocities:{x:number;y:number}[]=[];
  private paused=false;
  private keyboardRing=-1;
  private combo=new DeliveryCombo();
  private comboText!:Phaser.GameObjects.Text;
  private cupRipples:Phaser.GameObjects.Ellipse[]=[];
  private guidance!:BoardGuidance;
  private motionReported=false;
  private mechanics!:MechanicsView;
  private board!:Phaser.GameObjects.Graphics;
  private contrastGeometry!:Phaser.GameObjects.Graphics;
  private starField!:Phaser.GameObjects.Graphics;
  private theme:ThemeId='classic';
  private activeTheme:ThemeId='classic';
  private fillGraphics:Phaser.GameObjects.Graphics[]=[];
  private fillValues:{value:number}[]=[];
  private fillLabels:Phaser.GameObjects.Text[]=[];
  private shownColors:Color[]=[];
  private viewWorld:PhysicsWorld|null=null;
  private playback:SolutionPlayback|null=null;
  private speed:1|2=1;
  private baseRate=1;
  private previews=new Map<SkinId,string[]>();
  constructor(callbacks:Callbacks){super('ColorRings');this.callbacks=callbacks;}
  create(){this.cameras.main.setZoom(1);createArtwork(this);this.drawBoard();this.bindControls();this.callbacks.ready();}
  loadLevel(level:Level){
    this.world=null;this.viewWorld=null;this.playback=null;this.interactive=true;this.drag=null;this.arrived.clear();this.keyboardRing=-1;this.combo.reset();
    this.tweens.killAll();this.time.removeAllEvents();this.children.removeAll(true);
    this.level.rings.forEach((_,index)=>THEMES.forEach(theme=>{const key=themedRingTexture(this.level,index,theme.id);if(this.textures.exists(key))this.textures.remove(key);}));
    this.rings=[];this.glows=[];this.balls=[];this.cups=[];this.cupChecks=[];this.cupRipples=[];this.trails=[];this.particles=[];this.particleHead=0;
    this.level=level;createArtwork(this,level,this.palette);this.angles=level.rings.map(r=>normalize(r.initial));this.visualAngles=[...this.angles];this.drawBoard();
  }
  private drawBoard(){
    this.board=this.add.graphics();this.starField=this.add.graphics().setDepth(-1);this.contrastGeometry=this.add.graphics().setDepth(1);this.paintBoard();
    this.level.rings.forEach((_,index)=>{
      const glow=this.add.graphics();this.glows.push(glow);
      const ring=this.add.image(270,280,ringTexture(this.level,index)).setDisplaySize(512,512);this.rings.push(ring);
    });
    this.renderRings();this.drawCups();this.spawnBalls();
    this.guidance=new BoardGuidance(this,this.level,this.reduced);
    this.mechanics=new MechanicsView(this,this.level);this.mechanics.setPalette(this.palette);this.guidance.setPalette(this.palette);this.setTheme(this.theme);
    this.comboText=this.add.text(270,34,'',{fontFamily:'Segoe UI, Arial',fontSize:'25px',fontStyle:'bold',color:'#9971b4',stroke:'#fff8ff',strokeThickness:5}).setOrigin(.5).setDepth(40).setVisible(false);
    for(let i=0;i<56;i++)this.particles.push(this.add.circle(0,0,3,0xffffff).setVisible(false).setDepth(30));
  }
  private paintBoard(){
    const bg=this.board;bg.clear();const theme=themeById(this.activeTheme),dark=theme.dark;
    bg.fillStyle(dark?0x020a1d:0x687fa6,.2);bg.fillEllipse(270,532,450,36);
    bg.fillStyle(dark?0x080f28:0x91a6cb,.35);bg.fillCircle(270,288,237);
    bg.fillStyle(dark?0x17233e:0xffffff,dark?.9:.72);bg.fillCircle(270,280,237);
    bg.lineStyle(3,dark?0x5d77aa:0xffffff,.8);bg.strokeCircle(270,278,236);
    bg.lineStyle(1,dark?0x8b7cb8:0x7495b9,.3);bg.strokeCircle(270,282,231);
    const divider=geometry([0,0],this.level).filter(segment=>segment.ring===-1);
    for(const segment of divider){bg.lineStyle(segment.radius*2+3,0x162947,.2);bg.lineBetween(segment.a.x,segment.a.y+4,segment.b.x,segment.b.y+4);bg.lineStyle(segment.radius*2,dark?0xa2b7da:0x57738f);bg.lineBetween(segment.a.x,segment.a.y,segment.b.x,segment.b.y);bg.lineStyle(Math.max(1,segment.radius*2-4),0xe0faff,.3);bg.lineBetween(segment.a.x,segment.a.y-1,segment.b.x,segment.b.y-1);}
    const hub=this.level.rings[0].radius<75?8:17;bg.fillStyle(0x162840,.3);bg.fillCircle(270,286,hub+2);bg.fillStyle(dark?0xadc0e0:0x4b6d8c);bg.fillCircle(270,280,hub);bg.fillStyle(0xdeefff);bg.fillCircle(268,277,hub*.5);
  }
  private bindControls(){
    this.input.on('pointerdown',(pointer:Phaser.Input.Pointer)=>{
      const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      if(!this.interactive||this.drag||this.paused)return;const index=pickRing(point,this.level);
      if(index<0||!this.callbacks.begin(index))return;
      this.drag={id:pointer.id,index,previous:Math.atan2(point.y-280,point.x-270)*180/Math.PI,startX:pointer.x,startY:pointer.y,moved:false};
      this.callbacks.effect?.('select');
      this.input.setDefaultCursor('grabbing');this.renderRings(index);
    });
    this.input.on('pointermove',(pointer:Phaser.Input.Pointer)=>{
      const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      if(!this.drag){this.input.setDefaultCursor(this.interactive&&pickRing(point,this.level)>=0?'grab':'default');return;}
      if(pointer.id!==this.drag.id||!pointer.isDown||!this.interactive||this.paused||Math.hypot(point.x-270,point.y-280)<32)return;
      const drag=this.drag,current=Math.atan2(point.y-280,point.x-270)*180/Math.PI;
      // Pointer events can be sparse on mobile. Physics still sweeps live targets
      // at two degrees per step; do not discard a legitimate fast drag here.
      const delta=rotationDelta(drag.previous,current);drag.previous=current;
      if(Math.hypot(pointer.x-drag.startX,pointer.y-drag.startY)>5)drag.moved=true;
      if(drag.moved){this.angles[drag.index]=normalize(this.angles[drag.index]+delta);this.callbacks.change(drag.index,this.angles[drag.index]);}
    });
    const release=(pointer:Phaser.Input.Pointer)=>{
      if(!this.drag||pointer.id!==this.drag.id)return;const drag=this.drag;this.drag=null;this.input.setDefaultCursor('grab');
      // A fast gesture can release between move events. Include its final
      // position before snapping so narrow passages follow the finger exactly.
      const point=this.cameras.main.getWorldPoint(pointer.x,pointer.y);
      if(drag.moved&&Math.hypot(point.x-270,point.y-280)>=32){
        const finalAngle=Math.atan2(point.y-280,point.x-270)*180/Math.PI;
        this.angles[drag.index]=normalize(this.angles[drag.index]+rotationDelta(drag.previous,finalAngle));
      }
      this.angles[drag.index]=drag.moved?snapRotation(this.angles[drag.index],this.level.rotationStep??15):normalize(this.angles[drag.index]+30);
      this.callbacks.change(drag.index,this.angles[drag.index]);this.callbacks.end();this.renderRings();
    };
    this.input.on('pointerup',release);this.input.on('pointerupoutside',release);
  }
  private renderRings(selected=-1){
    if(selected<0)selected=this.keyboardRing;
    const display=this.visualAngles;
    this.level.rings.forEach((ring,index)=>{
      this.rings[index].setAngle(display[index]);const glow=this.glows[index];glow.clear();
      const locked=this.world?this.world.isRingLocked(index):this.level.locks?.some(lock=>lock.kind==='ring'&&lock.ring===index);
      if(index===selected){glow.lineStyle(ring.width+14,locked?0xf1bc60:PALETTE_MOTION[this.palette].accent,.22);glow.strokeCircle(270,280,ring.radius);glow.lineStyle(2,locked?0xffd984:0xffffff,.85);glow.strokeCircle(270,280,ring.radius+10);}
    });
  }
  private drawCups(){
    this.fillGraphics=[];this.fillValues=[];this.fillLabels=[];
    for(const cup of this.level.cups){
      const scale=cup.width/164,container=this.add.container(cup.x,cup.y);
      const ripple=this.add.ellipse(0,-4,126*scale,24,this.colors[cup.color].hex,0).setStrokeStyle(3,0xffffff,.9).setAlpha(0);container.add(ripple);this.cupRipples.push(ripple);
      container.add(this.add.image(0,0,colorTexture('bucket',cup.color,this.palette)).setName('bucket').setOrigin(.5,40/220).setDisplaySize(200*scale,110));
      const fill=this.add.graphics();container.add(fill);this.fillGraphics.push(fill);this.fillValues.push({value:0});
      const symbol=this.add.text(0,32,this.colors[cup.color].symbol,{fontFamily:'Arial',fontSize:'24px',color:'#ffffff'}).setOrigin(.5).setName('cup-symbol');container.add(symbol);
      const check=this.add.text(0,24,'✓',{fontFamily:'Arial',fontSize:'29px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5).setVisible(false);container.add(check);
      this.cups.push(container);this.cupChecks.push(check);
      const count=this.add.text(0,48,`0/${bucketTarget(this.level,cup.color)}`,{fontFamily:'Arial',fontSize:'12px',fontStyle:'bold',color:'#ffffff'}).setOrigin(.5);container.add(count);this.fillLabels.push(count);
    }
  }
  private spawnBalls(){
    this.balls.forEach(ball=>{this.tweens.killTweensOf(ball);ball.destroy();});this.trails.flat().forEach(trail=>trail.destroy());this.balls=[];this.trails=[];this.trailHeads=[];this.trailTimes=[];
    const initialBalls=this.world?.states??this.level.balls;
    for(const initial of initialBalls){
      // The halo is larger; the collision radius stays unchanged so narrow solutions survive.
      createSkinArtwork(this,this.skin,this.palette);
      const body=this.add.image(0,0,ballTexture(initial.color,this.skin,this.palette)).setDisplaySize(BALL_ART_SIZE,BALL_ART_SIZE).setName('body');
      const mark=this.add.graphics().setName('roll-mark');mark.lineStyle(1.5,0xffffff,.28);mark.beginPath();mark.arc(0,0,BALL_RADIUS-3,.25,.8);mark.strokePath();
      const symbol=this.add.text(0,9,this.colors[initial.color].symbol,{fontFamily:'Arial',fontSize:'10px',fontStyle:'bold',color:'#ffffff',stroke:'#193050',strokeThickness:2}).setOrigin(.5).setVisible(this.showSymbols).setName('ball-symbol');
      const trails:Phaser.GameObjects.Image[]=[];for(let i=0;i<8;i++)trails.push(this.add.image(initial.x,initial.y,colorTexture('trail',initial.color,this.palette)).setDisplaySize(35,35).setAlpha(0));
      this.trails.push(trails);this.trailHeads.push(0);this.trailTimes.push(0);this.balls.push(this.add.container(initial.x,initial.y,[body,mark,symbol]).setDepth(4));
    }
    this.shownColors=initialBalls.map(ball=>ball.color);
  }
  setAngles(angles:number[]){this.angles=[...angles];if(this.reduced)this.visualAngles=[...angles];this.renderRings(this.drag?.index??-1);}
  setPaused(paused:boolean){this.paused=paused;this.time.paused=paused;if(paused)this.tweens.pauseAll();else this.tweens.resumeAll();if(paused)this.guidance.hide();if(paused&&this.drag){this.drag=null;this.callbacks.end();this.renderRings();}}
  setMotionPreview(enabled:boolean){this.guidance.setPreview(enabled);}
  setSpeed(speed:1|2,baseRate=1){this.speed=speed;this.baseRate=baseRate;}
  setRingBudgets(values:number[]){this.mechanics.setBudgets(values);}
  performanceSnapshot(){let bytes=0;const keys=this.textures.getTextureKeys();for(const key of keys){const source=this.textures.get(key).getSourceImage() as {width?:number;height?:number};bytes+=(source.width??0)*(source.height??0)*4;}const heap=(performance as Performance&{memory?:{usedJSHeapSize:number}}).memory?.usedJSHeapSize;return {...this.telemetry.snapshot(),textures:keys.length,textureMB:bytes/1024/1024,heapMB:heap===undefined?null:heap/1024/1024};}
  skinPreview(skin:SkinId):string[]{if(!this.previews.has(skin)){createSkinArtwork(this,skin,this.palette);this.previews.set(skin,(['pink','blue'] as Color[]).map(color=>(this.textures.get(ballTexture(color,skin,this.palette)).getSourceImage() as HTMLCanvasElement).toDataURL()));}return this.previews.get(skin)!;}
  setPalette(id:PaletteId){
    if(id===this.palette)return;const previous=this.palette;this.palette=id;this.colors=paletteColors(id);this.previews.clear();
    createArtwork(this,this.level,id);createSkinArtwork(this,this.skin,id);
    this.balls.forEach((ball,i)=>{const color=this.viewWorld?.states[i].color??this.level.balls[i].color;(ball.getByName('body') as Phaser.GameObjects.Image).setTexture(ballTexture(color,this.skin,id));this.trails[i].forEach(trail=>trail.setTexture(colorTexture('trail',color,id)).setAlpha(0));});
    this.cups.forEach((cup,i)=>{(cup.getByName('bucket') as Phaser.GameObjects.Image).setTexture(colorTexture('bucket',this.level.cups[i].color,id));this.cupRipples[i].setFillStyle(this.colors[this.level.cups[i].color].hex);if(this.viewWorld)this.fillCup(i,bucketDelivered(this.viewWorld,this.level.cups[i].color),false);});
    this.mechanics.setPalette(id);this.guidance.setPalette(id);this.setTheme(this.theme);
    for(const texture of this.textures.getTextureKeys())if(/^(marble|bucket|trail)-/.test(texture)&&texture.endsWith('-'+previous))this.textures.remove(texture);
  }
  setEffectQuality(quality:EffectQuality){this.quality=quality;this.trails.flat().forEach(trail=>trail.setAlpha(0));this.particles.forEach(p=>{this.tweens.killTweensOf(p);p.setVisible(false);});}
  setReducedMotion(reduced:boolean){this.reduced=reduced;this.guidance.setReducedMotion(reduced);if(reduced){this.trails.flat().forEach(trail=>trail.setAlpha(0));this.particles.forEach(p=>{this.tweens.killTweensOf(p);p.setVisible(false);});}}
  showVisualHint(ring:number,direction:number){this.focusRing(ring);this.guidance.showHint(ring,direction,this.time.now);this.time.delayedCall(3250,()=>{if(!this.drag)this.focusRing(-1);});}
  setTheme(id:ThemeId){
    const before=this.activeTheme;this.theme=id;id=presentationTheme(id,this.palette);this.activeTheme=id;const theme=themeById(id);createThemeArtwork(this,this.level,id);
    this.rings.forEach((ring,i)=>ring.setTexture(themedRingTexture(this.level,i,id)));
    if(before!==id&&before!=='classic')this.level.rings.forEach((_,i)=>{const key=themedRingTexture(this.level,i,before);if(this.textures.exists(key))this.textures.remove(key);});
    this.cameras.main.setBackgroundColor(theme.background);this.paintBoard();this.starField.clear();
    this.contrastGeometry.clear();if(theme.dark){for(const segment of geometry(this.angles,this.level).filter(segment=>segment.ring===-1)){this.contrastGeometry.lineStyle(segment.radius*2,0xb4a8cd,.65);this.contrastGeometry.lineBetween(segment.a.x,segment.a.y,segment.b.x,segment.b.y);}this.contrastGeometry.lineStyle(2,0xb4a8cd,.65);this.contrastGeometry.strokeCircle(270,283,this.level.rings[0].radius<75?8:18);}
    drawThemeBackdrop(this.starField,id);
    this.cups.forEach(cup=>(cup.getByName('bucket') as Phaser.GameObjects.Image).setTint(id==='candy'?0xffefff:theme.dark?0xdaedff:0xffffff));
  }
  setTutorial(view:TutorialView|null){this.guidance.setTutorial(view);}
  focusRing(index:number){this.keyboardRing=index;this.renderRings();}
  setSkin(skin:SkinId){this.skin=skin;createSkinArtwork(this,skin,this.palette);this.balls.forEach((ball,index)=>(ball.getByName('body') as Phaser.GameObjects.Image).setTexture(ballTexture(this.viewWorld?.states[index].color??this.level.balls[index].color,skin,this.palette)));}
  setSymbols(show:boolean){this.showSymbols=show;this.cups.forEach((cup,i)=>(cup.getByName('cup-symbol') as Phaser.GameObjects.Text).setVisible(show&&!this.cupChecks[i].visible));this.balls.forEach(ball=>(ball.getByName('ball-symbol') as Phaser.GameObjects.Text).setVisible(show));}
  start(world:PhysicsWorld){this.playback=null;this.interactive=true;this.drag=null;this.world=world;this.viewWorld=world;this.motionReported=false;this.guidance.hide();this.visualAngles=[...world.angles];this.arrived.clear();this.combo.reset();this.comboText.setVisible(false);this.spawnBalls();this.renderRings();}
  startReplay(recording:SolutionRecording){const player=new SolutionPlayback(recording);this.restoreWorld(player.world);this.playback=player;this.interactive=false;}
  showFinished(world:PhysicsWorld){this.restoreWorld(world);this.world=null;this.interactive=false;this.playback=null;}
  reset(angles:number[]){
    this.world=null;this.viewWorld=null;this.arrived.clear();this.lastVelocities=[];this.impactTimes=[];this.interactive=true;this.drag=null;this.keyboardRing=-1;this.tweens.killAll();this.time.removeAllEvents();
    this.playback=null;
    this.motionReported=false;this.guidance.reset();
    this.combo.reset();this.comboText.setVisible(false);this.cupRipples.forEach(ripple=>ripple.setAlpha(0).setScale(1));
    this.particles.forEach(particle=>particle.setVisible(false));this.cups.forEach((cup,i)=>cup.setPosition(this.level.cups[i].x,this.level.cups[i].y).setScale(1).setAngle(0));this.cupChecks.forEach(check=>check.setVisible(false));
    this.cups.forEach(cup=>(cup.getByName('cup-symbol') as Phaser.GameObjects.Text).setVisible(this.showSymbols));
    this.angles=[...angles];this.visualAngles=[...angles];this.renderRings();this.spawnBalls();
    this.clearFills();
  }
  private clearFills(){this.fillValues.forEach(value=>value.value=0);this.fillGraphics.forEach(graphic=>graphic.clear());this.fillLabels.forEach((label,i)=>label.setText(`0/${bucketTarget(this.level,this.level.cups[i].color)}`));}
  private fillCup(index:number,count:number,animate=true){
    const cup=this.level.cups[index],target=bucketTarget(this.level,cup.color),value=this.fillValues[index];this.fillLabels[index].setText(`${count}/${target}`);
    const draw=()=>{const g=this.fillGraphics[index],ratio=value.value,scale=cup.width/164,top=55-55*ratio,bottom=56*scale,wide=(56+15*ratio)*scale;g.clear();if(ratio<=0)return;g.fillStyle(this.colors[cup.color].hex,.5);g.beginPath();g.moveTo(-bottom,58);g.lineTo(bottom,58);g.lineTo(wide,top);g.lineTo(-wide,top);g.closePath();g.fillPath();g.fillStyle(0xffffff,.32);g.fillEllipse(0,top,wide*2,12);};
    this.tweens.killTweensOf(value);if(animate&&!this.reduced)this.tweens.add({targets:value,value:Math.min(1,count/Math.max(1,target)),duration:420,ease:'Sine.easeOut',onUpdate:draw});else {value.value=Math.min(1,count/Math.max(1,target));draw();}
  }
  restoreWorld(world:PhysicsWorld){this.tweens.killAll();this.time.removeAllEvents();this.cups.forEach((cup,i)=>cup.setPosition(this.level.cups[i].x,this.level.cups[i].y).setScale(1).setAngle(0));this.start(world);this.clearFills();world.states.forEach((state,i)=>{this.balls[i].setPosition(state.x,state.y);if(state.done){this.arrived.add(i);this.balls[i].setAlpha(0);}});this.level.cups.forEach((cup,i)=>{const count=bucketDelivered(world,cup.color),full=count>=bucketTarget(this.level,cup.color);this.fillCup(i,count,false);this.cupChecks[i].setVisible(full).setScale(1);(this.cups[i].getByName('cup-symbol') as Phaser.GameObjects.Text).setVisible(this.showSymbols&&!full);});}
  update(_time:number,delta:number){
    const wallNow=performance.now();if(this.lastRenderAt!==null)this.telemetry.sample(wallNow-this.lastRenderAt,!this.paused&&!document.hidden);this.lastRenderAt=wallNow;
    if(this.paused)return;
    if(this.interactive||this.world)this.callbacks.tick?.(Math.min(.1,Math.max(0,delta/1000)));
    this.tweens.timeScale=this.world?this.speed*this.baseRate:1;
    this.mechanics.update(this.visualAngles,this.world??this.viewWorld,_time/1000,this.reduced);
    if(this.activeTheme==='space')this.starField.setAlpha(this.reduced?1:.85+.15*Math.sin(_time/900));
    this.glows.forEach(glow=>glow.setAlpha(this.reduced?1:.86+.14*Math.sin(_time/210)));
    for(const group of this.trails)for(const trail of group)if(trail.alpha>0)trail.setAlpha(Math.max(0,trail.alpha-delta*.0008));
    if(!this.world){
      let changed=false;const factor=this.reduced?1:1-Math.exp(-delta/(this.drag?28:65));
      this.visualAngles=this.visualAngles.map((angle,i)=>{const diff=rotationDelta(angle,this.angles[i]);if(Math.abs(diff)>.01){changed=true;return normalize(Math.abs(diff)<.1?this.angles[i]:angle+diff*factor);}return angle;});
      if(changed)this.renderRings(this.drag?.index??-1);
      const settling=this.visualAngles.some((angle,i)=>angularDistance(angle,this.angles[i])>.1);
      this.guidance.update(_time,this.angles,this.interactive,!!this.drag||settling);return;
    }
    const world=this.world;
    if(this.playback)this.playback.advance(Math.min(.1,delta/1000)*this.speed);else advanceAtRate(world,delta/1000,this.speed*this.baseRate);
    if(world.states.length!==this.balls.length){this.spawnBalls();world.states.forEach((state,i)=>{this.balls[i].setPosition(state.x,state.y);if(this.arrived.has(i))this.balls[i].setAlpha(0);});}
    for(const event of world.events.splice(0)){
      if(event.type!=='collision')this.callbacks.effect?.(event.type);
      if(event.type==='collision'&&event.ball!==undefined&&_time-(this.impactTimes[event.ball]??-Infinity)>140){
        const style=impactStyle(event.strength??30,event.nx,event.ny),body=this.balls[event.ball]?.getByName('body') as Phaser.GameObjects.Image|undefined;
        this.impactTimes[event.ball]=_time;this.callbacks.effect?.('collision');
        this.burst(event.x??world.states[event.ball].x,event.y??world.states[event.ball].y,this.colors[world.states[event.ball].color].hex,style.particles);
        if(body&&!this.reduced){this.tweens.killTweensOf(body);body.setScale(style.scaleX*BALL_ART_SIZE/128,style.scaleY*BALL_ART_SIZE/128);this.tweens.add({targets:body,scaleX:BALL_ART_SIZE/128,scaleY:BALL_ART_SIZE/128,duration:125,ease:'Sine.easeOut'});}
      }
      if(event.type==='key'&&event.ball!==undefined)this.burst(world.states[event.ball].x,world.states[event.ball].y,0xf1c363,12);
      if(event.type==='split'&&event.ball!==undefined)this.burst(world.states[event.ball].x,world.states[event.ball].y,this.colors[world.states[event.ball].color].hex,16);
    }
    const rendered=world.angles.map((angle,i)=>interpolateRotation(world.previousAngles[i],angle,world.renderAlpha));
    if(rendered.some((angle,i)=>angularDistance(angle,this.visualAngles[i])>.001)){this.visualAngles=rendered;this.renderRings(this.drag?.index??-1);}
    this.guidance.update(_time,this.visualAngles,false,!!this.drag);
    if(!this.motionReported&&world.states.some(state=>Math.hypot(state.x-this.level.balls[state.origin].x,state.y-this.level.balls[state.origin].y)>10)){this.motionReported=true;this.callbacks.motion?.();}
    world.runs.forEach((run,index)=>{
      if(this.arrived.has(index))return;const state=world.states[index],ball=this.balls[index],previous=world.previous[index],alpha=world.renderAlpha;
      const x=Phaser.Math.Linear(previous.x,state.x,alpha),y=Phaser.Math.Linear(previous.y,state.y,alpha);
      if(this.shownColors[index]!==state.color){this.shownColors[index]=state.color;(ball.getByName('body') as Phaser.GameObjects.Image).setTexture(ballTexture(state.color,this.skin,this.palette));(ball.getByName('ball-symbol') as Phaser.GameObjects.Text).setText(this.colors[state.color].symbol);this.burst(x,y,this.colors[state.color].hex,12);if(!this.reduced)this.tweens.add({targets:ball,scale:1.15,duration:140,yoyo:true});}
      this.trailTimes[index]+=delta;
      const budget=effectBudget(this.quality,this.reduced);
      if(budget.trail&&this.trailTimes[index]>budget.interval&&Math.hypot(x-ball.x,y-ball.y)>1){const trail=this.trails[index][this.trailHeads[index]++%budget.trail];trail.setTexture(colorTexture('trail',state.color,this.palette));trail.setPosition(ball.x,ball.y).setAlpha(PALETTE_MOTION[this.palette].trailAlpha);this.trailTimes[index]=0;}
      const speed=Math.hypot(state.vx,state.vy),spin=rollingAngle(previous.spin,state.spin,alpha);
      if(speed>50&&speed<500&&y<520&&run.contacts>0)this.callbacks.effect?.('roll');
      if(!this.reduced){(ball.getByName('body') as Phaser.GameObjects.Image).setRotation(spin);const roll=ball.getByName('roll-mark') as Phaser.GameObjects.Graphics;roll.setRotation(-.25+Math.sin(spin)*.12).setAlpha(PALETTE_MOTION[this.palette].shine*(.65+.35*Math.min(1,speed/260)));}
      ball.setPosition(x,y);
      if(state.done){this.arrived.add(index);const correct=run.outcome==='correct';
        const combo=this.combo.deliver(world.time,correct);if(combo>=2)this.showCombo(combo);
        if(run.cup)this.landBall(ball,run.cup,run.color,correct);else this.tweens.add({targets:ball,alpha:.35,duration:180});
        this.callbacks.arrive(run.color,correct);
      }
    });
    if(world.finished){const success=world.result().success;this.angles=[...world.angles];this.visualAngles=[...world.angles];this.world=null;this.interactive=false;this.drag=null;this.renderRings();
      if(success)this.celebrate();this.time.delayedCall(this.reduced?0:260,()=>this.callbacks.finish());
    }
  }
  private showCombo(count:number){
    this.tweens.killTweensOf(this.comboText);this.comboText.setText(`${count}× COMBO!`).setPosition(270,34).setAlpha(1).setScale(this.reduced?1:.7).setVisible(true);
    if(this.reduced){this.time.delayedCall(800,()=>this.comboText.setVisible(false));return;}
    this.tweens.chain({targets:this.comboText,tweens:[{scale:1.08,duration:170,ease:'Back.easeOut'},{scale:1,duration:140},{y:22,alpha:0,duration:420,delay:450}],onComplete:()=>this.comboText.setVisible(false)});
  }
  private landBall(ball:Phaser.GameObjects.Container,target:Color,color:Color,correct:boolean){
    const index=this.level.cups.findIndex(cup=>cup.color===target),cup=this.level.cups[index],view=this.cups[index];
    const count=correct&&this.world?bucketDelivered(this.world,target):0,full=correct&&count>=bucketTarget(this.level,target);
    if(correct)this.fillCup(index,count);if(full)(view.getByName('cup-symbol') as Phaser.GameObjects.Text).setVisible(false);
    if(!correct)this.callbacks.effect?.('wrong');
    if(this.reduced){ball.setPosition(cup.x,cup.y+25).setAlpha(0);if(full)this.cupChecks[index].setVisible(true).setScale(1);return;}
    this.tweens.chain({targets:ball,tweens:[{x:cup.x,y:cup.y-10,scale:1,duration:125,ease:'Cubic.easeOut'},{y:cup.y-30,scale:1.08,duration:95,ease:'Quad.easeOut'},{y:cup.y+28,scale:.45,alpha:0,duration:230,ease:'Quad.easeIn'}]});
    if(!this.reduced)this.tweens.chain({targets:view,tweens:[{scaleX:1.07,scaleY:.89,angle:correct?-3:3,duration:120},{scaleX:1,scaleY:1,angle:0,duration:320,ease:'Back.easeOut'}]});
    if(full){this.cupChecks[index].setVisible(true).setScale(0);this.tweens.add({targets:this.cupChecks[index],scale:1,duration:300,ease:'Back.easeOut',delay:200});this.burst(cup.x,cup.y-15,0xffdb86,12);}
    if(!correct){this.tweens.add({targets:view,x:cup.x+5,duration:60,yoyo:true,repeat:2});}
    if(correct){const ripple=this.cupRipples[index];this.tweens.killTweensOf(ripple);ripple.setAlpha(.85).setScale(.65);this.tweens.add({targets:ripple,scaleX:1.35,scaleY:1.8,alpha:0,duration:450,delay:130,ease:'Quad.easeOut'});}
    this.time.delayedCall(125,()=>this.burst(cup.x,cup.y-8,this.colors[color].hex,correct?22:7));
  }
  private burst(x:number,y:number,color:number,count:number){
    if(this.reduced)return;count=Math.min(count,effectBudget(this.quality,false).particles);
    for(let i=0;i<count;i++){const particle=this.particles[this.particleHead++%Math.max(1,effectBudget(this.quality,this.reduced).particles)];this.tweens.killTweensOf(particle);
      const a=i*Math.PI*2/count,d=Phaser.Math.Between(30,85);particle.setPosition(x,y).setRadius(Phaser.Math.Between(2,4)).setFillStyle(color).setScale(1).setAlpha(1).setVisible(true);
      this.tweens.add({targets:particle,x:x+Math.cos(a)*d,y:y+Math.sin(a)*d-15,alpha:0,scale:.2,duration:Phaser.Math.Between(450,700),ease:'Cubic.easeOut',onComplete:()=>particle.setVisible(false)});
    }
  }
  private celebrate(){
    if(this.reduced)return;const colors=[0xf15db3,0x42b6f5,0xffcf70,0xa483df];
    for(let i=0;i<Math.min(36,effectBudget(this.quality,false).particles);i++){const particle=this.particles[this.particleHead++%Math.max(1,effectBudget(this.quality,this.reduced).particles)];this.tweens.killTweensOf(particle);
      particle.setPosition(Phaser.Math.Between(80,460),Phaser.Math.Between(110,200)).setRadius(Phaser.Math.Between(2,4)).setFillStyle(colors[i%4]).setScale(1).setAlpha(1).setVisible(true);
      this.tweens.add({targets:particle,y:particle.y+Phaser.Math.Between(200,400),x:particle.x+Phaser.Math.Between(-75,75),alpha:0,scale:.3,duration:Phaser.Math.Between(800,1300),ease:'Quad.easeIn',onComplete:()=>particle.setVisible(false)});
    }
  }
}
