import type {Level,Color} from './levels.ts';
import type {PlanAction} from './advanced-types.ts';
import {linkedAngles} from './links.ts';
import {arrangeCampaign} from './campaign-variety.ts';

const copy=(level:Level):Level=>JSON.parse(JSON.stringify(level));
const norm=(angle:number)=>(angle%360+360)%360;
const names=['Temel akış','Üç renkli sıra','Anahtarlı katlar','Renk ve yön','İki çıkış','Bağlı çarklar','Ters dişliler','Çifte akış','Birleşen mekanikler','Ustalık finali'];
/** Deterministic authored families. Every plan is independently replayed in tests. */
export function createMastery(original:Level[]):Level[]{
  const seeds=Array.from({length:100},(_,index)=>{
    const stage=index+1,v=index%10,band=Math.floor(index/10);
    const l=copy(original[stage<=10?0:stage<=20?30:31]);
    l.id=40+stage;l.mastery=stage;l.chapter=9+Math.floor(index/5);l.name=`${names[band]} ${v+1}`;l.reward=30+Math.floor(index/10)*5;l.rotationStep=stage<=10?15:5;
    delete l.perfect;delete l.sequence;delete l.keys;delete l.locks;delete l.colorGates;delete l.oneWays;delete l.obstacles;delete l.exits;delete l.goals;
    if(stage<=10){
      l.rings[0].radius=126-(v%4)*2;l.rings[0].gaps=[{angle:90,size:70+(v%3)*4}];l.rings[1].gaps=[{angle:90,size:54+(v%4)*2}];
      l.rings.forEach((ring,i)=>{ring.initial=norm([270,105][i]+(v%3)*15);ring.baffles=ring.baffles?.slice(0,4+v%3);});
      l.balls=[{color:'pink',x:188-v,y:248},{color:'blue',x:352+v,y:248}];
      if(v>=5)l.balls.push({color:'pink',x:188-v,y:280},{color:'blue',x:352+v,y:280});
    }else{
      l.rings.forEach((ring,i)=>{ring.radius+=i===l.rings.length-1?0:(v%3)-1;if(i!==l.rings.length-1)ring.width=10+band%2;ring.gaps=[{angle:i===l.rings.length-1?95:90,size:i===l.rings.length-1?18+(v%2)*2:140+(v%3)*2}];ring.baffles=[{angle:230+(v%4)*5+band*2,length:2+v%3,side:'inward',width:7}];ring.initial=norm([135,195,150,180][i]+(v%3)*5);});
      l.balls.forEach((ball,i)=>ball.y=268+(v%3)*2+(i%2)*.2);
    }
    const last=l.rings.length-1;
    if(stage>=21&&stage<=30){l.keys=[{id:'stage-key',lock:'stage-door',x:l.balls[1].x,y:l.balls[1].y+22}];l.locks=[{id:'stage-door',ring:last,kind:'gate',gap:0}];}
    if(stage>=31){const from=l.balls.length===3?'yellow':'green',to=l.balls.length===3?'purple':'yellow';l.colorGates=[{id:'spectrum',ring:last,angle:95,size:24,from,to}];l.cups.find(cup=>cup.color===from)!.color=to;l.oneWays=[{ring:Math.max(0,last-1),gap:0,direction:'outward'}];}
    if(stage>=41){l.rings[last].gaps.push({angle:275,size:18+(v%3)*2});l.exits=[{x:175,y:493,color:l.cups[0].color},{x:365,y:493,color:l.cups.at(-1)!.color}];}
    if(stage>=51){l.links=[{driver:last,follower:1,ratio:[-.5,.5,-1,1][(v+Math.floor((stage-51)/10))%4]}];if(stage>=76)l.links.push({driver:0,follower:2,ratio:v%2?-.5:.5});}
    if(stage>=66&&stage<=75||stage>=91){l.colorGates![0].from='yellow';l.colorGates![0].to='green';l.colorGates!.unshift({id:'first-spectrum',ring:0,angle:90,size:144,from:'green',to:'yellow'});l.cups[1].color='green';}
    const preKey=stage>=76;
    if(preKey){
      const desired={x:l.balls[1].x,y:l.balls[1].y+22},a=-30*Math.PI/180,dx=desired.x-270,dy=desired.y-280;
      l.keys=[{id:'gear-key',lock:'gear-lock',ring:1,x:270+dx*Math.cos(a)-dy*Math.sin(a),y:280+dx*Math.sin(a)+dy*Math.cos(a)}];
      l.locks=[{id:'gear-lock',ring:last,kind:'ring'}];
    }
    if(stage>=81)l.splitters=[{id:'double-pink',x:150,y:575,color:'pink',radius:18,outlets:[{x:-16,y:18},{x:16,y:18}]}];
    if(stage>=96)l.splitters!.push({id:'double-blue',x:390,y:575,color:'blue',radius:18,outlets:[{x:-16,y:18},{x:16,y:18}]});
    if(stage>=86)l.obstacles=[{id:'clock',x:270,y:552,axis:'x',amplitude:7+v%3,period:4+v*.1,phase:v/10,radius:5}];
    const hardOrders:Color[][]=[['blue','pink','purple','green'],['pink','blue','green','purple'],['purple','blue','pink','green'],['green','pink','blue','purple']];
    const sourceOrder:Color[]=stage<=10?[]:stage<=20?(v%2?['pink','yellow','blue']:['blue','yellow','pink']):stage<41?(v%2?['pink','green','purple','blue']:['blue','purple','green','pink']):hardOrders[v%4];
    const exitAngle:Partial<Record<Color,number>>=stage<=20?{pink:15,yellow:-5,blue:-25}:{pink:20,green:0,purple:-10,blue:-30};
    const finalColor=(color:Color)=>(l.colorGates??[]).reduce((current,gate)=>gate.from===current?gate.to:current,color);
    l.goals={};for(const ball of l.balls){const color=finalColor(ball.color);l.goals[color]=(l.goals[color]??0)+1;}
    for(const splitter of l.splitters??[]){const color=finalColor(splitter.color);l.goals[color]=(l.goals[color]??0)+1;}
    l.rules={requiredKeys:l.keys?.map(key=>key.id),deliveryOrder:sourceOrder.flatMap(source=>Array.from({length:l.goals![finalColor(source)]??1},()=>finalColor(source)))};
    const actions:PlanAction[]=[],checkpoints:NonNullable<Level['sequence']>=[];let pose=l.rings.map(r=>r.initial);
    const move=(ring:number,to:number)=>{to=norm(to);if(Math.abs(((pose[ring]-to+540)%360)-180)<.01)return;actions.push({ring,to});pose=linkedAngles(l,pose,ring,to);};
    const wait=(waitFor:NonNullable<PlanAction['waitFor']>,play=false)=>{actions.push({play,waitFor});checkpoints.push({angles:[...pose],waitFor});};
    if(preKey){move(1,30);wait('key:gear-key',true);}
    move(last,stage<=10?0:exitAngle[sourceOrder[0]]!);for(let i=0;i<last;i++)move(i,0);
    if(stage<=10)wait('all',true);else {wait(sourceOrder[0],!preKey);for(const color of sourceOrder.slice(1)){move(last,exitAngle[color]!);wait(color);}}
    l.plan=actions;l.sequence=checkpoints;l.solution=[...checkpoints[0].angles];
    l.targetMoves=actions.filter(action=>action.ring!==undefined).length;l.stars={three:l.targetMoves,two:l.targetMoves+Math.max(2,Math.ceil(l.targetMoves/2))};l.perfect={moves:l.targetMoves,bonus:15+Math.floor(stage/25)*5};
    if(stage>=41){l.rules.maxMoves=l.targetMoves+(stage>=76?1:2);l.ringLimits=l.rings.map((_,i)=>actions.filter(action=>action.ring===i).length+1);}
    const colorNames:Record<Color,string>={pink:'pembe',blue:'mavi',yellow:'sarı',green:'yeşil',purple:'mor'};
    l.lesson=stage<=10?`${l.balls.length} topu doğru kovaya ulaştır.`:`Önce ${colorNames[finalColor(sourceOrder[0])]}; ${sourceOrder.length} teslim aşaması${l.rules.maxMoves?`, en fazla ${l.rules.maxMoves} hamle`:''}.`;
    return l;
  });
  return arrangeCampaign(original,seeds);
}
