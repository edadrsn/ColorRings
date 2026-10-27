import {createExpansion} from './content.ts';
import {createMastery} from './mastery.ts';
import {varyMazeDepth} from './layout-depth.ts';
import {applyRequestedRedesigns} from './requested-redesigns.ts';
import {applyUniqueLayouts} from './unique-layouts.ts';
import {applyRelayLevels} from './relay-levels.ts';
import type {RingLink,Splitter,WinRules,PlanAction} from './advanced-types.ts';
export type Vec = { x: number; y: number };
export type Color = 'pink' | 'blue' | 'yellow' | 'green' | 'purple';
export type Key={id:string;lock:string;x:number;y:number;ring?:number};
export type Lock={id:string;ring:number;gap?:number;kind:'gate'|'ring'};
export type ColorGate={id:string;ring:number;angle:number;size:number;from:Color;to:Color};
export type OneWay={ring:number;gap:number;direction:'outward'|'inward'};
export type MovingObstacle={id:string;x:number;y:number;axis:'x'|'y';amplitude:number;period:number;phase:number;radius:number};
export type Baffle = { angle:number; length:number; side:'inward'|'outward'; width?:number };
export type Ring = { radius: number; width: number; gaps: { angle: number; size: number }[]; initial: number; baffles?:Baffle[] };
export type Level = { idea?:{id:string;title:string}; links?:RingLink[];splitters?:Splitter[];rules?:WinRules;rotationStep?:number;ringLimits?:number[];plan?:PlanAction[];mastery?:number;targetMoves?:number;id:number; name:string; rings:Ring[]; balls:{color:Color;x:number;y:number}[]; cups:{color:Color;x:number;y:number;width:number}[]; solution:number[]; sequence?:{angles:number[];waitFor:Color|'all'|`key:${string}`}[]; stars:{three:number;two:number}; reward:number; chapter:number; lesson:string;perfect?:{moves:number;bonus:number};keys?:Key[];locks?:Lock[];colorGates?:ColorGate[];oneWays?:OneWay[];obstacles?:MovingObstacle[];dividers?:{a:Vec;b:Vec;radius:number}[];exits?:{x:number;y:number;color:Color}[];goals?:Partial<Record<Color,number>>;challenge?:{maxMoves:number;noHints?:boolean;ringLimit?:number} };
export const COLORS = {
  pink: { hex: 0xf15db3, css: '#f15db3', name: 'Pembe', symbol: '●' },
  blue: { hex: 0x42b6f5, css: '#42b6f5', name: 'Mavi', symbol: '✦' },
  yellow: {hex:0xe8b933,css:'#e8b933',name:'Sarı',symbol:'▲'},
  green: {hex:0x40ba86,css:'#40ba86',name:'Yeşil',symbol:'■'},
  purple: {hex:0x9c72de,css:'#9c72de',name:'Mor',symbol:'◆'},
};
export const BOARD = { width: 540, height: 790, center: { x: 270, y: 280 } };
export const LEVEL:Level = {
  id: 1, name: 'İlk dönüş',
  stars:{three:8,two:16},reward:25,chapter:1,lesson:'İki halkayı bağımsız döndür.',
  rings: [
    { radius: 126, width: 13, gaps: [{ angle: 90, size: 70 }, { angle: 265, size: 28 }], initial: -90,
      baffles:[0,40,140,180,220,315].map(angle=>({angle,length:24,side:'outward' as const,width:11})) },
    { radius: 213, width: 14, gaps: [{ angle: 90, size: 54 }, { angle: 240, size: 26 }], initial: 105,
      baffles:[0,35,145,180,205,280,315].map(angle=>({angle,length:18,side:'inward' as const,width:11})) },
  ] as Ring[],
  balls: [
    { color: 'pink' as Color, x: 188, y: 248 },
    { color: 'blue' as Color, x: 352, y: 248 },
  ],
  cups: [
    { color: 'pink' as Color, x: 180, y: 682, width: 164 },
    { color: 'blue' as Color, x: 360, y: 682, width: 164 },
  ],
  solution:[0,0],
};
export const LEVELS:Level[]=[LEVEL,{
  id:2,name:'Dar geçitler',
  stars:{three:10,two:20},reward:25,chapter:1,lesson:'Daha dar açıklıkları hizala.',
  rings:[
    {radius:126,width:13,gaps:[{angle:135,size:50},{angle:300,size:24}],initial:75,
      baffles:[0,45,90,180,225,265,335].map(angle=>({angle,length:26,side:'outward' as const,width:11}))},
    {radius:213,width:14,gaps:[{angle:45,size:38},{angle:220,size:24}],initial:195,
      baffles:[0,90,135,180,260,300,335].map(angle=>({angle,length:18,side:'inward' as const,width:11}))},
  ],
  balls:[{color:'pink',x:188,y:225},{color:'blue',x:352,y:225}],
  cups:LEVEL.cups,
  solution:[315,45],
},{
  id:3,name:'Sıralı kaçış',
  stars:{three:8,two:16},reward:30,chapter:1,lesson:'Bir rengi beklet, diğerini bırak.',
  rings:[
    {radius:126,width:13,gaps:[{angle:90,size:70},{angle:265,size:28}],initial:270,
      baffles:[0,40,140,180,220,315].map(angle=>({angle,length:24,side:'outward' as const,width:11}))},
    {radius:213,width:14,gaps:[{angle:90,size:20}],initial:90,
      baffles:[0,55,125,180,225,305].map(angle=>({angle,length:22,side:'inward' as const,width:11}))},
  ],
  balls:LEVEL.balls,
  cups:[{color:'pink',x:145,y:682,width:190},{color:'blue',x:395,y:682,width:190}],
  // This is the first release position, not a static win. The second release
  // is a different physical orientation after the first marble is safely home.
  solution:[0,15],
  sequence:[{angles:[0,15],waitFor:'pink'},{angles:[0,345],waitFor:'blue'}],
}];
export const radians = (degrees: number) => degrees * Math.PI / 180;
export const normalize = (degrees: number) => ((degrees % 360) + 360) % 360;
export const angularDistance = (a: number, b: number) => Math.abs(((a-b+540)%360)-180);

