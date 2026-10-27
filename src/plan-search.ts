import type {Level} from './levels.ts';
import type {PlanAction} from './advanced-types.ts';
import {validateSolution} from './solutions.ts';
/** Bounded deletion search, not a global minimum over all continuous drags/timings.
 * Each accepted route is replayed through RingSession (links/budgets/locks) and physics.
 * Never runs in the render loop. The original level and plan are never mutated. */
export function refineVerifiedPlan(level:Level,maxTrials=24){
 let plan:PlanAction[]=level.plan?.map(action=>({...action}))??[],check=validateSolution(level),trials=0,removed=0;
 if(!check.success||!level.plan)return {check,plan,trials,removed,globalMinimum:false as const};
 for(let i=0;i<plan.length&&trials<Math.max(0,maxTrials);){
  if(plan[i].ring===undefined){i++;continue;}
  const candidate:PlanAction[]=plan.filter((_,j)=>j!==i);trials++;
  const tested=validateSolution({...level,plan:candidate});
  if(tested.success&&tested.moves<=check.moves){plan=candidate;check=tested;removed++;i=0;}else i++;
 }
 return {check,plan,trials,removed,globalMinimum:false as const};
}
