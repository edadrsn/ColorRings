import {validateSolution,validatePlanFromSession,verifiedSettlingWait} from './solutions.ts';
import {angularDistance} from './levels.ts';
import type {RingSession} from './engine.ts';
export type VerifiedHint={action:'align'|'wait'|'restart'|'play';angles:number[];ring?:number;title:string;message:string;verified:true};
export function getVerifiedHint(session:RingSession):VerifiedHint|null{
  if(!session.canEdit)return null;
  const level=session.level;
  const pristine=validateSolution(level);if(!pristine.success)return null;
  let angles=pristine.steps[0]?.angles??level.solution;
  if(level.plan){const continuation=validatePlanFromSession(session);if(continuation.check.success&&continuation.directive){const d=continuation.directive;return {...d,verified:true,title:d.action==='wait'?'Sıradaki teslimi bekle':d.action==='play'?'Akışı başlat':'Sıradaki hamle',message:'Kalan hareket bütçesi, bağlı halkalar ve fizik birlikte doğrulandı.'};}if(verifiedSettlingWait(session))return {action:'wait',angles:[...session.angles],verified:true,title:'Topların yerleşmesini bekle',message:'Bu konumdan kısa bir bekleyiş sonrası geçerli devam yolu gerçek fizikle doğrulandı.'};return {action:'restart',angles,verified:true,title:'Yeni bir deneme',message:'Kalan bütçeyle bu konumdan doğrulanmış devam yok.'};}
  if(session.phase==='running'&&session.world){
    const continuation=validateSolution(level,session.world.clone());
    if(!continuation.success)return {action:'restart',angles:[...angles],verified:true,title:'Güvenli bir başlangıç',message:'Bu konumdan doğrulanmış devam bulunamadı. Baştan doğrulanmış düzene dönüp yeniden deneyebilirsin.'};
    angles=continuation.steps[0]?.angles??angles;
    const waiting=angles.every((angle,i)=>angularDistance(angle,session.angles[i])<.01);
    return {action:waiting?'wait':'align',angles:[...angles],verified:true,title:waiting?'Yol açık':'Sıradaki geçit',message:waiting?'Bu düzen doğrulandı. Sıradaki rengin kovaya ulaşmasını bekle.':'Bekleyen top için doğrulanmış bir sonraki geçidi açabilirsin.'};
  }
  const aligned=angles.every((angle,i)=>angularDistance(angle,session.angles[i])<.01);
  return {action:aligned?'play':'align',angles:[...angles],verified:true,title:aligned?'Hazırsın':'Doğrulanmış yol',message:aligned?'Halkalar doğrulanmış ilk konumda. Play ile topları bırak.':level.sequence?'İlk dalganın yolunu aç. Diğer renk cepte kalacak; teslimden sonra tekrar ipucu alabilirsin.':'Halkaları doğrulanmış geçitlere hizalayarak bu yolu deneyebilirsin.'};
}
