process.env.COLOR_RINGS_RELAY_AUTHORING='1';
const {LEVELS}=await import('../src/levels.ts');
const {validateSolution,validatePlanFromSession,reachedCondition}=await import('../src/solutions.ts');
const {RingSession}=await import('../src/engine.ts');
function hasGrace(l){const s=new RingSession();s.selectCustom(l);for(const a of l.plan){if(a.ring!==undefined){if(!s.begin(a.ring)||!s.preview(a.ring,a.to))return false;s.commit();}if(a.play)s.play();if(a.waitFor){for(let t=0;t<1920&&!s.world.finished&&!reachedCondition(s.world,a.waitFor);t++)s.world.step();if(a.waitFor==='key:relay-key')break;}}const snapshot=s.world.clone();for(const delay of [0,6,12,18,24,30,36,42,48,54,60,90,120,180,240]){s.world=snapshot.clone();for(let t=0;t<delay&&!s.world.finished;t++)s.world.step();if(!validatePlanFromSession(s).check.success)return false;}return true;}
import {writeFileSync} from 'node:fs';
const patches=[];
for(const base of LEVELS.filter(l=>l.mastery>=31&&l.plan&&!l.locks?.some(k=>k.kind==='ring'))){
 const outer=base.rings.length-1;
 if(base.links?.some(link=>link.driver===outer||link.follower===outer))continue;
 const playIndex=base.plan.findIndex(a=>a.play),launch=base.plan.slice(0,playIndex).filter(a=>a.ring!==undefined),deferred=launch.filter(a=>a.ring===outer);
 if(!deferred.length)continue;
 let patch=null;
 const twist=base.mastery>=61&&!base.links?.some(link=>link.driver===0||link.follower===0);
 for(const turn of twist?[90,-90,120,-120,150,-150,180,60,-60,45,-45,30,-30]:[0]){
  for(const offset of [22,10,30,0]){
   const l=structuredClone(base),ball=l.balls[0],id='relay-key',lock='relay-ring',target=launch.find(a=>a.ring===0)?.to??base.rings[0].initial;
   const pre=(target+turn+360)%360,a=-pre*Math.PI/180,dx=ball.x-270,dy=ball.y+offset-280;
   const key=twist?{id,lock,x:270+Math.cos(a)*dx-Math.sin(a)*dy,y:280+Math.sin(a)*dx+Math.cos(a)*dy,ring:0}:{id,lock,x:ball.x,y:ball.y+offset};
   if(twist){const delta=((target-pre+540)%360)-180,outerDelta=((deferred[0].to-l.rings[outer].initial+540)%360)-180;l.rings[0].initial=pre;l.links=[...l.links??[],{driver:0,follower:outer,ratio:outerDelta/delta}];}
   l.keys=[...l.keys??[],key];l.locks=[...l.locks??[],{id:lock,ring:outer,kind:'ring'}];l.rules={...l.rules,requiredKeys:[...l.rules?.requiredKeys??[],id]};
   l.plan=[...launch.filter(a=>a.ring!==outer).map(a=>twist&&a.ring===0?{...a,to:pre}:a),{play:true,waitFor:'key:relay-key'},...(twist?[{ring:0,to:target}]:[]),...(twist?[]:deferred),...l.plan.slice(playIndex).map(a=>({...a,play:false}))];
   // Expert relay adds a required recovery gesture. Budgets and stars describe this actual route.
   if(twist){if(l.rules.maxMoves!==undefined)l.rules.maxMoves++;if(l.ringLimits)l.ringLimits[0]++;}
   const c=validateSolution(l);
   if(l.plan[0]?.ring!==undefined&&l.plan[0].to===l.rings[l.plan[0].ring].initial)l.plan.shift();
   const recoveryIndex=l.plan.findIndex(a=>a.waitFor==='key:relay-key')+1; const recoveryNecessary=!twist||!validateSolution({...l,plan:l.plan.filter((_,i)=>i!==recoveryIndex)}).success;
   if(c.success&&recoveryNecessary&&hasGrace(l)){patch={id:l.id,key,lock:l.locks.at(-1),plan:l.plan,moves:c.moves,stages:c.steps.length,twist,ringLimits:l.ringLimits,maxMoves:l.rules.maxMoves,initials:l.rings.map(r=>r.initial),links:l.links};break;}
  }
  if(patch)break;
 }
 if(patch&&(!patch.twist||patch.moves>=4)){if(patch.twist)patch.maxMoves=patch.moves+1;patches.push(patch);}
}
writeFileSync('gameplay-polish/relay-candidates.json',JSON.stringify(patches,null,2));
console.log(patches.map(p=>`U${p.id-40}: ${p.moves} moves, ${p.stages} stages, recovery ${p.twist}`).join('\n'));







