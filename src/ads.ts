import type {Progress} from './progress.ts';
import {credit,ECONOMY} from './economy.ts';
import {removesAds} from './purchases.ts';
export type AdKind='rewarded'|'interstitial';
export type AdState='idle'|'ready'|'load-failed'|'started'|'completed'|'closed';
export type AdReward={kind:'gold'}|{kind:'hint'}|{kind:'daily';date:string};
export type AdTicket={id:string;kind:AdKind;state:AdState};
export interface AdService{readonly environment:'test'|'production';prepare(kind:AdKind,fail?:boolean):AdTicket;start(id:string):boolean;complete(id:string):AdTicket|null;close(id:string):void;verify(id:string):AdTicket|null}
export const AD_POLICY={personalized:false,collectPersonalData:false,childDirected:true,firstNormalCompletions:5,every:5,minSeconds:120} as const;
export class TestAdService implements AdService{
 readonly environment='test' as const;private tickets=new Map<string,AdTicket>();
 prepare(kind:AdKind,fail=false){const t:AdTicket={id:'ad-'+crypto.randomUUID(),kind,state:fail?'load-failed':'ready'};this.tickets.set(t.id,t);return {...t};}
 start(id:string){const t=this.tickets.get(id);if(!t||t.state!=='ready')return false;t.state='started';return true;}
 complete(id:string){const t=this.tickets.get(id);if(!t||t.state!=='started')return null;t.state='completed';return {...t};}
 close(id:string){const t=this.tickets.get(id);if(t&&t.state!=='completed')t.state='closed';}
 verify(id:string){const t=this.tickets.get(id);return t?{...t}:null;}
}
export function claimAdReward(p:Progress,service:AdService,id:string,reward:AdReward){
 const t=service.verify(id);if(service.environment!=='test'||!t||t.kind!=='rewarded'||t.state!=='completed'||p.commerce.adClaims.includes(id))return false;
 if(reward.kind==='daily'&&(!p.daily[reward.date]||p.commerce.dailyDoubles.includes(reward.date)))return false;
 p.commerce.adClaims.push(id);if(reward.kind==='gold')credit(p,ECONOMY.rewardedGold);
 else if(reward.kind==='hint')p.commerce.hintCredits=Math.min(Number.MAX_SAFE_INTEGER,p.commerce.hintCredits+1);
 else {p.commerce.dailyDoubles.push(reward.date);credit(p,ECONOMY.daily);}return true;
}
/** Session-local pacing; called only at the successful result → next-level boundary. */
export class InterstitialSchedule{
 private wins=new Set<number>();private lastCount=0;private lastTime:number;
 constructor(startSeconds=0){this.lastTime=startSeconds;}
 record(level:number){this.wins.add(level);}
 take(p:Progress,nowSeconds:number,safeBoundary:boolean){
  if(!safeBoundary||removesAds(p)||p.completed.length<AD_POLICY.firstNormalCompletions||this.wins.size-this.lastCount<AD_POLICY.every||nowSeconds-this.lastTime<AD_POLICY.minSeconds)return false;
  this.lastCount=this.wins.size;this.lastTime=nowSeconds;return true;
 }
}
