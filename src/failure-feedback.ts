import {COLORS} from './levels.ts';
import type {PhysicsWorld} from './physics.ts';
export function failureFeedback(world:PhysicsWorld|null,constrained=false){
 if(world?.violation)return world.violation;
 const wrong=world?.runs.find(run=>run.outcome==='wrong-cup');
 if(wrong?.cup)return `${COLORS[wrong.color].name} top ${COLORS[wrong.cup].name.toLocaleLowerCase('tr')} kovaya düştü. Kendi renkli kovasına yönlendir.`;
 if(world?.runs.some(run=>run.outcome==='missed'))return 'Top kovaların dışına düştü. Çıkış yolunu kovaya hizala.';
 return constrained?'Hamle veya görev koşulunu koruyarak yeniden dene.':'Geçitleri yeniden hizalayıp tekrar dene.';
}
