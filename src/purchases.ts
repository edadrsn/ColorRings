import type {Progress,StorageLike} from './progress.ts';
import {credit,ECONOMY} from './economy.ts';
export const PRODUCTS=[
 {id:'remove-ads',name:'Remove Ads',description:'Zorunlu geçiş reklamlarını kaldırır. Ödüllü reklam isteğe bağlı kalır.',kind:'nonconsumable'},
 {id:'premium',name:'Color Rings Premium',description:'Reklam kaldırma · Prism, Orbit, Royal topları · Prism ve Velvet temaları · profil çerçevesi.',kind:'nonconsumable'},
 {id:'neon-pack',name:'Neon Pack',description:'Neon ve Rainbow topları + Neon tema ve paleti.',kind:'nonconsumable'},
 {id:'galaxy-pack',name:'Galaxy Pack',description:'Galaxy ve Stardust topları + Midnight tema ve Galaxy paleti.',kind:'nonconsumable'},
 {id:'gold-500',name:'500 test altını',description:'Tek test işlemiyle 500 oyun içi altın.',kind:'consumable'},
] as const;
export type ProductId=typeof PRODUCTS[number]['id'];
export type PurchaseOutcome='success'|'cancelled'|'failed';
export type Receipt={id:string;product:ProductId;environment:'test'};
export type PurchaseResult={status:'success'|'owned';receipt:Receipt}|{status:'cancelled'|'failed'};
/** Native adapters must verify store receipts remotely before returning a trusted entitlement. */
export interface PurchaseService{readonly environment:'test'|'production';purchase(product:ProductId,outcome:PurchaseOutcome):Promise<PurchaseResult>;restore():Promise<Receipt[]>;verify(receipt:Receipt):Promise<boolean>}
const KEY='spin-sort-test-receipts-v1';
export const isProduct=(v:unknown):v is ProductId=>PRODUCTS.some(p=>p.id===v);
/** Local simulator only. A receipt here is never evidence of a real purchase. */
export class TestPurchaseService implements PurchaseService{
 readonly environment='test' as const;private receipts:Receipt[]=[];private storage:StorageLike|null;
 constructor(storage:StorageLike|null){this.storage=storage;try{const saved=JSON.parse(storage?.getItem(KEY)??'[]');if(Array.isArray(saved))this.receipts=saved.filter(r=>r&&r.environment==='test'&&isProduct(r.product)&&typeof r.id==='string'&&/^test-[a-z0-9-]+$/i.test(r.id));}catch{}}
 async purchase(product:ProductId,outcome:PurchaseOutcome):Promise<PurchaseResult>{
  if(!isProduct(product)||outcome==='failed')return {status:'failed'};if(outcome==='cancelled')return {status:'cancelled'};
  const item=PRODUCTS.find(p=>p.id===product)!;const before=this.receipts.find(r=>r.product===product);if(before&&item.kind==='nonconsumable')return {status:'owned',receipt:before};
  const receipt:Receipt={id:'test-'+crypto.randomUUID(),product,environment:'test'};const next=[...this.receipts,receipt];
  try{if(!this.storage)return {status:'failed'};this.storage.setItem(KEY,JSON.stringify(next));}catch{return {status:'failed'};}
  this.receipts=next;return {status:'success',receipt};
 }
 async restore(){return this.receipts.filter(r=>PRODUCTS.find(p=>p.id===r.product)?.kind==='nonconsumable').map(r=>({...r}));}
 /** Recovers journaled transactions after a later progress write failed. Applied consumables stay consumed. */
 async pending(applied:readonly string[]){return this.receipts.filter(r=>!applied.includes(r.id)).map(r=>({...r}));}
 async verify(r:Receipt){return r.environment==='test'&&this.receipts.some(item=>item.id===r.id&&item.product===r.product);}
}
export type CommerceState={products:ProductId[];receipts:string[];adClaims:string[];hintCredits:number;dailyDoubles:string[]};
export function freshCommerce():CommerceState{return {products:[],receipts:[],adClaims:[],hintCredits:0,dailyDoubles:[]};}
export function loadCommerce(raw:unknown):CommerceState{
 const c=freshCommerce();if(!raw||typeof raw!=='object')return c;const r=raw as Record<string,unknown>;
 const ids=(v:unknown)=>Array.isArray(v)?[...new Set(v.filter((x):x is string=>typeof x==='string'&&x.length<100))]:[];
 c.products=ids(r.products).filter(isProduct);c.receipts=ids(r.receipts);c.adClaims=ids(r.adClaims);c.dailyDoubles=ids(r.dailyDoubles).filter(x=>/^\d{4}-\d{2}-\d{2}$/.test(x));c.hintCredits=Number.isSafeInteger(r.hintCredits)&&Number(r.hintCredits)>=0?Number(r.hintCredits):0;return c;
}
export const removesAds=(p:Progress)=>p.commerce.products.includes('premium')||p.commerce.products.includes('remove-ads');
export async function redeemPurchase(p:Progress,r:Receipt,service:PurchaseService){
 if(service.environment!=='test'||r.environment!=='test'||!await service.verify(r))return false;
 if(p.commerce.receipts.includes(r.id))return false;p.commerce.receipts.push(r.id);
 if(!p.commerce.products.includes(r.product)&&r.product!=='gold-500')p.commerce.products.push(r.product);
 const skin=(id:typeof p.skin)=>{if(!p.owned.includes(id))p.owned.push(id);},theme=(id:typeof p.theme)=>{if(!p.themes.includes(id))p.themes.push(id);},palette=(id:typeof p.palette)=>{if(!p.palettes.includes(id))p.palettes.push(id);};
 if(r.product==='premium'){(['prism','orbit','royal'] as const).forEach(skin);(['prism','velvet'] as const).forEach(theme);}
 if(r.product==='neon-pack'){skin('neon');skin('rainbow');theme('neon');palette('neon');}
 if(r.product==='galaxy-pack'){skin('galaxy');skin('stardust');theme('midnight');palette('galaxy');}
 if(r.product==='gold-500')credit(p,ECONOMY.goldPack);return true;
}
