import type {Level,Color} from './levels.ts';
import type {PlanAction} from './advanced-types.ts';
import {linkedAngles} from './links.ts';

type Recipe={title:string;sources:string[];linked?:boolean;split?:number;budget?:boolean;rhythm?:boolean;serial?:boolean};
/** Three puzzles explore an idea, then the physical task changes. */
const recipes:Recipe[]=[
  {title:'Açık geçitler',sources:['c1','c2','c15']},
  {title:'Tek çıkış, iki sıra',sources:['c3','c9','c10']},
  {title:'Katlar ve başlangıç cepleri',sources:['c5','c8','c7']},
  {title:'Anahtarın açtığı yol',sources:['c24','c25','c30']},
  {title:'Renk değiştiren yol',sources:['c27','c33','c35']},
  {title:'Yan çıkış ve tek yön',sources:['c23','c34','c28']},
  {title:'Hareketli engelin ritmi',sources:['c29','c36','c38']},
  {title:'Birbirini çeviren halkalar',sources:['c1','c5','c3'],linked:true},
  {title:'Bir top, iki teslim',sources:['c4','c22','c27'],split:1},
  {title:'Her hareket bir karar',sources:['c2','c6','c13'],budget:true},
  {title:'Üç rengin teslim sırası',sources:['m11','m12','m13']},
  {title:'Anahtardan sonra dalgalar',sources:['c37','m21','m22']},
  {title:'İki çıkışın dengesi',sources:['m41','c23','c34'],linked:true,budget:true},
  {title:'Kilit zinciri',sources:['c25','c30','c37'],linked:true,budget:true},
  {title:'Üç rengin bağlı çarkları',sources:['c31','c36','c39'],linked:true,budget:true},
  {title:'Farklı katlardan toplu akış',sources:['c19','c20','c37'],budget:true},
  {title:'Zikzak teslim sırası',sources:['m49','m50','m51']},
  {title:'Bölünme ve renk sırası',sources:['m81','m82','m83']},
  {title:'Ters oranlı çarklar',sources:['m61','m62','m63']},
  {title:'Dönüşen topun iki kopyası',sources:['c33','c35','c39'],split:1,budget:true},
  {title:'Dalgalar arasında zamanlama',sources:['c13','c14','c20'],rhythm:true,budget:true},
  {title:'İki aşamalı renk dönüşümü',sources:['m66','m67','m68']},
  {title:'Dönen anahtarı yakala',sources:['m76','m77','m78']},
  {title:'Üç koridor, üç teslim',sources:['c31','c33','c36'],serial:true,budget:true},
  {title:'Çoklu topları böl ve sırala',sources:['c7','c12','c19'],split:1,budget:true},
  {title:'Ritimli bölünme',sources:['m86','m87','m88']},
  {title:'Bağlı üç renkli akış',sources:['m14','m15','m16'],linked:true,split:1,budget:true},
  {title:'İki ayrı bölücü',sources:['c31','c33','c36'],linked:true,serial:true,split:2,budget:true},
  {title:'Çok katlı son dalga',sources:['c19','c20','c37'],linked:true,split:1,rhythm:true,budget:true},
  {title:'Rengi geri kazan',sources:['m71','m72','m73']},
  {title:'Anahtarlı dar koridorlar',sources:['c38','c39','c40'],serial:true,budget:true},
  {title:'Dönüşüm ve zamanlama',sources:['m91','m92','m93']},
  {title:'İki bölücü, bağlı kilitler',sources:['m97','m98','m99']},
  {title:'Büyük final',sources:['m100']},
];
const clone=(level:Level):Level=>JSON.parse(JSON.stringify(level));
const normalize=(angle:number)=>(angle%360+360)%360;
const different=(a:number,b:number)=>Math.abs(((a-b+540)%360)-180)>.01;
const finalColor=(l:Level,color:Color)=>(l.colorGates??[]).reduce((current,gate)=>current===gate.from?gate.to:current,color);

/** Drivers are aligned before followers, including locked rings that must wait for a key. */
function ringOrder(l:Level):number[]{
  const pending=new Set(l.rings.map((_,i)=>i)),order:number[]=[];
  while(pending.size){const next=[...pending].find(i=>!(l.links??[]).some(link=>link.follower===i&&pending.has(link.driver)));
    if(next===undefined)throw new Error('Cyclic ring recipe');pending.delete(next);order.push(next);}
  return order;
}
export function certifyPlan(l:Level,steps:NonNullable<Level['sequence']>){
  const plan:PlanAction[]=[],sequence:NonNullable<Level['sequence']>=[];let pose=l.rings.map(r=>normalize(r.initial));
  for(const [index,step] of steps.entries()){
    for(const ring of ringOrder(l))if(different(pose[ring],step.angles[ring])){
      plan.push({ring,to:normalize(step.angles[ring])});pose=linkedAngles(l,pose,ring,step.angles[ring]);
    }
    plan.push({play:index===0,waitFor:step.waitFor});sequence.push({angles:[...pose],waitFor:step.waitFor});
  }
  l.plan=plan;l.sequence=sequence;l.solution=[...sequence[0].angles];
}

