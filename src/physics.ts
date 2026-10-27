import {BOARD,LEVEL,normalize,angularDistance,radians,type Level,type Color,type Vec} from './levels.ts';
import {passageSegments,movingSegments,mechanicPoint} from './mechanics.ts';
export const DT=1/120,BALL_RADIUS=14;
export type Segment={a:Vec;b:Vec;radius:number;ring:number;kind?:'arc'|'baffle';oneWay?:'outward'|'inward';velocity?:Vec};
export type Frame=Vec&{spin:number};
export type Outcome='correct'|'wrong-cup'|'missed'|'stuck';
export type Run={color:Color;frames:Frame[];outcome:Outcome;cup:Color|null;contacts:number;crossedRings:number[]};
export type Simulation={balls:Run[];success:boolean;duration:number};
export type BallState=Frame&{color:Color;vx:number;vy:number;done:boolean;origin:number};
export function ringSegments(index:number,angle:number,level:Level=LEVEL):Segment[]{
  const ring=level.rings[index],segments:Segment[]=[],count=180;
  const point=(degrees:number)=>({x:BOARD.center.x+Math.cos(radians(degrees))*ring.radius,y:BOARD.center.y+Math.sin(radians(degrees))*ring.radius});
  for(let i=0;i<count;i++){
    const local=i*360/count,middle=local+180/count;
    if(ring.gaps.some(g=>angularDistance(middle,g.angle)<g.size/2))continue;
    segments.push({a:point(local+angle),b:point(local+360/count+angle),radius:ring.width/2,ring:index,kind:'arc'});
  }
  // Radial pocket walls belong to the ring: drawing, collisions and wall velocity
  // all use this same rotated segment, including during a live drag.
  for(const baffle of ring.baffles??[]){
    if(ring.gaps.some(g=>angularDistance(baffle.angle,g.angle)<g.size/2))continue;
    const theta=radians(baffle.angle+angle),endRadius=ring.radius+(baffle.side==='inward'?-1:1)*baffle.length;
    segments.push({a:point(baffle.angle+angle),b:{x:BOARD.center.x+Math.cos(theta)*endRadius,y:BOARD.center.y+Math.sin(theta)*endRadius},radius:(baffle.width??ring.width)/2,ring:index,kind:'baffle'});
  }
  return segments;
}
export function geometry(angles:number[],level:Level=LEVEL):Segment[]{return [...level.rings.flatMap((_,i)=>ringSegments(i,angles[i],level)),...(level.dividers?.map(s=>({...s,ring:-1}))??[
  {a:{x:270,y:290},b:{x:270,y:517},radius:4,ring:-1},
  {a:{x:270,y:517},b:{x:242,y:652},radius:4,ring:-1},{a:{x:270,y:517},b:{x:298,y:652},radius:4,ring:-1}])];}
