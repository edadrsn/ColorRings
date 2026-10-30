import {mkdirSync,writeFileSync} from 'node:fs';
import {LEVELS} from '../src/levels.ts';
import {CHALLENGES,LIVE_LEVELS,LAB_LEVELS} from '../src/modes.ts';
import {analyzePuzzle} from '../src/puzzle-analysis.ts';
import {RingSession} from '../src/engine.ts';
import {rotationDelta} from '../src/presentation.ts';
import {validateSolution} from '../src/solutions.ts';
const folder='android-readiness';mkdirSync(folder,{recursive:true});
const inspected=[1,5,10,20,30,50,90];
const rows=LEVELS.map(level=>({...analyzePuzzle(level,inspected.includes(level.id)),code:level.mastery?'U'+level.mastery:'K'+level.id}));
const specials=[...CHALLENGES,...LIVE_LEVELS,...LAB_LEVELS].map(level=>({id:level.id,success:validateSolution(level).success}));
let seed=0xc0102026;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
const sampling=[];
for(const id of inspected){const level=LEVELS[id-1];let wins=0;
 for(let sample=0;sample<12;sample++){const session=new RingSession();session.selectCustom(level);
  for(let ring=0;ring<level.rings.length;ring++){const step=level.rotationStep??15,target=Math.floor(random()*(360/step))*step;if(session.canRotate(ring))session.rotate(ring,rotationDelta(session.angles[ring],target));}
  session.play();for(let tick=0;tick<120*16&&!session.world.finished;tick++)session.world.step();session.finish();if(session.phase==='success')wins++;
 }
 const row={id,code:level.mastery?'U'+level.mastery:'K'+id,staticRandomWins:wins,trials:12,horizonSeconds:16};sampling.push(row);console.log(JSON.stringify(row));
}
const report={normalSolved:rows.filter(r=>r.solved).length,normalTotal:rows.length,specialSolved:specials.filter(r=>r.success).length,specialTotal:specials.length,rows,specials,sampling,notes:['Known plan counts, not proven global minima.','Static random poses only, 12 seeded trials per sampled level; no claim about arbitrary live rotation strategies.','Catalog id 50 is U10; U50 has catalog id 90. Both are audited.']};
writeFileSync(folder+'/puzzle-audit.json',JSON.stringify(report,null,2));
writeFileSync(folder+'/LEVEL_COMPARISON.md',['# Bölüm karşılaştırması','',...report.notes.map(n=>'- '+n),'','| Bölüm | Katalog ID | Bilinen hamle | Halka | Teslim aşaması | Mekanik | Silinince bozulan hamle | Rastgele sabit duruş başarısı |','|---|---|---|---|---|---|---|---|',...inspected.map(id=>{const row=rows[id-1],sample=sampling.find(s=>s.id===id);return `| ${row.code} | ${id} | ${row.moves} | ${row.rings} | ${row.phases} | ${row.mechanics.join(', ')||'temel'} | ${row.essentialActionsInPlan} | ${sample.staticRandomWins}/${sample.trials} |`;}),'',`${report.normalSolved}/${report.normalTotal} normal, ${report.specialSolved}/${report.specialTotal} özel bölüm fizik doğrulamasından geçti.`].join('\n'));
if(report.normalSolved!==140||report.specialSolved!==15)process.exitCode=1;
