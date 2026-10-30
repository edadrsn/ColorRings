import type {Level} from './levels.ts';
import {objectiveText} from './objectives.ts';
/** Localizable help derived from the actual level rules, never a suggested solution. */
export function levelBrief(level:Level){
 const lines=[objectiveText(level)];
 if(level.links?.length)lines.push('Bağlı halkalar birlikte döner.');
 if(level.colorGates?.length)lines.push('Renk değiştiren geçitlere dikkat et.');
 if(level.oneWays?.length)lines.push('Tek yönlü geçitlerde okları izle.');
 if(level.splitters?.length)lines.push('Bölücüden çıkan bütün topları teslim et.');
 if(level.obstacles?.length)lines.push('Hareketli engellerin zamanlamasını izle.');
 if(level.sequence?.length)lines.push('Toplar hareket ederken halkaları döndürebilirsin.');
 return lines.join(' ');
}
export function levelBriefs(levels:readonly Level[]){
 const map=new Map<string,string>(),conflicts=new Set<string>();for(const level of levels){const brief=levelBrief(level),prior=map.get(level.lesson);if(prior&&prior!==brief)conflicts.add(level.lesson);map.set(level.lesson,brief);}
 for(const lesson of conflicts)map.set(lesson,'Geçitleri hizala ve toplara yol aç.');
 return map;
}
