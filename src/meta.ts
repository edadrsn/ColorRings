import type {Progress} from './progress.ts';
import type {Level} from './levels.ts';
import {calendarDay,localDateKey} from './modes.ts';
import {starRating} from './presentation.ts';
import {SKINS} from './cosmetics.ts';
import {credit,ECONOMY} from './economy.ts';
export function unlockedThrough(p:Progress):number{return Math.min(40,Math.max(1,p.unlocked,p.currentLevel<=40?p.currentLevel:1,...p.completed.filter(id=>id<=40).map(id=>id+1)));}
export function isLevelUnlocked(p:Progress,l:Level):boolean{return l.mastery?l.mastery<=p.masteryUnlocked:l.id<=unlockedThrough(p);}
export function awardPerfect(p:Progress,l:Level,moves:number,hints:number):number{const goal=l.perfect??{moves:l.stars.three,bonus:ECONOMY.perfectDefault};if(!p.completed.includes(l.id)||hints||moves>goal.moves||p.perfect.includes(l.id))return 0;p.perfect.push(l.id);credit(p,goal.bonus);return goal.bonus;}
export function awardChallenge(p:Progress,id:number,l:Level,moves:number):number{const before=p.challengeStars[id]??0,stars=starRating(moves,l.stars),gold=before?Math.max(0,stars-before)*ECONOMY.starImprovement:l.reward;p.challengeStars[id]=Math.max(before,stars);credit(p,gold);return gold;}
export function awardDaily(p:Progress,key:string,stars:number):number{if(p.daily[key])return 0;p.daily[key]=stars;credit(p,ECONOMY.daily);return ECONOMY.daily;}
export function dailyStreak(p:Progress,today=localDateKey()):number{const days=new Set(Object.keys(p.daily).map(calendarDay));let day=calendarDay(today);if(!days.has(day))day--;let count=0;while(days.has(day--))count++;return count;}
export const ACHIEVEMENTS=[
 {id:'first',name:'First Win',icon:'✦',target:1,reward:ECONOMY.achievementRewards.first,metric:(p:Progress)=>p.completed.includes(1)?1:0},
 {id:'beginner',name:'Puzzle Beginner',icon:'◇',target:10,reward:ECONOMY.achievementRewards.beginner,metric:(p:Progress)=>p.completed.length},
 {id:'master',name:'Puzzle Master',icon:'♛',target:50,reward:ECONOMY.achievementRewards.master,metric:(p:Progress)=>p.completed.length+Object.keys(p.challengeStars).length+Object.keys(p.daily).length},
 {id:'perfect',name:'Perfect Player',icon:'✧',target:5,reward:ECONOMY.achievementRewards.perfect,metric:(p:Progress)=>p.perfect.length},
 {id:'no-hints',name:'No Hints',icon:'◎',target:10,reward:ECONOMY.achievementRewards['no-hints'],metric:(p:Progress)=>p.noHintWins.length},
 {id:'collector',name:'Collector',icon:'●',target:3,reward:ECONOMY.achievementRewards.collector,metric:(p:Progress)=>p.owned.length},
 {id:'style',name:'Style Master',icon:'◈',target:3,reward:ECONOMY.achievementRewards.style,metric:(p:Progress)=>p.themes.length},
 {id:'daily',name:'Daily Explorer',icon:'☀',target:7,reward:ECONOMY.achievementRewards.daily,metric:(p:Progress)=>Object.keys(p.daily).length},
 {id:'challenge',name:'Challenge Winner',icon:'⚑',target:5,reward:ECONOMY.achievementRewards.challenge,metric:(p:Progress)=>Object.keys(p.challengeStars).length},
 {id:'stars',name:'Star Hunter',icon:'★',target:50,reward:ECONOMY.achievementRewards.stars,metric:(p:Progress)=>Object.values(p.stars).reduce((sum,s)=>sum+s,0)},
] as const;
export function claimAchievements(p:Progress):{names:string[];gold:number}{const names:string[]=[];let gold=0;for(let pass=0;pass<3;pass++){for(const item of ACHIEVEMENTS)if(!p.claimedAchievements.includes(item.id)&&item.metric(p)>=item.target){p.claimedAchievements.push(item.id);credit(p,item.reward);gold+=item.reward;names.push(item.name);}for(const skin of SKINS)if(skin.achievement&&p.claimedAchievements.includes(skin.achievement)&&!p.owned.includes(skin.id))p.owned.push(skin.id);}if(p.claimedAchievements.includes('daily')&&!p.themes.includes('aurora'))p.themes.push('aurora');return {names,gold};}
