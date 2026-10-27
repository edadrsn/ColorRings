import {LEVELS,LIVE_LAYOUT_SEEDS,type Level} from './levels.ts';
const copy=(level:Level,id:number,name:string):Level=>({...JSON.parse(JSON.stringify(level)),id,name});
export const CHALLENGES:Level[]=[
  {...copy(LEVELS[0],1001,'Üç hamle'),challenge:{maxMoves:3},reward:35,stars:{three:2,two:3}},
  {...copy(LEVELS[4],1002,'İpucusuz üç kat'),challenge:{maxMoves:8,noHints:true},reward:40},
  {...copy(LEVELS[22],1003,'İki çıkış tek deneme'),challenge:{maxMoves:6,noHints:true},reward:40},
  {...copy(LEVELS[21],1004,'Her halka bir kez'),challenge:{maxMoves:2,ringLimit:1},reward:45},
  {...copy(LEVELS[34],1005,'Anahtar ve renk ustası'),challenge:{maxMoves:5,noHints:true},reward:50},
];
export const LIVE_LEVELS:Level[]=LIVE_LAYOUT_SEEDS.map((source,i)=>{
  const level=copy(source,3001+i,`Canlı ${i+1} · ${source.name}`);
  return level;
});
export const LAB_LEVELS:Level[]=[
  {...copy(LEVELS[0],4001,'Top bölücü'),splitters:[{id:'lab-split',x:210,y:575,color:'pink',radius:28,outlets:[{x:-16,y:18},{x:16,y:18}]}],goals:{pink:2,blue:1},lesson:'×2 aygıtı pembe topu ikiye ayırır. Üç topu da teslim et.'},
  {...copy(LEVELS[0],4002,'Bağlantılı halkalar'),links:[{driver:0,follower:1,ratio:-1}],plan:[{ring:0,to:0},{ring:1,to:0},{play:true,waitFor:'all'}],lesson:'İç halka çevrilince dış halka ters yönde döner.'},
  {...copy(LEVELS[0],4003,'Sınırlı döndürme'),ringLimits:[1,1],rules:{maxMoves:2},lesson:'Her halkayı yalnız bir kez çevir; iki hamlede çöz.'},
  {...copy(LEVELS[89],4004,'Ustalık 50 · ödülsüz prova')},
  {...copy(LEVELS[139],4005,'Ustalık 100 · ödülsüz prova')},
];
export type GameMode='normal'|'challenge'|'daily'|'live'|'lab';
export function localDateKey(date=new Date()):string{return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;}
export function calendarDay(key:string):number{return Math.floor(Date.parse(`${key}T00:00:00Z`)/86400000);}
export function dailyLevel(key=localDateKey()):Level{
  const pool=LEVELS.slice(20,40),index=((calendarDay(key)%pool.length)+pool.length)%pool.length;
  return copy(pool[index],2001,`Günlük · ${key}`);
}