export function classifyCup(x:number,color:Color,level:Level=LEVEL):{outcome:Outcome;cup:Color|null}{
  const cup=level.cups.find(c=>Math.abs(x-c.x)<c.width/2-BALL_RADIUS);
  return {outcome:cup?(cup.color===color?'correct':'wrong-cup'):'missed',cup:cup?.color??null};
}
/** Live 120 Hz world. Ring targets can change at any time; resting balls stay available. */
export class PhysicsWorld {
  readonly level:Level;
  readonly states:BallState[];
  readonly previous:Frame[];
  readonly runs:Run[];
  angles:number[];
  previousAngles:number[];
  targets:number[];
  time=0;
  finished=false;
  collected=new Set<string>();
  unlocked=new Set<string>();
  transformed=new Set<string>();
  split=new Set<string>();
  deliveryOrder:Color[]=[];
  violation:string|null=null;
  onStep:((world:PhysicsWorld)=>void)|null=null;
  events:{type:'passage'|'key'|'unlock'|'color'|'collision'|'split';id?:string;ball?:number;color?:Color;strength?:number;nx?:number;ny?:number;x?:number;y?:number}[]=[];
  private accumulator=0;
  private segments:Segment[];
  private angularVelocity:number[];
  private readonly record:boolean;
  constructor(angles:number[],level:Level=LEVEL,record=false){
    this.level=level;this.record=record;this.angles=angles.map(normalize);this.targets=[...this.angles];
    this.previousAngles=[...this.angles];
    this.angularVelocity=angles.map(()=>0);this.segments=this.makeGeometry();
    this.states=level.balls.map((ball,origin)=>({...ball,vx:0,vy:0,spin:0,done:false,origin}));
    this.previous=level.balls.map(ball=>({x:ball.x,y:ball.y,spin:0}));
    this.runs=level.balls.map(ball=>({color:ball.color,frames:[],outcome:'stuck',cup:null,contacts:0,crossedRings:[]}));
  }
  isRingLocked(index:number):boolean{return (this.level.locks??[]).some(lock=>lock.kind==='ring'&&lock.ring===index&&!this.unlocked.has(lock.id));}
  private makeGeometry(){return [...geometry(this.angles,this.level),...passageSegments(this.level,this.angles,this.unlocked)];}
  setAngles(angles:number[]):void {if(!this.finished&&angles.length===this.angles.length&&angles.every(Number.isFinite))this.targets=angles.map((angle,i)=>this.isRingLocked(i)?this.angles[i]:normalize(angle));}
  get renderAlpha():number {return Math.max(0,Math.min(1,this.accumulator/DT));}
  clone():PhysicsWorld {
    const copy=new PhysicsWorld(this.angles,this.level);
    copy.targets=[...this.targets];copy.time=this.time;copy.accumulator=this.accumulator;copy.finished=this.finished;
    copy.previousAngles=[...this.previousAngles];
    copy.collected=new Set(this.collected);copy.unlocked=new Set(this.unlocked);copy.transformed=new Set(this.transformed);copy.events=this.events.map(event=>({...event}));copy.segments=copy.makeGeometry();
    copy.split=new Set(this.split);copy.deliveryOrder=[...this.deliveryOrder];copy.violation=this.violation;
    copy.states.splice(0,copy.states.length,...this.states.map(state=>({...state})));
    copy.previous.splice(0,copy.previous.length,...this.previous.map(frame=>({...frame})));
    copy.runs.splice(0,copy.runs.length,...this.runs.map(run=>({...run,frames:run.frames.map(frame=>({...frame})),crossedRings:[...run.crossedRings]})));
    return copy;
  }
  advance(seconds:number):void {
    if(this.finished||!Number.isFinite(seconds)||seconds<=0)return;
    this.accumulator+=Math.min(seconds,.1);
    while(this.accumulator+1e-10>=DT&&!this.finished){this.step();this.accumulator-=DT;}
  }
  step():void {
    if(this.finished)return;
    this.previousAngles=[...this.angles];
    let changed=false;
    this.angles=this.angles.map((angle,i)=>{
      const difference=this.isRingLocked(i)?0:((this.targets[i]-angle+540)%360)-180;
      // At most 2 degrees per step keeps swept walls below the marble diameter.
      const delta=Math.max(-2,Math.min(2,difference));this.angularVelocity[i]=radians(delta)/DT;
      if(Math.abs(delta)>.00001)changed=true;return normalize(angle+delta);
    });
    if(changed)this.segments=this.makeGeometry();
    this.time+=DT;
    const collisionSegments=this.level.obstacles?.length?[...this.segments,...movingSegments(this.level,this.time)]:this.segments;
    for(let index=0;index<this.states.length;index++){
      const ball=this.states[index],run=this.runs[index];if(ball.done)continue;
      for(const splitter of this.level.splitters??[]){
        const token=`${splitter.id}:${index}`;
        if(ball.color!==splitter.color||this.split.has(token)||this.states.length>=24||Math.hypot(ball.x-splitter.x,ball.y-splitter.y)>BALL_RADIUS+splitter.radius)continue;
        this.split.add(token);const childIndex=this.states.length;
        const first=splitter.outlets[0],second=splitter.outlets[1];
        ball.x=splitter.x+first.x;ball.y=splitter.y+first.y;ball.vx=-3;ball.vy=Math.max(60,ball.vy*.5);
        const child={...ball,x:splitter.x+second.x,y:splitter.y+second.y,vx:3};this.states.push(child);this.previous.push({x:child.x,y:child.y,spin:child.spin});
        this.runs.push({color:child.color,frames:[],outcome:'stuck',cup:null,contacts:0,crossedRings:[...run.crossedRings]});this.split.add(`${splitter.id}:${childIndex}`);this.events.push({type:'split',id:splitter.id,ball:index});
      }
      this.previous[index].x=ball.x;this.previous[index].y=ball.y;this.previous[index].spin=ball.spin;
      ball.vy+=650*DT;ball.vx*=.9992;ball.x+=ball.vx*DT;ball.y+=ball.vy*DT;
      for(let pass=0;pass<3;pass++)for(const segment of collisionSegments){
        if(segment.oneWay){const radial=(ball.vx*(ball.x-270)+ball.vy*(ball.y-280));if(segment.oneWay==='outward'?radial>=0:radial<=0)continue;}
        const reach=BALL_RADIUS+segment.radius;
        if(ball.x<Math.min(segment.a.x,segment.b.x)-reach||ball.x>Math.max(segment.a.x,segment.b.x)+reach||ball.y<Math.min(segment.a.y,segment.b.y)-reach||ball.y>Math.max(segment.a.y,segment.b.y)+reach)continue;
        const dx=segment.b.x-segment.a.x,dy=segment.b.y-segment.a.y;
        const square=dx*dx+dy*dy,t=square?Math.max(0,Math.min(1,((ball.x-segment.a.x)*dx+(ball.y-segment.a.y)*dy)/square)):0;
        const px=segment.a.x+t*dx,py=segment.a.y+t*dy,ox=ball.x-px,oy=ball.y-py,d=Math.hypot(ox,oy);
        if(d>=reach)continue;
        const nx=d>.00001?ox/d:0,ny=d>.00001?oy/d:-1;
        ball.x=px+nx*(reach+.015);ball.y=py+ny*(reach+.015);
        const omega=segment.ring>=0?this.angularVelocity[segment.ring]:0;
        let wx=segment.velocity?.x??-omega*(py-280),wy=segment.velocity?.y??omega*(px-270);
        const wallSpeed=Math.hypot(wx,wy);if(wallSpeed>180){wx*=180/wallSpeed;wy*=180/wallSpeed;}
        const speed=(ball.vx-wx)*nx+(ball.vy-wy)*ny;
        if(speed<0){ball.vx-=1.12*speed*nx;ball.vy-=1.12*speed*ny;if(speed < -30){run.contacts++;if(run.contacts%4===1&&this.events.length<24)this.events.push({type:'collision',ball:index,strength:-speed,nx,ny,x:px,y:py});}}
      }
      if(ball.x<BALL_RADIUS+12){ball.x=BALL_RADIUS+12;ball.vx=Math.abs(ball.vx)*.2;}
      if(ball.x>BOARD.width-BALL_RADIUS-12){ball.x=BOARD.width-BALL_RADIUS-12;ball.vx=-Math.abs(ball.vx)*.2;}
      if(ball.y<BALL_RADIUS+8){ball.y=BALL_RADIUS+8;ball.vy=Math.abs(ball.vy)*.2;}
    }
    for(let i=0;i<this.states.length;i++)for(let j=i+1;j<this.states.length;j++){
      const a=this.states[i],b=this.states[j];if(a.done||b.done)continue;
      const dx=b.x-a.x,dy=b.y-a.y,d=Math.hypot(dx,dy);
      if(d<BALL_RADIUS*2&&d>.0001){const nx=dx/d,ny=dy/d,push=(BALL_RADIUS*2-d)/2+.001;
        a.x-=nx*push;a.y-=ny*push;b.x+=nx*push;b.y+=ny*push;
        const relative=(b.vx-a.vx)*nx+(b.vy-a.vy)*ny;
        if(relative<0){const impulse=-relative*.55;a.vx-=nx*impulse;a.vy-=ny*impulse;b.vx+=nx*impulse;b.vy+=ny*impulse;}
      }
    }
    for(let index=0;index<this.states.length;index++){
      const ball=this.states[index],run=this.runs[index];if(ball.done)continue;
      for(const key of this.level.keys??[]){
        const point=mechanicPoint(key,key.ring,this.angles);
        if(!this.collected.has(key.id)&&Math.hypot(ball.x-point.x,ball.y-point.y)<BALL_RADIUS+8){
          this.collected.add(key.id);this.unlocked.add(key.lock);this.events.push({type:'key',id:key.id,ball:index},{type:'unlock',id:key.lock});this.segments=this.makeGeometry();
        }
      }
      for(const gate of this.level.colorGates??[]){
        const token=`${gate.id}:${index}`,before=Math.hypot(this.previous[index].x-270,this.previous[index].y-280),after=Math.hypot(ball.x-270,ball.y-280),radius=this.level.rings[gate.ring].radius;
        if(!this.transformed.has(token)&&ball.color===gate.from&&before<=radius&&after>radius&&angularDistance(Math.atan2(ball.y-280,ball.x-270)*180/Math.PI,gate.angle+this.angles[gate.ring])<=gate.size/2){ball.color=gate.to;run.color=gate.to;this.transformed.add(token);this.events.push({type:'color',id:gate.id,ball:index,color:gate.to});}
      }
      ball.spin+=ball.vx*DT/BALL_RADIUS;
      const frame={x:ball.x,y:ball.y,spin:ball.spin};if(this.record)run.frames.push(frame);else run.frames[0]=frame;
      const distance=Math.hypot(ball.x-BOARD.center.x,ball.y-BOARD.center.y);
      this.level.rings.forEach((ring,i)=>{const edge=ring.radius+ring.width/2+BALL_RADIUS;if(distance>edge&&!run.crossedRings.includes(i)){run.crossedRings.push(i);if(Math.hypot(this.previous[index].x-270,this.previous[index].y-280)<=edge)this.events.push({type:'passage',ball:index,id:String(i)});}});
      if(ball.y>=this.level.cups[0].y-BALL_RADIUS){const result=classifyCup(ball.x,ball.color,this.level);run.outcome=result.outcome;run.cup=result.cup;ball.done=true;if(result.outcome==='correct'){const required=this.level.rules?.deliveryOrder?.[this.deliveryOrder.length];if(required&&required!==ball.color)this.violation='Teslim sırası değişti.';this.deliveryOrder.push(ball.color);}}
    }
    this.finished=!!this.violation||this.states.every(s=>s.done)||this.runs.some(r=>r.outcome==='wrong-cup'||r.outcome==='missed');
    this.onStep?.(this);
  }
  result():Simulation{
    const goals=Object.entries(this.level.goals??{}).every(([color,count])=>this.runs.filter((run,i)=>this.states[i].done&&run.outcome==='correct'&&run.cup===color).length===count);
    const order=this.level.rules?.deliveryOrder;
    return {balls:this.runs,success:!this.violation&&goals&&(!order?.length||this.deliveryOrder.length===order.length)&&this.states.every(s=>s.done)&&this.runs.every(r=>r.outcome==='correct')&&(this.level.rules?.requiredKeys??[]).every(id=>this.collected.has(id)),duration:this.time};
  }
}
/** Offline validation uses the same live solver, with a bounded analysis window. */
export function simulate(angles:number[],level:Level=LEVEL):Simulation {
  const world=new PhysicsWorld(angles,level,true);for(let i=0;i<120*12&&!world.finished;i++)world.step();return world.result();
}
