/** Bounded renderer observations, separate from the deterministic simulation clock. */
export class RenderTelemetry{
 private deltas:number[]=[];
 sample(ms:number,active:boolean){if(!active||!Number.isFinite(ms)||ms<=0||ms>250)return;this.deltas.push(ms);if(this.deltas.length>240)this.deltas.shift();}
 snapshot(){if(!this.deltas.length)return {samples:0,fps:null,p95:null};const sorted=[...this.deltas].sort((a,b)=>a-b);return {samples:sorted.length,fps:1000/(this.deltas.reduce((s,v)=>s+v,0)/sorted.length),p95:sorted[Math.max(0,Math.ceil(sorted.length*.95)-1)]};}
}
