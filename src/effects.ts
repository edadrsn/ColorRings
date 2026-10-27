export type EffectQuality='low'|'medium'|'high';
export const validQuality=(v:unknown):v is EffectQuality=>v==='low'||v==='medium'||v==='high';
export function effectBudget(quality:EffectQuality,reduced:boolean){return reduced?{particles:0,trail:0,interval:Infinity}:quality==='low'?{particles:12,trail:2,interval:75}:quality==='medium'?{particles:32,trail:5,interval:45}:{particles:56,trail:8,interval:32};}