// Each layout is authored in its solved posture, then the individual rings are
// rotated into a starting puzzle. Different profiles change actual geometry,
// starting layers, ball counts and release order, not just the starting angles.
type Profile={name:string;radii:number[];gaps:number[];offsets:number[];initial:number[];teeth:number;length:number;balls:'pair'|'four'|'layered'|'six';sequence?:boolean;blueFirst?:boolean;lesson:string};
const profiles:Profile[]=[
  {name:'Geniş cepler',radii:[116,213],gaps:[76,58],offsets:[0,30],initial:[210,165],teeth:5,length:22,balls:'pair',lesson:'Geniş ceplerin arasından yol kur.'},
  {name:'Üçüncü kat',radii:[80,146,213],gaps:[92,72,58],offsets:[0,45,0],initial:[270,150,105],teeth:4,length:10,balls:'pair',lesson:'Yeni halka: önce iç, sonra orta, sonra dış geçit.'},
  {name:'Spiral durak',radii:[86,150,213],gaps:[86,68,50],offsets:[30,-30,45],initial:[165,195,135],teeth:6,length:10,balls:'pair',lesson:'Cepler topları katlar arasında bekletir.'},
  {name:'Çift damla',radii:[82,147,213],gaps:[92,76,60],offsets:[0,60,-30],initial:[180,90,210],teeth:4,length:8,balls:'four',lesson:'Yeni akış: her renkten iki top.'},
  {name:'Dış kuşak',radii:[82,150,213],gaps:[94,70,56],offsets:[45,0,-45],initial:[135,225,165],teeth:5,length:9,balls:'layered',lesson:'Toplar farklı katlardan yola çıkar.'},
  {name:'Tek pencere',radii:[116,213],gaps:[76,20],offsets:[-30,45],initial:[150,225],teeth:6,length:18,balls:'pair',sequence:true,lesson:'Dar çıkışı iki ayrı konumda kullan.'},
  {name:'Önce mavi',radii:[122,213],gaps:[80,20],offsets:[45,-45],initial:[135,120],teeth:7,length:18,balls:'pair',sequence:true,blueFirst:true,lesson:'Bu kez mavi tarafı önce açmayı dene.'},
  {name:'Kat kat sabır',radii:[84,149,213],gaps:[92,72,20],offsets:[30,-30,60],initial:[150,210,135],teeth:4,length:8,balls:'pair',sequence:true,lesson:'Üç katın sonunda tek ortak çıkış.'},
  {name:'Cep örgüsü',radii:[88,153,213],gaps:[88,64,48],offsets:[-45,45,0],initial:[195,165,210],teeth:7,length:10,balls:'four',lesson:'Dört topu dar ceplerden geçir.'},
  {name:'İki dalga',radii:[82,148,213],gaps:[94,76,20],offsets:[0,-60,30],initial:[270,195,150],teeth:4,length:8,balls:'four',sequence:true,lesson:'Önce bir rengin iki topunu da teslim et.'},
  {name:'Ters dalga',radii:[86,151,213],gaps:[90,70,20],offsets:[-30,30,-60],initial:[210,135,195],teeth:5,length:8,balls:'four',sequence:true,blueFirst:true,lesson:'Ceplerde bekleyen ikinci dalgayı hazırla.'},
  {name:'Dördüncü halka',radii:[64,112,162,213],gaps:[112,90,72,60],offsets:[0,30,-30,45],initial:[240,180,150,135],teeth:3,length:3,balls:'pair',lesson:'Yeni halka: dört ayrı kat.'},
  {name:'İnce koridor',radii:[66,115,164,213],gaps:[108,84,66,48],offsets:[30,-30,60,0],initial:[150,225,135,195],teeth:4,length:3,balls:'pair',lesson:'Daralan koridorları tek tek hizala.'},
  {name:'Dört top dört kat',radii:[64,113,163,213],gaps:[114,94,76,62],offsets:[-45,45,0,30],initial:[195,135,240,180],teeth:3,length:2,balls:'four',lesson:'Dört halka ve dört topun zincirini kur.'},
  {name:'Derin bekleyiş',radii:[65,114,164,213],gaps:[114,92,76,20],offsets:[30,0,-30,60],initial:[210,270,165,150],teeth:3,length:2,balls:'pair',sequence:true,lesson:'Dört katın çıkışında bir topu beklet.'},
  {name:'Kuşaklar arası',radii:[64,112,162,213],gaps:[116,96,80,64],offsets:[0,45,-45,30],initial:[270,165,195,135],teeth:3,length:2,balls:'six',lesson:'Yeni birleşim: farklı katlarda altı top.'},
  {name:'Büyük akış',radii:[64,112,162,213],gaps:[116,96,80,22],offsets:[30,-30,45,-45],initial:[210,195,150,135],teeth:3,length:2,balls:'four',sequence:true,blueFirst:true,lesson:'Dört katı ve iki teslim dalgasını birlikte yönet.'},
];
function buildProfile(profile:Profile,id:number):Level{
  const count=profile.radii.length;
  const rings:Ring[]=profile.radii.map((radius,i)=>{
    const gap=90+profile.offsets[i],size=profile.gaps[i];
    const baffles:Baffle[]=[];
    for(let tooth=0;tooth<profile.teeth;tooth++){
      const angle=(tooth*360/profile.teeth+profile.offsets[i]+8*(i%2)+360)%360;
      // Preserve real doors: do not plant a pocket wall inside an opening.
      const distance=Math.abs(((angle-gap+540)%360)-180);
      if(distance>size/2+12)baffles.push({angle,length:profile.length,side:i===count-1?'inward':'outward',width:10});
    }
    return {radius,width:i===count-1?14:12,gaps:[{angle:gap,size}],initial:profile.initial[i],baffles};
  });
  const innermost=profile.radii[0],small=innermost<72;
  const x=small?24:innermost<100?38:76;
  const balls:Level['balls']=[{color:'pink',x:270-x,y:small?250:242},{color:'blue',x:270+x,y:small?250:242}];
  if(profile.balls==='four'||profile.balls==='six')balls.push({color:'pink',x:270-x,y:small?282:274},{color:'blue',x:270+x,y:small?282:274});
  if(profile.balls==='layered'){
    // One ball starts in the annular corridor, not in the central chamber.
    balls[1]={color:'blue',x:385,y:280};
  }
  if(profile.balls==='six')balls.push({color:'pink',x:182,y:265},{color:'blue',x:358,y:265});
  const solution=profile.offsets.map(offset=>(360-offset)%360);
  const sequence=profile.sequence?[
    {angles:solution.map((angle,i)=>i===count-1?(angle+(profile.blueFirst?-15:15)+360)%360:angle),waitFor:profile.blueFirst?'blue' as const:'pink' as const},
    {angles:solution.map((angle,i)=>i===count-1?(angle+(profile.blueFirst?15:-15)+360)%360:angle),waitFor:profile.blueFirst?'pink' as const:'blue' as const},
  ]:undefined;
  return {id,name:profile.name,rings,balls,cups:profile.sequence?[{color:'pink',x:145,y:682,width:190},{color:'blue',x:395,y:682,width:190}]:LEVEL.cups,
    solution:sequence?sequence[0].angles:solution,sequence,stars:{three:count*2+(sequence?3:1)+(balls.length>2?2:0),two:count*4+(sequence?6:3)+(balls.length>2?4:0)},reward:25+Math.floor((id-1)/5)*5,chapter:Math.floor((id-1)/5)+1,lesson:profile.lesson};
}
profiles.forEach((profile,index)=>LEVELS.push(buildProfile(profile,index+4)));
LEVELS.push(...createExpansion(LEVELS));
LEVELS.forEach(level=>{level.perfect??={moves:level.stars.three,bonus:10};});
LEVELS.push(...createMastery(LEVELS));
varyMazeDepth(LEVELS);
applyRequestedRedesigns(LEVELS);
// Live starts physics before planning. Preserve its five independently tested
// launch layouts when editing the separate puzzle campaign geometry.
export const LIVE_LAYOUT_SEEDS:Level[]=[0,4,21,25,27].map(index=>JSON.parse(JSON.stringify(LEVELS[index])));
applyUniqueLayouts(LEVELS);
applyRelayLevels(LEVELS);



