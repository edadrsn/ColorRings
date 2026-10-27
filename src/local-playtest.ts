import type {StorageLike} from './progress.ts';
export type PlaytestEvent='start'|'complete'|'failure'|'restart'|'undo'|'hint'|'tutorial-complete'|'tutorial-skip'|'exit';
export type PlaytestRow={event:PlaytestEvent;level:number;mode:string;moves:number;seconds:number};
export const PLAYTEST_KEY='spin-sort-local-playtest-v1';
/** Local only; a bounded allowlist. No identifiers, timestamps, URLs, network or device data. */
export class LocalPlaytest{
 private rows:PlaytestRow[]=[];private store:StorageLike|null;
 constructor(store:StorageLike|null){this.store=store;try{const data=JSON.parse(store?.getItem(PLAYTEST_KEY)??'[]');if(Array.isArray(data))this.rows=data.filter(validRow).slice(-300).map(clean);}catch{}}
 record(row:PlaytestRow){if(!validRow(row))return;this.rows.push(clean(row));if(this.rows.length>300)this.rows.shift();try{this.store?.setItem(PLAYTEST_KEY,JSON.stringify(this.rows));}catch{}}
 export(){return this.rows.map(r=>({...r}));}
 clear(){this.rows=[];try{this.store?.setItem(PLAYTEST_KEY,'[]');}catch{}}
}
const EVENTS:PlaytestEvent[]=['start','complete','failure','restart','undo','hint','tutorial-complete','tutorial-skip','exit'];
function validRow(r:unknown):r is PlaytestRow{if(!r||typeof r!=='object')return false;const v=r as PlaytestRow;return EVENTS.includes(v.event)&&Number.isInteger(v.level)&&v.level>=1&&v.level<=10000&&['normal','daily','challenge','live','lab'].includes(v.mode)&&Number.isSafeInteger(v.moves)&&v.moves>=0&&Number.isFinite(v.seconds)&&v.seconds>=0;}
function clean(r:PlaytestRow):PlaytestRow{return {event:r.event,level:r.level,mode:r.mode,moves:r.moves,seconds:Math.round(r.seconds*10)/10};}
