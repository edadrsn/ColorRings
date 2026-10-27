import {PhysicsWorld,type BallState,type Outcome} from './physics.ts';
import type {Level,Color} from './levels.ts';
import {interpolateRotation} from './presentation.ts';
type RecordedFrame={clock:number;time:number;angles:number[];states:BallState[];runs:{color:Color;outcome:Outcome;cup:Color|null;contacts:number}[];collected:string[];unlocked:string[];deliveryOrder:Color[];finished:boolean;success:boolean;violation:string|null};
/** Record the actual fixed-step trajectory, including live drags, splits and Undo. */
export class SolutionRecording {
  readonly level:Level;
  readonly frames:RecordedFrame[]=[];
  compressed=false;
  private clock=0;
  private stride=1;
  constructor(level:Level,planning:{from:number[];to:number[]}[]=[]){this.level=level;for(const gesture of planning){const pose=new PhysicsWorld(gesture.from,level);for(let i=0;i<18;i++){pose.angles=gesture.from.map((from,index)=>interpolateRotation(from,gesture.to[index],i/17));this.capture(pose);}}}
  capture(world:PhysicsWorld){
    this.clock++;
    if(this.frames.length>=36000){const keep=this.frames.filter((_,i)=>i%2===0);this.frames.splice(0,this.frames.length,...keep);this.stride*=2;this.compressed=true;}
    if(this.clock%this.stride!==0&&!world.finished)return;
    this.frames.push({clock:this.clock,time:world.time,angles:[...world.angles],states:world.states.map(state=>({...state})),runs:world.runs.map(run=>({color:run.color,outcome:run.outcome,cup:run.cup,contacts:run.contacts})),collected:[...world.collected],unlocked:[...world.unlocked],deliveryOrder:[...world.deliveryOrder],finished:world.finished,success:world.result().success,violation:world.violation});
  }
  attach(world:PhysicsWorld){world.onStep=current=>this.capture(current);this.capture(world);}
  get playable(){return !!this.frames.at(-1)?.finished&&this.frames.at(-1)!.success;}
}
/** Read-only playback: no solver, session mutation, progress writes or reward callbacks. */
export class SolutionPlayback {
  readonly world:PhysicsWorld;
  private index=0;
  private accumulator=0;
  private clock=0;
  private frames:RecordedFrame[];
  constructor(recording:SolutionRecording){this.frames=recording.frames;this.clock=this.frames[0].clock;this.world=new PhysicsWorld(this.frames[0].angles,recording.level);this.apply();}
  get finished(){return this.index>=this.frames.length-1;}
  advance(seconds:number){this.accumulator+=Math.max(0,Math.min(.2,seconds));while(this.accumulator+1e-10>=1/120&&!this.finished){this.clock++;this.accumulator-=1/120;let changed=false;while(this.index+1<this.frames.length&&this.frames[this.index+1].clock<=this.clock){this.index++;changed=true;}if(changed)this.apply();}}
  private apply(){
    const frame=this.frames[this.index],previous=this.frames[Math.max(0,this.index-1)],world=this.world;
    world.angles=[...frame.angles];world.previousAngles=[...previous.angles];world.targets=[...frame.angles];world.time=frame.time;
    world.states.splice(0,world.states.length,...frame.states.map(state=>({...state})));
    world.previous.splice(0,world.previous.length,...frame.states.map((state,i)=>{const last=previous.states[i];return last&&frame.time>=previous.time?{x:last.x,y:last.y,spin:last.spin}:{x:state.x,y:state.y,spin:state.spin};}));
    world.runs.splice(0,world.runs.length,...frame.runs.map(run=>({...run,frames:[],crossedRings:[]})));
    world.collected=new Set(frame.collected);world.unlocked=new Set(frame.unlocked);world.deliveryOrder=[...frame.deliveryOrder];world.violation=frame.violation;world.finished=this.finished;
  }
}
