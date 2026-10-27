import type {SkinId} from './cosmetics.ts';
import {productArt} from './ui-art.ts';
import type {Progress,StorageLike} from './progress.ts';
import {TestPurchaseService,redeemPurchase,type ProductId,type PurchaseOutcome} from './purchases.ts';
import {TestAdService,claimAdReward,type AdReward,type AdTicket} from './ads.ts';
import {localDateKey} from './modes.ts';
import {storeMarkup,purchaseMarkup,adChoicesMarkup,type StoreTab} from './store-view.ts';
type StoreHost={preview:(id:SkinId)=>string[];root:HTMLElement;open:(title:string,render:()=>void,key?:string)=>void;back:()=>void;changed:()=>boolean;balls:()=>void;themes:()=>void;palettes:()=>void};
/** UI orchestrates independent provider interfaces; there is no third-party SDK. */
export class StoreController{
 private p:Progress;private host:StoreHost;private purchases:TestPurchaseService;private ads=new TestAdService();private ticket:AdTicket|null=null;private reward:AdReward|null=null;private pendingPurchase=false;private tab:StoreTab='featured';
 constructor(p:Progress,storage:StorageLike|null,host:StoreHost){this.p=p;this.host=host;this.purchases=new TestPurchaseService(storage);}
 dismiss(){if(this.ticket)this.ads.close(this.ticket.id);this.ticket=null;this.reward=null;}
 show(tab:StoreTab=this.tab,message=''){
  this.dismiss();this.tab=tab;this.host.open('Store',()=>this.show(tab),'store');const root=this.host.root;root.innerHTML=storeMarkup(this.p,tab,message,this.host.preview);
  root.querySelectorAll<HTMLButtonElement>('[data-store-tab]').forEach(b=>b.onclick=()=>this.show(b.dataset.storeTab as StoreTab));
  root.querySelectorAll<HTMLButtonElement>('[data-product]').forEach(b=>b.onclick=()=>this.buy(b.dataset.product as ProductId));
  const actions:Record<string,()=>void>={balls:this.host.balls,themes:this.host.themes,palettes:this.host.palettes,ads:()=>this.showAds(),restore:()=>{void this.restore();}};
  root.querySelectorAll<HTMLButtonElement>('[data-store-action]').forEach(b=>b.onclick=actions[b.dataset.storeAction!]);
 }
 private buy(product:ProductId){
  this.host.open('Test satın alma',()=>this.buy(product),`purchase:${product}`);const root=this.host.root;root.innerHTML=purchaseMarkup(product);
  root.querySelector<HTMLButtonElement>('#purchase-back')!.onclick=this.host.back;
  root.querySelector<HTMLButtonElement>('#test-purchase')!.onclick=async()=>{
   if(this.pendingPurchase)return;this.pendingPurchase=true;const button=root.querySelector<HTMLButtonElement>('#test-purchase')!;button.disabled=true;
   try{const outcome=root.querySelector<HTMLSelectElement>('#purchase-outcome')!.value as PurchaseOutcome,result=await this.purchases.purchase(product,outcome);
    if(result.status==='success'||result.status==='owned'){const applied=await redeemPurchase(this.p,result.receipt,this.purchases),saved=this.host.changed();if(button.isConnected){this.host.back();this.show(this.tab,!saved?'Test işlemi oturumda uygulandı; tarayıcı kaydedemedi. Makbuzdan geri yüklemeyi deneyebilirsin.':applied?'✓ Test işlemi tamamlandı; haklar kaydedildi.':'✓ Zaten sahipsin; tekrar ücret veya ödül yok.');}}
    else if(button.isConnected){this.host.back();this.show(this.tab,result.status==='cancelled'?'İşlem iptal edildi; bakiye ve haklar değişmedi.':'Test satın alma başarısız; bakiye ve haklar değişmedi.');}
   }catch{if(button.isConnected){this.host.back();this.show(this.tab,'İşlem kaydedilemedi. Tekrar deneyebilirsin.');}}finally{this.pendingPurchase=false;}
  };
 }
 private async restore(){let count=0;try{const receipts=[...await this.purchases.restore(),...await this.purchases.pending(this.p.commerce.receipts)];for(const r of receipts)if(await redeemPurchase(this.p,r,this.purchases))count++;const saved=this.host.changed();this.show(this.tab,saved?`Geri yükleme tamamlandı: ${count} yeni test hakkı. Tüketilen test altını yeniden verilmez.`:'Geri yükleme oturumda uygulandı; tarayıcı kaydedemedi.');}catch{this.show(this.tab,'Test makbuzları okunamadı.');}}
 showAds(message=''){this.dismiss();this.host.open('Ödüllü reklam · test',()=>this.showAds(),'ad-choices');const root=this.host.root;const date=localDateKey();root.innerHTML=adChoicesMarkup(this.p,date);if(message){const note=document.createElement('p');note.className='shop-message';note.setAttribute('role','status');note.textContent=message;root.append(note);}
  root.querySelectorAll<HTMLButtonElement>('[data-ad-reward]').forEach(b=>b.onclick=()=>{const value=b.dataset.adReward;this.showAd(value==='daily'?{kind:'daily',date}:value==='hint'?{kind:'hint'}:{kind:'gold'},root.querySelector<HTMLSelectElement>('#ad-load')!.value==='failed');});
 }
 showInterstitial(done:()=>void){this.showAd(null,false,done);}
 private showAd(reward:AdReward|null,fail:boolean,done?:()=>void){
  this.dismiss();this.reward=reward;this.ticket=this.ads.prepare(reward?'rewarded':'interstitial',fail);this.host.open('TEST AD',()=>this.showAd(reward,fail,done),'ad-player');const root=this.host.root;
  const render=()=>{const t=this.ticket;if(!t)return;root.innerHTML=`<div class="test-ad-card"><span class="test-badge">TEST AD · ${reward?'ÖDÜLLÜ':'GEÇİŞ'}</span><div class="test-ad-emblem">${t.state==='completed'?'✓':t.state==='load-failed'?'!':productArt('gold')}</div><h3>${{'idle':'Hazırlanıyor','ready':'Reklam hazır','load-failed':'Reklam yüklenemedi','started':'Test reklamı başladı','completed':'Reklam tamamlandı','closed':'Reklam kapatıldı'}[t.state]}</h3><p>Bu bir test simülasyonudur. Gerçek reklam gösterilmez.</p><p id="ad-status" role="status"></p><div class="mode-list">${t.state==='ready'?'<button id="ad-start">Test reklamını başlat</button><button id="ad-fail">Yükleme hatasını dene</button>':''}${t.state==='started'?'<button id="ad-complete">Tamamlandı olayını gönder</button>':''}${t.state==='completed'&&reward?'<button id="ad-duplicate">Aynı tamamlanma olayını tekrar gönder</button>':''}<button id="ad-close">${t.state==='completed'||t.state==='load-failed'?'Devam et':'Reklamı kapat · ödülsüz'}</button></div></div>`;
   const bind=(id:string,fn:()=>void)=>{const e=root.querySelector<HTMLButtonElement>('#'+id);if(e)e.onclick=fn;};
   bind('ad-start',()=>{if(this.ads.start(t.id)){t.state='started';render();}});
   bind('ad-fail',()=>{this.ads.close(t.id);t.state='load-failed';render();});
   bind('ad-complete',()=>{const complete=this.ads.complete(t.id);if(!complete)return;t.state='completed';const awarded=reward&&claimAdReward(this.p,this.ads,t.id,reward),saved=awarded?this.host.changed():true;render();root.querySelector('#ad-status')!.textContent=awarded?(saved?'✓ Ödül verildi ve kaydedildi.':'Ödül oturumda verildi; tarayıcı kaydedemedi.'):reward?'Bu ödül daha önce alındı.':'Geçiş tamamlandı; ödül yok.';});
   bind('ad-duplicate',()=>{const duplicate=reward&&claimAdReward(this.p,this.ads,t.id,reward);root.querySelector('#ad-status')!.textContent=duplicate?'Ödül verildi.':'✓ Tekrarlanan olay engellendi; ikinci ödül verilmedi.';});
   bind('ad-close',()=>{const completed=t.state==='completed';this.dismiss();if(done)done();else{this.host.back();this.showAds(completed?'Test reklamı tamamlandı.':'Reklam kapatıldı; ödül verilmedi.');}});
  };render();
 }
}
