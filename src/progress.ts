import {freshIntro,loadIntro,type IntroState} from './intro-state.ts';
import {freshCommerce,loadCommerce,type CommerceState} from './purchases.ts';
import {credit,spend,ECONOMY} from './economy.ts';
import {validPalette,type PaletteId} from './palettes.ts';
import {validQuality,type EffectQuality} from './effects.ts';
import {LEVELS,type Level} from './levels.ts';
import {starRating} from './presentation.ts';
import {SKINS,validSkin,type SkinId} from './cosmetics.ts';
import {THEMES,validTheme,type ThemeId} from './themes.ts';
export type Progress={version:4;onboarding:IntroState;commerce:CommerceState;palette:PaletteId;palettes:PaletteId[];effectQuality:EffectQuality;masteryUnlocked:number;statistics:{wins:number;moves:number;seconds:number};liveBest:Record<string,number>;liveTutorialDone:boolean;speed:1|2;unlocked:number;coins:number;completed:number[];stars:Record<string,number>;owned:SkinId[];skin:SkinId;currentLevel:number;sound:boolean;vibration:boolean;symbols:boolean;motionPreview:boolean;tutorialDone:number[];perfect:number[];noHintWins:number[];themes:ThemeId[];theme:ThemeId;challengeStars:Record<string,number>;liveWins:number[];daily:Record<string,number>;claimedAchievements:string[];music:boolean;reducedMotion:boolean};
export type StorageLike={getItem:(key:string)=>string|null;setItem:(key:string,value:string)=>void};
export const SAVE_KEY='spin-sort-v1';
export function freshProgress():Progress{return {version:4,onboarding:freshIntro(),commerce:freshCommerce(),palette:'pastel',palettes:['pastel'],effectQuality:'medium',masteryUnlocked:1,statistics:{wins:0,moves:0,seconds:0},liveBest:{},liveTutorialDone:false,speed:1,unlocked:1,coins:0,completed:[],stars:{},owned:['classic'],skin:'classic',currentLevel:1,sound:true,vibration:false,symbols:true,motionPreview:true,tutorialDone:[],perfect:[],noHintWins:[],themes:['classic'],theme:'classic',challengeStars:{},liveWins:[],daily:{},claimedAchievements:[],music:false,reducedMotion:false};}
export function loadProgress(storage:StorageLike|null):Progress{
  const progress=freshProgress();try{
    const data=JSON.parse(storage?.getItem(SAVE_KEY)||'null');if(!data||typeof data!=='object')return progress;
    if(Array.isArray(data.palettes))progress.palettes=[...new Set<PaletteId>(['pastel',...data.palettes.filter(validPalette)])];
    if(validPalette(data.palette)&&progress.palettes.includes(data.palette))progress.palette=data.palette;
    if(validQuality(data.effectQuality))progress.effectQuality=data.effectQuality;
    progress.commerce=loadCommerce(data.commerce);
    progress.coins=Number.isSafeInteger(data.coins)&&data.coins>=0?data.coins:0;
    progress.completed=Array.isArray(data.completed)?[...new Set<number>(data.completed.filter((id:unknown)=>LEVELS.some(level=>level.id===id)))]:data.completed===true?[1]:[];
    for(const level of LEVELS){const value=data.stars?.[level.id];if(Number.isInteger(value)&&value>=1&&value<=3){progress.stars[level.id]=value;if(!progress.completed.includes(level.id))progress.completed.push(level.id);}}
    if(Array.isArray(data.owned))progress.owned=[...new Set<SkinId>(['classic',...data.owned.filter(validSkin)])];
    if(validSkin(data.skin)&&progress.owned.includes(data.skin))progress.skin=data.skin;
    if(LEVELS.some(level=>level.id===data.currentLevel))progress.currentLevel=data.currentLevel;
    progress.sound=data.sound!==false;progress.vibration=data.vibration===true;progress.symbols=data.symbols!==false;
    progress.motionPreview=data.motionPreview!==false;progress.onboarding=loadIntro(data.onboarding);
    // Existing players do not have to repeat lessons for already completed levels.
    const done=Array.isArray(data.tutorialDone)?data.tutorialDone:progress.completed;
    progress.tutorialDone=[...new Set<number>(done.filter((id:unknown)=>[1,2,3,7,8,9,10,28,39].includes(Number(id))&&typeof id==='number'))];
    const ids=(value:unknown,max:number)=>Array.isArray(value)?[...new Set<number>(value.filter((id:unknown)=>Number.isInteger(id)&&Number(id)>=1&&Number(id)<=max))]:[];
    progress.perfect=ids(data.perfect,LEVELS.length);progress.noHintWins=ids(data.noHintWins,LEVELS.length);progress.liveWins=ids(data.liveWins,5);
    if(Array.isArray(data.themes))progress.themes=[...new Set<ThemeId>(['classic',...data.themes.filter(validTheme)])];
    if(validTheme(data.theme)&&progress.themes.includes(data.theme))progress.theme=data.theme;
    for(let id=1;id<=5;id++){const stars=data.challengeStars?.[id];if(Number.isInteger(stars)&&stars>=1&&stars<=3)progress.challengeStars[id]=stars;}
    if(data.daily&&typeof data.daily==='object')for(const [date,stars] of Object.entries(data.daily)){
      const parsed=new Date(`${date}T00:00:00Z`);
      if(/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(parsed.getTime())&&parsed.toISOString().slice(0,10)===date&&Number.isInteger(stars)&&Number(stars)>=1&&Number(stars)<=3)progress.daily[date]=Number(stars);
    }
    if(Array.isArray(data.claimedAchievements))progress.claimedAchievements=[...new Set<string>(data.claimedAchievements.filter((id:unknown)=>typeof id==='string'&&id.length<40))];
    progress.music=data.music===true;progress.reducedMotion=data.reducedMotion===true;
    const legacy=(data.version??1)<=2&&(data.version===2||Number.isSafeInteger(data.coins)&&data.coins>=0||progress.completed.length>0);
    progress.unlocked=Math.min(40,Math.max(Number.isInteger(data.unlocked)?data.unlocked:legacy?20:1,progress.currentLevel<=40?progress.currentLevel:1,...progress.completed.filter(id=>id<=40).map(id=>id+1)));
    progress.masteryUnlocked=Math.min(100,Math.max(Number.isInteger(data.masteryUnlocked)?data.masteryUnlocked:1,progress.currentLevel>40?progress.currentLevel-40:1,...progress.completed.filter(id=>id>40).map(id=>id-40+1)));
    for(const field of ['wins','moves','seconds'] as const){const value=data.statistics?.[field];if(typeof value==='number'&&Number.isFinite(value)&&value>=0)progress.statistics[field]=value;}
    for(let id=1;id<=5;id++){const value=data.liveBest?.[id];if(Number.isSafeInteger(value)&&value>=0)progress.liveBest[id]=value;}
    progress.liveTutorialDone=data.liveTutorialDone===true;progress.speed=data.speed===2?2:1;
  }catch{}return progress;
}
export function saveProgress(progress:Progress,storage:StorageLike|null):boolean{try{if(!storage)return false;storage.setItem(SAVE_KEY,JSON.stringify(progress));return true;}catch{return false;}}
export function awardCompletion(progress:Progress,level:Level,moves:number):{stars:number;gold:number;improved:boolean}{
  const stars=starRating(moves,level.stars),previous=progress.stars[level.id]??0,first=!progress.completed.includes(level.id);
  const gold=first?level.reward:Math.max(0,stars-previous)*ECONOMY.starImprovement;
  if(first)progress.completed.push(level.id);progress.stars[level.id]=Math.max(previous,stars);credit(progress,gold);
  if(level.mastery)progress.masteryUnlocked=Math.min(100,Math.max(progress.masteryUnlocked,level.mastery+1));else progress.unlocked=Math.min(40,Math.max(progress.unlocked,level.id+1));
  return {stars,gold,improved:stars>previous};
}
export function buySkin(progress:Progress,id:SkinId):'bought'|'owned'|'insufficient'|'invalid'{
  const item=SKINS.find(skin=>skin.id===id);if(!item)return 'invalid';
  if((item.achievement||item.premium)&&!progress.owned.includes(id))return 'invalid';
  if(progress.owned.includes(id))return 'owned';if(!spend(progress,item.cost))return 'insufficient';
  progress.owned.push(id);progress.skin=id;return 'bought';
}
export function equipSkin(progress:Progress,id:SkinId):boolean{if(!validSkin(id)||!progress.owned.includes(id))return false;progress.skin=id;return true;}
export function buyTheme(progress:Progress,id:ThemeId):'bought'|'owned'|'insufficient'{const item=THEMES.find(theme=>theme.id===id);if(!item)return 'insufficient';if(progress.themes.includes(id))return 'owned';if(('premium' in item)||!spend(progress,item.cost))return 'insufficient';progress.themes.push(id);progress.theme=id;return 'bought';}
