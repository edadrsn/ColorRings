import {LEVELS,normalize,angularDistance,type Level} from './levels.ts';
import {PhysicsWorld,type Simulation} from './physics.ts';
import {hasTimeTravelMechanics} from './mechanics.ts';
import {linkedAngles} from './links.ts';
export type Phase='planning'|'running'|'success'|'failure';
export class RingSession {
  levelIndex=0;
  private custom:Level|null=null;
  get level(){return this.custom??LEVELS[this.levelIndex];}
  angles=this.level.rings.map(r=>normalize(r.initial));
  history:number[][]=[];
  moves=0;
  phase:Phase='planning';
  result:Simulation|null=null;
  world:PhysicsWorld|null=null;
  hintsUsed=0;
  ringMoves:number[]=[];
  private snapshots:(PhysicsWorld|null)[]=[];
  private gestureWorld:PhysicsWorld|null=null;
  private gesture:number[]|null=null;
  private gestureDriver:number|undefined;
  get canEdit(){return this.phase==='planning'||(this.phase==='running'&&!this.world?.finished);}
  canRotate(index:number):boolean {
    if(!this.canEdit||!this.level.rings[index])return false;
    if(this.world?this.world.isRingLocked(index):this.level.locks?.some(lock=>lock.kind==='ring'&&lock.ring===index))return false;
    const visited=new Set<number>([index]),pending=[index];
    while(pending.length){const driver=pending.pop()!;for(const link of this.level.links??[])if(link.driver===driver&&link.ratio!==0&&!visited.has(link.follower)){
      if(this.world?this.world.isRingLocked(link.follower):this.level.locks?.some(lock=>lock.kind==='ring'&&lock.ring===link.follower))return false;
      visited.add(link.follower);pending.push(link.follower);
    }}
    if(this.level.rules?.maxMoves!==undefined&&this.moves>=this.level.rules.maxMoves)return false;
    if(this.level.ringLimits?.[index]!==undefined&&(this.ringMoves[index]??0)>=this.level.ringLimits[index])return false;
    const rule=this.level.challenge;return !rule||(this.moves<rule.maxMoves&&(!rule.ringLimit||(this.ringMoves[index]??0)<rule.ringLimit));
  }
  begin(index?:number):boolean {if(!this.canEdit||(index!==undefined&&!this.canRotate(index)))return false;this.gestureDriver=index;this.gesture=[...this.angles];this.gestureWorld=this.world&&hasTimeTravelMechanics(this.level)?this.world.clone():null;return true;}
  preview(index:number,angle:number):boolean {
    if(!this.canRotate(index)||!Number.isFinite(angle))return false;
    const next=linkedAngles(this.level,this.gesture??this.angles,index,angle,this.angles);
    if(next.some((value,i)=>i!==index&&angularDistance(value,this.angles[i])>.01&&(this.world?this.world.isRingLocked(i):this.level.locks?.some(lock=>lock.ring===i&&lock.kind==='ring'))))return false;
    this.angles=next;this.world?.setAngles(this.angles);return true;
  }
  commit():void {
    if(this.gesture&&this.angles.some((a,i)=>angularDistance(a,this.gesture![i])>.01)){
      this.history.push(this.gesture);if(this.history.length>60)this.history.shift();
      this.snapshots.push(this.gestureWorld);if(this.snapshots.length>60)this.snapshots.shift();
      this.angles.forEach((angle,i)=>{if((this.gestureDriver===undefined||i===this.gestureDriver)&&angularDistance(angle,this.gesture![i])>.01)this.ringMoves[i]=(this.ringMoves[i]??0)+1;});
      this.moves++;
    }this.gesture=null;this.gestureWorld=null;this.gestureDriver=undefined;
  }
  rotate(index:number,delta=30):boolean {
    if(!this.level.rings[index]||!Number.isFinite(delta)||!this.begin(index))return false;
    const changed=this.preview(index,this.angles[index]+delta);this.commit();return changed;
  }
  undo():boolean {if(!this.canEdit||!this.history.length)return false;this.angles=this.history.pop()!;this.gesture=null;const snapshot=this.snapshots.pop();if(snapshot)this.world=snapshot.clone();this.world?.setAngles(this.angles);return true;}
  play():PhysicsWorld|null {
    if(this.phase!=='planning')return null;
    this.commit();this.phase='running';this.world=new PhysicsWorld(this.angles,this.level);return this.world;
  }
  finish():void {
    if(this.phase==='running'&&this.world?.finished){this.result=this.world.result();const rule=this.level.challenge;const allowed=(!rule||(this.moves<=rule.maxMoves&&(!rule.noHints||!this.hintsUsed)&&(!rule.ringLimit||this.ringMoves.every(moves=>moves<=rule.ringLimit!))))&&(this.level.rules?.maxMoves===undefined||this.moves<=this.level.rules.maxMoves)&&this.ringMoves.every((moves,i)=>this.level.ringLimits?.[i]===undefined||moves<=this.level.ringLimits[i]);this.phase=this.result.success&&allowed?'success':'failure';}
  }
  retry():void {this.phase='planning';this.result=null;this.gesture=null;this.world=null;}
  restart():void {this.angles=this.level.rings.map(r=>normalize(r.initial));this.history=[];this.snapshots=[];this.gestureWorld=null;this.ringMoves=[];this.hintsUsed=0;this.moves=0;this.phase='planning';this.result=null;this.gesture=null;this.world=null;}
  selectLevel(index:number):boolean {if(!Number.isInteger(index)||!LEVELS[index])return false;this.custom=null;this.levelIndex=index;this.restart();return true;}
  selectCustom(level:Level):void {this.custom=level;this.restart();}
}
