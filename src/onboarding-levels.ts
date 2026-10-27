import type {Level} from './levels.ts';
import {certifyPlan} from './campaign-variety.ts';
/** Four teaching changes plus calibrated Classic plans. All IDs and maze walls are preserved. */
export function improveOpening(levels:Level[]){
 const first=levels[0];first.rings=first.rings.map((r,i)=>({...r,initial:i===0?first.solution[0]:r.initial}));
 first.stars={three:1,two:3};first.targetMoves=1;first.perfect={...first.perfect!,moves:1};first.lesson='Dış halkayı seç, geçidi hizala ve Play ile bırak.';
 const key=levels[6],p=key.balls[0];key.keys=[{id:'first-key',lock:'first-gate',x:p.x,y:p.y+20}];key.locks=[{id:'first-gate',ring:key.rings.length-1,gap:0,kind:'gate'}];key.rules={...key.rules,requiredKeys:['first-key']};key.lesson='Top anahtarı toplayınca dış geçit açılır.';
 const color=levels[7];color.colorGates=[{id:'first-color',ring:0,angle:90,size:360,from:'pink',to:'yellow'}];
 color.cups=color.cups.map(c=>({...c,color:c.color==='pink'?'yellow':c.color}));color.lesson='Pembe top geçitte sarıya dönüşür; sarı kovaya gider.';
 color.goals={yellow:color.balls.filter(b=>b.color==='pink').length,blue:color.balls.filter(b=>b.color==='blue').length};
 const mini=levels[9];certifyPlan(mini,mini.sequence??[{angles:mini.solution,waitFor:'all'}]);
 const moves=mini.plan!.filter(a=>a.ring!==undefined).length;mini.targetMoves=moves;mini.rules={...mini.rules,maxMoves:moves+1};mini.ringLimits=mini.rings.map((_,i)=>mini.plan!.filter(a=>a.ring===i).length+1);mini.stars={three:moves,two:moves+1};mini.perfect={...mini.perfect!,moves};mini.lesson='Önce mavi dalgayı bırak. Sonra pembe; bir ek hamle payın var.';
 for(const level of levels.slice(0,40)){
  if(!level.plan)certifyPlan(level,level.sequence??[{angles:level.solution,waitFor:'all'}]);
  const target=level.plan!.filter(a=>a.ring!==undefined).length;level.targetMoves=target;
  level.stars={three:target,two:target+Math.max(2,Math.ceil(target/2))};if(level.perfect)level.perfect={...level.perfect,moves:target};
 }
}
