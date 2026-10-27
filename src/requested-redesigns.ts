import type {Level,Color,Ring} from './levels.ts';
import {addMazeLayer} from './layout-depth.ts';
import {certifyPlan} from './campaign-variety.ts';
const copy=(l:Level):Level=>JSON.parse(JSON.stringify(l));
function ring(radius:number,angle:number,size:number,initial:number,teeth:number[],length=9):Ring{
  return {radius,width:radius>200?14:11,gaps:[{angle,size}],initial,baffles:teeth.filter(a=>Math.abs(((a-angle+540)%360)-180)>size/2+8).map(a=>({angle:a,length,side:radius>200?'inward':'outward',width:8}))};
}
function clean(l:Level){for(const key of ['plan','sequence','links','splitters','rules','ringLimits','keys','locks','colorGates','oneWays','obstacles','exits','goals'] as const)delete l[key];return l;}
function finish(l:Level,original:Level,name:string,lesson:string,steps:NonNullable<Level['sequence']>):Level{
  l.id=original.id;l.mastery=original.mastery;l.idea=original.idea;l.chapter=original.chapter;l.reward=original.reward;l.name=name;l.lesson=lesson;l.rotationStep=5;
  const final=(c:Color)=>(l.colorGates??[]).reduce((color,gate)=>color===gate.from?gate.to:color,c);
  l.goals={};for(const ball of l.balls){const color=final(ball.color);l.goals[color]=(l.goals[color]??0)+1;}
  for(const splitter of l.splitters??[])l.goals[splitter.color]=(l.goals[splitter.color]??0)+l.balls.filter(b=>final(b.color)===splitter.color).length;
  l.rules??={};if(l.keys?.length)l.rules.requiredKeys=l.keys.map(k=>k.id);
  const phases=steps.filter(s=>s.waitFor!=='all'&&!s.waitFor.startsWith('key:'));if(phases.length)l.rules.deliveryOrder=phases.flatMap(s=>Array.from({length:l.goals![final(s.waitFor as Color)]??1},()=>final(s.waitFor as Color)));
  certifyPlan(l,steps);l.targetMoves=l.plan!.filter(a=>a.ring!==undefined).length;l.stars={three:l.targetMoves,two:l.targetMoves+3};l.perfect={moves:l.targetMoves,bonus:original.perfect?.bonus??15};return l;
}
/** Only the eight specifically requested level IDs are replaced, after all other data is built. */
export function applyRequestedRedesigns(levels:Level[]){
  const originals=levels.map(copy),replace=(index:number,l:Level)=>{levels[index]=l;};

  const k3=clean(copy(originals[4]));k3.rings=[ring(80,60,112,240,[0,180,255],12),ring(146,120,100,165,[0,205,300],10),ring(213,90,40,195,[0,180,230,300],16)];
  k3.rings[2].gaps=[{angle:64,size:42},{angle:116,size:42}];k3.balls=[{color:'pink',x:230,y:247},{color:'blue',x:310,y:247}];k3.cups=[{color:'pink',x:145,y:682,width:190},{color:'blue',x:395,y:682,width:190}];k3.exits=[{x:180,y:493,color:'pink'},{x:360,y:493,color:'blue'}];
  replace(2,finish(k3,originals[2],'Üç kat, iki pencere','Üç geçidi hizala; iki ayrı çıkış iki kovaya açılır.',[{angles:[30,330,0],waitFor:'all'}]));

  const u4=clean(copy(originals[43]));u4.rings=[ring(104,90,116,210,[15,165,240,315],27),ring(213,90,20,120,[0,55,145,205,300],17)];u4.rings[0].gaps.push({angle:260,size:28});u4.balls=[{color:'pink',x:235,y:248},{color:'blue',x:400,y:260}];
  replace(43,finish(u4,originals[43],'Merkez ve dış cep','Pembe merkezde, mavi dış koridorda. Önce pembeyi bırak.',[{angles:[0,15],waitFor:'pink'},{angles:[0,345],waitFor:'blue'}]));

  const u6=addMazeLayer(originals[45]);clean(u6);u6.links=[{driver:1,follower:2,ratio:-1}];u6.rings[1].baffles=[{angle:225,length:8,side:'inward',width:8},{angle:325,length:8,side:'outward',width:8}];
  replace(45,finish(u6,originals[45],'Ters bağlı kapı','Orta halka dış halkayı ters çevirir. Önce maviyi teslim et.',[{angles:[315,0,30],waitFor:'blue'},{angles:[315,0,60],waitFor:'pink'}]));

  const k9=clean(copy(originals[19]));k9.links=[{driver:0,follower:2,ratio:-1}];k9.rings.forEach((r,i)=>{r.baffles=[{angle:210+i*11,length:5,side:'inward',width:7},{angle:285+i*7,length:5,side:'outward',width:7}];});
  replace(8,finish(k9,originals[8],'Dört dişli, iki dalga','Birinci ve üçüncü halka ters bağlı. İki mavi, sonra iki pembe.',[{angles:[330,30,315,30],waitFor:'blue'},{angles:[330,30,315,60],waitFor:'pink'}]));

  const k29=clean(copy(originals[21]));k29.rings=[ring(104,90,144,150,[210,285,340],12),ring(213,120,112,240,[0,190,240,310],14)];k29.obstacles=[{id:'left-beat',x:160,y:568,axis:'x',amplitude:18,period:3.7,phase:0,radius:8},{id:'right-beat',x:405,y:550,axis:'y',amplitude:16,period:4.3,phase:.25,radius:6}];
  replace(28,finish(k29,originals[28],'Üç koridor, iki sarkaç','Yan toplar dış katta, sarı merkezde. İki engelin ritmini izle.',[{angles:[0,330],waitFor:'all'}]));

  const k36=clean(copy(originals[18]));k36.rings.forEach((r,i)=>{r.radius=[70,120,169,213][i];r.baffles=[{angle:215+i*9,length:4,side:'inward',width:7},{angle:305+i*5,length:4,side:'outward',width:7}];});k36.rings[1].gaps.push({angle:260,size:30});k36.rings[3].gaps.push({angle:265,size:32});k36.keys=[{id:'outer-pink',lock:'inner-door',x:182,y:294},{id:'outer-blue',lock:'middle-door',x:358,y:294}];k36.locks=[{id:'inner-door',ring:0,gap:0,kind:'gate'},{id:'middle-door',ring:1,gap:0,kind:'gate'}];k36.oneWays=[{ring:2,gap:0,direction:'outward'}];
  replace(35,finish(k36,originals[35],'Dış ceplerin anahtarları','Dış kattaki iki top anahtarları toplar; içerideki dört top serbest kalır.',[{angles:[0,315,45,330],waitFor:'all'}]));

  const k39=clean(copy(originals[30]));k39.rings=[ring(64,90,146,135,[225,300],3),ring(112,135,144,210,[250,330],3),ring(162,60,132,165,[200,270],4),ring(213,90,116,240,[210,285,345],5)];k39.balls=[{color:'pink',x:135,y:265},{color:'yellow',x:270,y:270},{color:'blue',x:405,y:265}];k39.links=[{driver:0,follower:2,ratio:-.5}];k39.keys=[{id:'orbit-key',lock:'orbit-door',x:135,y:294,ring:3}];k39.locks=[{id:'orbit-door',ring:1,gap:0,kind:'gate'}];k39.colorGates=[{id:'purple-dye',ring:0,angle:90,size:146,from:'yellow',to:'purple'}];k39.cups[1].color='purple';k39.splitters=[{id:'blue-pair',color:'blue',x:380,y:590,radius:28,outlets:[{x:-16,y:18},{x:16,y:18}]}];
  replace(38,finish(k39,originals[38],'Yörünge atölyesi','Dönen anahtarı hizala. Sarı mora dönüşür, mavi ikiye ayrılır.',[{angles:[0,315,30,0],waitFor:'all'}]));

  const k40=clean(copy(originals[39]));k40.rings=[ring(90,90,146,150,[225,300],6),ring(150,135,138,225,[250,330],6),ring(213,95,22,90,[210,300],7)];k40.rings[2].gaps.push({angle:275,size:30});k40.keys=[{id:'final-switch',lock:'final-rotation',x:230,y:294}];k40.locks=[{id:'final-rotation',ring:2,kind:'ring'}];k40.splitters=[{id:'pink-twin',color:'pink',x:150,y:575,radius:22,outlets:[{x:-16,y:18},{x:16,y:18}]},{id:'blue-twin',color:'blue',x:390,y:575,radius:22,outlets:[{x:-16,y:18},{x:16,y:18}]}];k40.obstacles=[{id:'final-clock',x:270,y:552,axis:'x',amplitude:10,period:4.5,phase:0,radius:6}];
  replace(39,finish(k40,originals[39],'Üç katlı final fabrikası','Anahtarı al. Çift bölücüden çıkan altı topu pembe, mavi, yeşil, mor sırasıyla teslim et.',[{angles:[0,315,90],waitFor:'key:final-switch'},{angles:[0,315,20],waitFor:'pink'},{angles:[0,315,330],waitFor:'blue'},{angles:[0,315,0],waitFor:'green'},{angles:[0,315,350],waitFor:'purple'}]));
  k40.rules!.maxMoves=k40.targetMoves!+2;k40.ringLimits=k40.rings.map((_,i)=>k40.plan!.filter(a=>a.ring===i).length+1);
}

