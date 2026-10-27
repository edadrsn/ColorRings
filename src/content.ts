import type {Level,Color} from './levels.ts';
const copy=(level:Level):Level=>JSON.parse(JSON.stringify(level));
/** Authored lane geometry supplements the original radial puzzles for 3/4 colors. */
function lanes(id:number,name:string,radii:number[],colors:Color[],widths:number[]):Level{
  const xs=colors.length===3?[160,270,380]:[150,230,310,390];
  const offsets=radii.map((_,i)=>[0,30,-30,45][i]);
  const level:Level={id,name,chapter:Math.floor((id-1)/5)+1,lesson:'Katları hizala; her rengi kendi koridorundan gönder.',reward:40,stars:{three:radii.length*3,two:radii.length*6},
    rings:radii.map((radius,i)=>({radius,width:i===radii.length-1?14:10,gaps:[{angle:90+offsets[i],size:widths[i]}],initial:[135,195,150,225][i],baffles:[{angle:270+offsets[i],length:4,side:'inward',width:8}]})),
    balls:colors.map((color,i)=>({color,x:xs[i],y:270})),cups:colors.map((color,i)=>({color,x:xs[i],y:682,width:colors.length===3?106:78})),
    dividers:xs.slice(1).map((x,i)=>({a:{x:(x+xs[i])/2,y:218},b:{x:(x+xs[i])/2,y:705},radius:3})),
    solution:offsets.map(offset=>(360-offset)%360)};
  return level;
}
export function createExpansion(original:Level[]):Level[]{
  const levels:Level[]=[];
  const pair=(id:number,name:string,base:number)=>{const l=copy(original[base-1]);l.id=id;l.name=name;l.chapter=Math.floor((id-1)/5)+1;l.reward=40;l.perfect={moves:l.stars.three,bonus:15};return l;};
  const add=(level:Level)=>{levels.push(level);return level;};
  const a=add(pair(21,'Üç katın ritmi',5));a.rings[1].gaps[0].size=84;a.rings[0].baffles?.pop();a.lesson='Üç ayrı halkada geçitleri birleştir.';
  add(lanes(22,'Üç renkli akış',[116,213],['pink','yellow','blue'],[116,96]));
  const exits=add(pair(23,'İki ayrı çıkış',4));exits.rings[1].gaps=[{angle:64,size:42},{angle:116,size:42}];exits.solution=[0,0];exits.rings[0].gaps[0].angle=90;exits.exits=[{x:190,y:500,color:'pink'},{x:350,y:500,color:'blue'}];exits.lesson='İki çıkışı iki kovayla eşleştir.';
  const key=add(pair(24,'İlk anahtar',1));key.keys=[{id:'rose-key',lock:'rose-door',x:188,y:272}];key.locks=[{id:'rose-door',ring:0,gap:0,kind:'gate'}];key.lesson='Anahtarı topla; aynı simgeli geçit açılsın.';
  const locked=add(pair(25,'Uyanan halka',1));locked.rings[1].initial=30;locked.keys=[{id:'ring-key',lock:'ring-lock',x:188,y:272}];locked.locks=[{id:'ring-lock',ring:1,kind:'ring'}];locked.sequence=[{angles:[0,30],waitFor:'key:ring-key'},{angles:[0,0],waitFor:'all'}];locked.solution=[0,30];locked.lesson='Anahtar gelene kadar dış halka dönmez.';
  add(lanes(26,'Dört renkli kapılar',[100,213],['pink','green','purple','blue'],[138,116]));
  const color=add(pair(27,'Renk dönüşümü',4));color.colorGates=[{id:'mint',ring:0,angle:90,size:110,from:'pink',to:'green'}];color.cups[0].color='green';color.goals={green:1,blue:1};color.lesson='Pembe top geçitte yeşile dönüşür.';
  const one=add(pair(28,'Tek yön',5));one.oneWays=[{ring:1,gap:0,direction:'outward'}];one.lesson='Okun yönünde geç; geri dönüş kapalı.';
  const moving=add(pair(29,'Sarkaç arası',4));moving.obstacles=[{id:'pendulum',x:160,y:570,axis:'x',amplitude:24,period:3.6,phase:0,radius:10}];moving.lesson='Yavaş engelin ritmini izleyerek çık.';
  const two=add(pair(30,'İki anahtar iki kapı',1));two.keys=[{id:'a',lock:'a-door',x:188,y:272},{id:'b',lock:'b-door',x:352,y:272}];two.locks=[{id:'a-door',ring:0,kind:'gate',gap:0},{id:'b-door',ring:1,kind:'gate',gap:0}];two.lesson='Her anahtar yalnız kendi kapısını açar.';
  const triple=add(lanes(31,'Üç rengin katları',[84,148,213],['pink','yellow','blue'],[138,128,110]));triple.rings[1].baffles?.push({angle:210,length:4,side:'inward',width:7});
  const four=add(lanes(32,'Dört kat dört renk',[64,112,162,213],['pink','green','purple','blue'],[140,138,128,118]));four.lesson='Farklı katlardaki dört rengi aşağı taşı.';
  const recolor=add(lanes(33,'Altın geçit',[116,213],['pink','yellow','blue'],[120,100]));recolor.colorGates=[{id:'violet',ring:0,angle:90,size:120,from:'yellow',to:'purple'}];recolor.cups[1].color='purple';recolor.goals={pink:1,purple:1,blue:1};recolor.lesson='Ortadaki sarı top artık mor kovayı arar.';
  const route=add(pair(34,'Yan yollar',6));route.rings[2].gaps.push({angle:245,size:30});route.exits=[{x:190,y:500,color:'pink'},{x:350,y:500,color:'blue'}];route.lesson='Ek çıkış güvenli yolu değiştirebilir.';
  const mix=add(pair(35,'Anahtarın rengi',4));mix.keys=[{id:'gold-key',lock:'door',x:194,y:266}];mix.locks=[{id:'door',ring:1,gap:0,kind:'gate'}];mix.colorGates=[{id:'yellow',ring:0,angle:90,size:110,from:'pink',to:'yellow'}];mix.cups[0].color='yellow';mix.goals={yellow:1,blue:1};mix.lesson='Kapıyı aç, dönüşen rengin kovasını hatırla.';
  const pulse=add(lanes(36,'Mor sarkaç',[116,213],['pink','purple','blue'],[126,104]));pulse.obstacles=[{id:'pulse',x:270,y:573,axis:'x',amplitude:24,period:4.2,phase:.25,radius:9}];pulse.lesson='Üç akışın ortasında yavaş engeli geç.';
  const queue=add(pair(37,'Kilitli dalgalar',13));queue.keys=[{id:'wave',lock:'wave-door',x:232,y:264}];queue.locks=[{id:'wave-door',ring:1,gap:0,kind:'gate'}];queue.lesson='Anahtardan sonra iki dalgayı sırayla bırak.';
  const arrows=add(lanes(38,'Dört yön tek akış',[64,112,162,213],['pink','green','purple','blue'],[142,140,132,122]));arrows.oneWays=[{ring:2,gap:0,direction:'outward'}];arrows.obstacles=[{id:'drift',x:150,y:576,axis:'y',amplitude:14,period:4.8,phase:.5,radius:7}];arrows.lesson='Dört katı aç; tek yönlü geçidi doğru kullan.';
  const gates=add(lanes(39,'Renkli anahtarlar',[116,213],['pink','yellow','blue'],[124,108]));gates.keys=[{id:'left',lock:'gate-left',x:160,y:294},{id:'right',lock:'gate-right',x:380,y:294}];gates.locks=[{id:'gate-left',ring:0,kind:'gate',gap:0},{id:'gate-right',ring:1,kind:'gate',gap:0}];gates.lesson='İki dış anahtarı toplayıp orta akışı serbest bırak.';
  const final=add(lanes(40,'Akış senfonisi',[64,112,162,213],['pink','green','purple','blue'],[144,142,134,124]));final.keys=[{id:'final-key',lock:'final-door',x:230,y:294}];final.locks=[{id:'final-door',ring:2,kind:'gate',gap:0}];final.oneWays=[{ring:1,gap:0,direction:'outward'}];final.obstacles=[{id:'final-pulse',x:390,y:580,axis:'y',amplitude:15,period:5,phase:0,radius:7}];final.lesson='Dört renk, anahtar, tek yön ve doğru zamanlama.';
  return levels;
}

