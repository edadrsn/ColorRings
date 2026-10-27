import type {Level} from './levels.ts';
import {validateSolution} from './solutions.ts';
import {certifyPlan} from './campaign-variety.ts';
/** Measurements of tested plans, never a claim about all continuous angles/timings. */
export function analyzePuzzle(source:Level,probeDependencies=false){
 const level=JSON.parse(JSON.stringify(source)) as Level;
 if(!level.plan)certifyPlan(level,level.sequence??[{angles:level.solution,waitFor:'all'}]);
 const check=validateSolution(level),gestures=level.plan!.flatMap((action,index)=>action.ring===undefined?[]:[index]);
 let essential=0,orderSensitive=0,alternatives=0;
 if(probeDependencies&&check.success){
  for(const index of gestures)if(!validateSolution({...level,plan:level.plan!.filter((_,i)=>i!==index)}).success)essential++;
  for(let i=1;i<gestures.length;i++){const a=gestures[i-1],b=gestures[i],plan=level.plan!.map(step=>({...step}));[plan[a],plan[b]]=[plan[b],plan[a]];if(validateSolution({...level,plan}).success)alternatives++;else orderSensitive++;}
 }
 const mechanics=[['key',level.keys?.length],['linked',level.links?.length],['one-way',level.oneWays?.length],['color',level.colorGates?.length],['limited',level.rules?.maxMoves||level.ringLimits?.length],['split',level.splitters?.length]].filter(([,count])=>!!count).map(([name])=>String(name));
 return {id:level.id,solved:check.success,moves:check.moves,phases:check.steps.length,rings:level.rings.length,balls:level.balls.length,colors:new Set(level.balls.map(b=>b.color)).size,mechanics,essentialActionsInPlan:probeDependencies?essential:null,orderSensitivePairs:probeDependencies?orderSensitive:null,sampledReorderAlternatives:probeDependencies?alternatives:null,dependenciesProbed:probeDependencies,globalMinimumProven:false,goals:level.goals??null,rules:level.rules??null,validPlan:level.plan};
}
