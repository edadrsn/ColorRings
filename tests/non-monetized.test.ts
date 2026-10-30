import {test} from 'node:test';
import assert from 'node:assert/strict';
import {existsSync,readFileSync,readdirSync} from 'node:fs';
import {freshProgress,loadProgress,saveProgress,SAVE_KEY,buySkin,buyTheme,awardCompletion} from '../src/progress.ts';
import {LEVELS} from '../src/levels.ts';
import {awardPerfect,claimAchievements} from '../src/meta.ts';
import {applyExtraHint,buyPalette,spend,credit,ECONOMY} from '../src/economy.ts';
import {cosmeticStoreMarkup} from '../src/cosmetic-store.ts';
import {collectionMarkup,skinDetailMarkup} from '../src/menu-views.ts';
import {homeMarkup} from '../src/home-view.ts';
import {SKINS} from '../src/cosmetics.ts';
import {THEMES} from '../src/themes.ts';

test('old saves retain coins, selected cosmetics, progress and unused hint credits without transaction state',()=>{
 const old={...freshProgress(),coins:841,completed:[1,2],stars:{1:3,2:2},owned:['classic','prism','orbit','royal'],skin:'royal',themes:['classic','prism','velvet'],theme:'velvet',hintCredits:undefined,commerce:{products:['premium'],receipts:['old-receipt'],adClaims:['old-ad'],hintCredits:3,dailyDoubles:['2026-10-27']}};
 const map=new Map([[SAVE_KEY,JSON.stringify(old)],['spin-sort-test-receipts-v1','old journal'],['unrelated','preserve']]);const storage={getItem:(k:string)=>map.get(k)??null,setItem:(k:string,v:string)=>{map.set(k,v);},removeItem:(k:string)=>{map.delete(k);}};
 const p=loadProgress(storage);assert.equal(p.coins,841);assert.equal(p.skin,'royal');assert.equal(p.theme,'velvet');assert.deepEqual(p.completed,[1,2]);assert.equal(p.stars[2],2);assert.equal(p.hintCredits,3);assert.ok(!('commerce' in p));assert.ok(!map.has('spin-sort-test-receipts-v1'));assert.equal(map.get('unrelated'),'preserve');
 saveProgress(p,storage);assert.deepEqual(loadProgress(storage),p);assert.ok(!map.get(SAVE_KEY)!.includes('receipts'));assert.ok(!map.get(SAVE_KEY)!.includes('products'));
});
test('legacy cleanup failure does not prevent loading progress; new hint field wins',()=>{
 const p=loadProgress({getItem:()=>JSON.stringify({version:4,coins:50,hintCredits:2,commerce:{hintCredits:9}}),setItem(){},removeItem(){throw Error('blocked');}});assert.equal(p.coins,50);assert.equal(p.hintCredits,2);
 for(const hintCredits of [-1,.5,Infinity,'3'])assert.equal(loadProgress({getItem:()=>JSON.stringify({hintCredits}),setItem(){}}).hintCredits,0);
});
for(const id of ['prism','orbit','royal'] as const)test(`${id} is now a regular coin skin, charged once and reloadable`,()=>{
 const p=freshProgress(),cost=SKINS.find(s=>s.id===id)!.cost;assert.ok(cost>0);p.coins=cost-1;assert.equal(buySkin(p,id),'insufficient');p.coins=cost;assert.equal(buySkin(p,id),'bought');assert.equal(p.coins,0);assert.equal(p.skin,id);assert.equal(buySkin(p,id),'owned');assert.ok(p.owned.includes(id));
 let saved='';const storage={getItem:()=>saved,setItem:(_k:string,v:string)=>{saved=v;}};saveProgress(p,storage);assert.deepEqual(loadProgress(storage),p);
});
for(const id of ['prism','velvet'] as const)test(`${id} theme is unlockable with earned coins`,()=>{const p=freshProgress(),cost=THEMES.find(t=>t.id===id)!.cost;p.coins=cost;assert.ok(cost>0);assert.equal(buyTheme(p,id),'bought');assert.equal(p.coins,0);assert.equal(buyTheme(p,id),'owned');assert.ok(p.themes.includes(id));});
test('extra hints use saved credits or earned coins and never charge failed actions',()=>{
 const p=freshProgress();p.hintCredits=1;assert.equal(applyExtraHint(p,()=>false),'unavailable');assert.equal(p.hintCredits,1);assert.equal(applyExtraHint(p,()=>true),'credit');assert.equal(p.hintCredits,0);assert.equal(applyExtraHint(p,()=>true),'insufficient');p.coins=ECONOMY.hint;assert.equal(applyExtraHint(p,()=>false),'unavailable');assert.equal(p.coins,ECONOMY.hint);assert.equal(applyExtraHint(p,()=>true),'gold');assert.equal(p.coins,0);
});
test('coin economy preserves overdraft, overflow and repeat-unlock guards',()=>{const p=freshProgress();assert.equal(spend(p,-1),false);assert.equal(credit(p,Infinity),false);assert.equal(spend(p,.5),false);assert.equal(buyPalette(p,'galaxy'),'insufficient');p.coins=200;assert.equal(buyPalette(p,'galaxy'),'bought');const coins=p.coins;assert.equal(buyPalette(p,'galaxy'),'owned');assert.equal(p.coins,coins);p.coins=Number.MAX_SAFE_INTEGER;credit(p,100);assert.equal(p.coins,Number.MAX_SAFE_INTEGER);});
test('all player-facing store and collection views are free of transaction and advertising hooks',()=>{
 const p=freshProgress(),html=[homeMarkup(p),cosmeticStoreMarkup(p),collectionMarkup(p,()=>[],'') ,skinDetailMarkup(p,'prism',[])].join('');assert.ok(!/premium|reklam|TEST AD|TEST PURCHASE|data-product|data-ad|restore|data-filter="premium"/i.test(html));assert.equal((collectionMarkup(p,()=>[],'','locked').match(/data-skin=/g)??[]).length,22);
 for(const file of ['ads.ts','purchases.ts','store-controller.ts','store-view.ts'])assert.equal(existsSync(new URL('../src/'+file,import.meta.url)),false);
 const main=readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');assert.ok(!/Interstitial|adSchedule|store\.show|commerce\.|data-product/.test(main));assert.match(main,/onclick=\(\)=>\{if\(mode==='normal'\)selectLevel\(session.levelIndex\+1\)/);
});

