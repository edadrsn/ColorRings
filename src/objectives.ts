import {COLORS,type Level,type Color} from './levels.ts';
import type {PhysicsWorld} from './physics.ts';
export function objectiveText(level:Level):string{
  const parts:string[]=[];const first=level.rules?.deliveryOrder?.[0];
  if(first){const groups:Color[]=[];for(const color of level.rules!.deliveryOrder!)if(groups.at(-1)!==color)groups.push(color);parts.push(`Sıra: ${groups.map(color=>COLORS[color].name.toLowerCase()).join(' → ')}`);}
  const balls=level.goals?Object.values(level.goals).reduce((n,value)=>n+(value??0),0):level.balls.length;
  parts.push(`${balls} topu doğru kovaya ulaştır`);
  if(level.rules?.requiredKeys?.length)parts.push(`${level.rules.requiredKeys.length} anahtarı topla`);
  const max=level.rules?.maxMoves??level.challenge?.maxMoves;if(max)parts.push(`en fazla ${max} hamle`);
  return parts.join(' · ')+'.';
}
export function stageProgress(level:Level,world:PhysicsWorld|null):string{
  if(!level.mastery)return '';
  const order=level.rules?.deliveryOrder??[];return order.length?`${world?.deliveryOrder.length??0}/${order.length} teslim`:`Hedef ${level.targetMoves} hamle`;
}
