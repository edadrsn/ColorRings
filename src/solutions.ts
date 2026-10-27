import {PhysicsWorld,type Simulation} from './physics.ts';
import type {Level} from './levels.ts';
import {RingSession} from './engine.ts';
export type SolutionCheck={success:boolean;steps:{angles:number[];waitFor:string;seconds:number}[];result:Simulation;world:PhysicsWorld;moves:number};
export type PlanDirective={action:'align'|'wait'|'play';angles:number[];ring?:number};
export function reachedCondition(world:PhysicsWorld,condition:string):boolean{
  if(world.violation)return false;
  if(condition.startsWith('key:'))return world.collected.has(condition.slice(4));
  if(condition==='all')return world.result().success;
  return world.states.every((state,i)=>world.level.balls[state.origin].color!==condition||state.done&&world.runs[i].outcome==='correct');
}
/** A certificate is earned by replaying the authored plan through real physics. */
export function validateSolution(level:Level,start?:PhysicsWorld):SolutionCheck{
  if(level.plan&&!start){
    const session=new RingSession();session.selectCustom(level);return validatePlanFromSession(session).check;
  }
  const steps=level.sequence??[{angles:level.solution,waitFor:'all' as const}];
  const world=start??new PhysicsWorld(steps[0].angles,level);
  const checked:SolutionCheck['steps']=[];
  for(const step of steps){
    const reached=()=>reachedCondition(world,step.waitFor);
    if(reached())continue;
    world.setAngles(step.angles);const begin=world.time;
    for(let tick=0;tick<120*16&&!world.finished&&!reached();tick++)world.step();
    checked.push({angles:[...step.angles],waitFor:step.waitFor,seconds:world.time-begin});
    if(!reached())return {success:false,steps:checked,result:world.result(),world,moves:0};
  }
  return {success:world.result().success,steps:checked,result:world.result(),world,moves:0};
}
/** Replays actual gestures with links, remaining budgets and the live key/split state. */
export function validatePlanFromSession(source:RingSession):{check:SolutionCheck;directive:PlanDirective|null}{
  const level=source.level,session=new RingSession();session.selectCustom(level);session.angles=[...source.angles];session.phase=source.phase;session.world=source.world?.clone()??null;session.moves=source.moves;session.ringMoves=[...source.ringMoves];session.hintsUsed=source.hintsUsed;
  const plan=level.plan??[],checked:SolutionCheck['steps']=[];let allowed=true,directive:PlanDirective|null=null,start=0;
  if(session.world)plan.forEach((action,i)=>{if(action.waitFor&&reachedCondition(session.world!,action.waitFor))start=i+1;});
  for(const action of plan.slice(start)){
    if(action.ring!==undefined&&action.to!==undefined&&Math.abs(((session.angles[action.ring]-action.to+540)%360)-180)>.01){
      allowed=session.begin(action.ring)&&session.preview(action.ring,action.to);session.commit();if(!allowed)break;
      directive??={action:'align',ring:action.ring,angles:[...session.angles]};
    }
    if(action.play&&!session.world){directive??={action:'play',angles:[...session.angles]};session.play();}
    if(action.waitFor){const world=session.world;if(!world){allowed=false;break;}const begin=world.time;
      if(!reachedCondition(world,action.waitFor))directive??={action:'wait',angles:[...source.angles]};
      for(let tick=0;tick<120*16&&!world.finished&&!reachedCondition(world,action.waitFor);tick++)world.step();
      checked.push({angles:[...session.angles],waitFor:action.waitFor,seconds:world.time-begin});if(!reachedCondition(world,action.waitFor)){allowed=false;break;}
    }
  }
  const world=session.world??new PhysicsWorld(session.angles,level);session.finish();return {check:{success:allowed&&session.phase==='success',steps:checked,result:world.result(),world,moves:session.moves},directive};
}

/** A failed immediate continuation does not prove the player must restart.
 * A resting pocket can need a few physical ticks before its next safe rotation.
 * Probe actual future worlds without changing the live world or charging a move. */
export function verifiedSettlingWait(source:RingSession){
  if(source.phase!=='running'||!source.world||source.world.finished||!source.level.plan)return null;
  for(const ticks of [1,6,18,36,60,120]){
    const probe=new RingSession();probe.selectCustom(source.level);probe.angles=[...source.angles];probe.moves=source.moves;probe.ringMoves=[...source.ringMoves];probe.hintsUsed=source.hintsUsed;probe.phase=source.phase;probe.world=source.world.clone();
    for(let i=0;i<ticks&&!probe.world.finished;i++)probe.world.step();
    const tested=validatePlanFromSession(probe);
    if(tested.check.success)return {ticks,check:tested.check};
  }
  return null;
}