test('runtime sources and installed dependency graph contain no retired ad or payment entry points',()=>{
 const root=new URL('../src/',import.meta.url);
 for(const name of readdirSync(root,{recursive:true}).filter(name=>/\.(ts|css|html)$/.test(name))){
  const source=readFileSync(new URL(name.replaceAll('\\','/'),root),'utf8');
  assert.doesNotMatch(source,/Reward\s+earned!|TestAdService|TestPurchaseService|claimAdReward|redeemPurchase|InterstitialSchedule|data-ad-reward|data-product|ad-complete|test-ad-card|test-purchase/i,name);
 }
 const lock=JSON.parse(readFileSync(new URL('../package-lock.json',import.meta.url),'utf8'));
 for(const name of Object.keys(lock.packages))assert.doesNotMatch(name,/admob|revenuecat|cordova-plugin-purchase|capacitor-purchases|in-app-purchase|stripe/i,name);
});

test('level and achievement gold can unlock a cosmetic and persist without an ad or payment service',()=>{
 const p=freshProgress();let expected=0;
 for(const level of LEVELS.slice(0,5)){
  expected+=awardCompletion(p,level,level.stars.three).gold;
  expected+=awardPerfect(p,level,level.stars.three,0);
  expected+=claimAchievements(p).gold;
 }
 assert.equal(p.coins,expected);assert.ok(p.claimedAchievements.includes('first'));
 for(const level of LEVELS.slice(0,5)){
  assert.equal(awardCompletion(p,level,level.stars.three).gold,0);
  assert.equal(awardPerfect(p,level,level.stars.three,0),0);
 }
 assert.equal(claimAchievements(p).gold,0);assert.equal(p.coins,expected);
 const cost=SKINS.find(s=>s.id==='pearl')!.cost;
 assert.ok(expected>=cost);assert.equal(buySkin(p,'pearl'),'bought');assert.equal(p.coins,expected-cost);
 assert.equal(buySkin(p,'pearl'),'owned');assert.equal(p.coins,expected-cost);
 const map=new Map<string,string>(),storage={getItem:(key:string)=>map.get(key)??null,setItem:(key:string,value:string)=>{map.set(key,value);}};
 assert.equal(saveProgress(p,storage),true);assert.deepEqual(loadProgress(storage),p);
});
