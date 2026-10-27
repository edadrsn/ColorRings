import type {Level} from './levels.ts';
import {AUTHORED_LAYOUTS} from './authored-layouts.ts';
export function applyUniqueLayouts(levels:Level[]){
  const env=(globalThis as typeof globalThis&{process?:{env?:Record<string,string|undefined>}}).process?.env;
  if(env?.COLOR_RINGS_AUTHORING==='1')return;
  for(let i=0;i<levels.length;i++){const source=levels[i],patch=AUTHORED_LAYOUTS[source.id];if(!patch)continue;levels[i]={...source,rings:source.rings.map((ring,j)=>({...ring,gaps:patch.rings[j].gaps.map(g=>({...g})),baffles:patch.rings[j].baffles?.map(b=>({...b}))})),dividers:patch.dividers?.map(w=>({a:{...w.a},b:{...w.b},radius:w.radius}))??source.dividers,rules:source.keys?.length?{...source.rules,requiredKeys:source.keys.map(k=>k.id)}:source.rules};}
}