export function arrangeCampaign(classic:Level[],seeds:Level[]):Level[]{
  const levels:Level[]=[];
  recipes.forEach((recipe,group)=>recipe.sources.forEach((source,variant)=>{
    const stage=levels.length+1,from=source[0]==='c'?classic[Number(source.slice(1))-1]:seeds[Number(source.slice(1))-1],l=clone(from);
    l.id=40+stage;l.mastery=stage;l.chapter=group+1;l.idea={id:`idea-${group+1}`,title:recipe.title};
    l.name=`${recipe.title} · ${['Keşfet','Dengele','Birleştir'][variant]??'Final'}`;
    l.reward=30+Math.floor((stage-1)/10)*5;l.rotationStep=from.rotationStep??15;
    // Keep stage 50/100 certificates stable; other families receive their own
    // wall thickness and ball placement, in addition to the different tasks.
    if(stage!==50&&stage!==100){l.rings.forEach(ring=>ring.width+=.4+variant*.15);l.balls.forEach(ball=>ball.y-=4+variant*2);}
    const steps=cloneSteps(l.sequence??[{angles:l.solution,waitFor:'all'}]);
    if(recipe.serial){
      const last=l.rings.length-1;l.rotationStep=5;l.rings[last].gaps=[{angle:95,size:20}];
      const colors=l.balls.map(ball=>ball.color),order=variant%2?[...colors].reverse():colors;
      const three=colors.length===3,targets=three?[15,-5,-25]:[20,0,-10,-30];
      steps.splice(0,steps.length,...order.map(color=>({angles:l.solution.map((angle,i)=>i===last?normalize(targets[colors.indexOf(color)]):angle),waitFor:color})));
    }
    if(recipe.linked&&!l.links?.length){
      const locked=l.locks?.find(lock=>lock.kind==='ring'),driver=locked?.ring??0,follower=driver===0?l.rings.length-1:0;
      l.links=[{driver,follower,ratio:[-1,.5,-.5][variant]}];l.rotationStep=5;
    }
    if(recipe.split){
      const colors=[...new Set(l.balls.map(ball=>finalColor(l,ball.color)))],targets=recipe.split===2?[colors[0],colors.at(-1)!]:[colors[0]];
      l.splitters=targets.map((color,i)=>{const cup=l.cups.find(cup=>cup.color===color)!;return {id:`split-${i}`,x:cup.x+Math.sign(270-cup.x)*Math.min(40,cup.width*.2),y:600,color,radius:36,outlets:[{x:-16,y:18},{x:16,y:18}]};});
    }
    if(recipe.rhythm)l.obstacles=[{id:'beat',x:270,y:565,axis:'x',amplitude:16+variant*4,period:3.8+variant*.4,phase:.25,radius:7}];
    l.goals={};for(const ball of l.balls){const color=finalColor(l,ball.color);l.goals[color]=(l.goals[color]??0)+1;}
    for(const splitter of l.splitters??[]){const count=l.balls.filter(ball=>finalColor(l,ball.color)===splitter.color).length;l.goals[splitter.color]=(l.goals[splitter.color]??0)+count;}
    if(!l.rules)l.rules={};
    const deliveries=steps.filter(step=>!step.waitFor.startsWith('key:')&&step.waitFor!=='all');
    if(deliveries.length)l.rules.deliveryOrder=deliveries.flatMap(step=>Array.from({length:l.goals![finalColor(l,step.waitFor as Color)]??1},()=>finalColor(l,step.waitFor as Color)));
    if(l.keys?.length)l.rules.requiredKeys=l.keys.map(key=>key.id);
    // Existing expert plans include a key phase and proportional displacements.
    // New links need a fresh driver/follower plan; unmodified seed plans stay exact.
    if(!from.plan||recipe.linked||recipe.serial)certifyPlan(l,steps);
    l.targetMoves=l.plan!.filter(action=>action.ring!==undefined).length;
    l.stars={three:l.targetMoves,two:l.targetMoves+Math.max(2,Math.ceil(l.targetMoves/2))};l.perfect={moves:l.targetMoves,bonus:15+Math.floor(stage/25)*5};
    if(recipe.budget||l.rules.maxMoves!==undefined){l.rules.maxMoves=l.targetMoves+(stage>=76?1:2);l.ringLimits=l.rings.map((_,i)=>l.plan!.filter(action=>action.ring===i).length+1);}
    const intro=recipe.serial?'Renkleri sırayla teslim et.':recipe.split?'×2 geçidinde çoğalan topları da teslim et.':recipe.linked?'Bağlı halka da hareket eder; birlikte hizala.':recipe.budget?'Hareket bütçeni dikkatli kullan.':from.lesson;
    l.lesson=intro;levels.push(l);
  }));
  return levels;
}
function cloneSteps(steps:NonNullable<Level['sequence']>):NonNullable<Level['sequence']>{return JSON.parse(JSON.stringify(steps));}
