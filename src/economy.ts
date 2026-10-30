import type {Progress} from './progress.ts';
import {paletteById,type PaletteId} from './palettes.ts';
/** Existing level rewards/perfect thresholds remain in the centralized level data. */
export {ECONOMY} from './economy-config.ts';
import {ECONOMY} from './economy-config.ts';
export function credit(p:Progress,value:number){if(!Number.isSafeInteger(value)||value<0)return false;p.coins=Math.min(Number.MAX_SAFE_INTEGER,p.coins+value);return true;}
export function spend(p:Progress,value:number){if(!Number.isSafeInteger(value)||value<0||p.coins<value)return false;p.coins-=value;return true;}
export function buyPalette(p:Progress,id:PaletteId):'bought'|'owned'|'insufficient'{if(p.palettes.includes(id)){p.palette=id;return 'owned';}if(!paletteById(id)||!spend(p,paletteById(id).cost))return 'insufficient';p.palettes.push(id);p.palette=id;return 'bought';}
export function applyExtraHint(p:Progress,apply:()=>boolean):'credit'|'gold'|'insufficient'|'unavailable'{
 if(!p.hintCredits&&p.coins<ECONOMY.hint)return 'insufficient';if(!apply())return 'unavailable';
 if(p.hintCredits){p.hintCredits--;return 'credit';}spend(p,ECONOMY.hint);return 'gold';
}
