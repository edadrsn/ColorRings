import {writeFileSync,existsSync,readFileSync} from 'node:fs';
process.env.COLOR_RINGS_AUTHORING='1';
const {LEVELS}=await import('../src/levels.ts');
const {RingSession}=await import('../src/engine.ts');
const {PhysicsWorld,simulate}=await import('../src/physics.ts');
const {validateSolution,reachedCondition}=await import('../src/solutions.ts');
const {mazeProfile,mazeDistance,auditLayouts,MIN_MAZE_DISTANCE}=await import('../src/layout-audit.ts');
const clone=l=>JSON.parse(JSON.stringify(l)),norm=a=>(a%360+360)%360,dist=(a,b)=>Math.abs(((a-b+540)%360)-180);
const names=['Çift oda','Basamaklı cepler','Çatal yollar','Üç pencere','İç dişli odalar','Çift geçit','Sarmal cepler','Köprülü odalar','Geniş yan oda'];
const label=l=>l.mastery?`U${String(l.mastery).padStart(3,'0')}`:`K${String(l.id).padStart(2,'0')}`;
function random(seed){return ()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};}
function shuffle(values,rng){return values.map(value=>({value,key:rng()})).sort((a,b)=>a.key-b.key).map(x=>x.value);}
function protectedRoute(l){
  const marks=l.rings.map(()=>Array.from({length:72},()=>({min:Infinity,max:-Infinity})));
  const capture=world=>{for(const ball of world.states){if(ball.done)continue;const dx=ball.x-270,dy=ball.y-280,r=Math.hypot(dx,dy);for(let i=0;i<l.rings.length;i++){if(Math.abs(r-l.rings[i].radius)>58)continue;const a=norm(Math.atan2(dy,dx)*180/Math.PI-world.angles[i]),spread=Math.ceil(Math.asin(Math.min(1,22/Math.max(r,1)))*180/Math.PI/5)+1;for(let d=-spread;d<=spread;d++){const cell=marks[i][(Math.floor(a/5)+d+144)%72];cell.min=Math.min(cell.min,r-22);cell.max=Math.max(cell.max,r+22);}}}};
  if(l.plan){const session=new RingSession();session.selectCustom(l);for(const action of l.plan){if(action.ring!==undefined){if(!session.begin(action.ring)||!session.preview(action.ring,action.to))throw Error('Bad source plan '+l.id);session.commit();}if(action.play&&!session.world){session.play();session.world.onStep=capture;capture(session.world);}if(action.waitFor){for(let k=0;k<1920&&!session.world.finished&&!reachedCondition(session.world,action.waitFor);k++)session.world.step();if(!reachedCondition(session.world,action.waitFor))throw Error('Bad source checkpoint '+l.id);}}}
  else{const steps=l.sequence??[{angles:l.solution,waitFor:'all'}],world=new PhysicsWorld(steps[0].angles,l);world.onStep=capture;capture(world);for(const step of steps){world.setAngles(step.angles);for(let k=0;k<1920&&!world.finished&&!reachedCondition(world,step.waitFor);k++)world.step();}}
  return marks;
}
function branchSafe(mark,radius,b){const min=radius+(b.side==='inward'?-b.length:0)-2,max=radius+(b.side==='outward'?b.length:0)+2,at=Math.floor(norm(b.angle)/5);return [-1,0,1].every(d=>{const cell=mark[(at+d+72)%72];return cell.max<min||cell.min>max;});}
function gapSafe(mark,radius,g,kept){if(kept.some(b=>dist(b.angle,g.angle)<g.size/2+9))return false;for(let a=g.angle-g.size/2-5;a<=g.angle+g.size/2+5;a+=2.5){const cell=mark[Math.floor(norm(a)/5)];if(cell.min<=radius+4&&cell.max>=radius-4)return false;}return true;}
function candidate(source,route,attempt){
  const level=clone(source),rng=random(source.id*7141+attempt*907+3701),motif=(source.id+attempt)%names.length;
  let changes=0;
  level.rings.forEach((ring,index)=>{
    const mark=route[index],kept=(ring.baffles??[]).filter(b=>!branchSafe(mark,ring.radius,b));
    const gaps=ring.gaps.map(g=>({...g}));const windows=[2,1,2,3,1,2,2,1,1][motif];
    const widths=motif===8?[48,60,36]:[24,32,40];
    for(const angle of shuffle(Array.from({length:36},(_,i)=>i*10),rng)){
      if(gaps.length>=source.rings[index].gaps.length+windows)break;
      const minimum=Math.ceil((28+ring.width+6)/ring.radius*180/Math.PI/4)*4;
      const size=Math.max(minimum,widths[Math.floor(rng()*widths.length)]),g={angle,size};if(gaps.some(old=>dist(old.angle,angle)<(old.size+size)/2+12)||!gapSafe(mark,ring.radius,g,kept))continue;gaps.push(g);
    }
    const baffles=kept.map(b=>({...b})),teeth=[3,6,4,2,6,4,5,4,3][motif];
    const inner=index?ring.radius-level.rings[index-1].radius:ring.radius,outer=index+1<level.rings.length?level.rings[index+1].radius-ring.radius:40;
    for(const angle of shuffle(Array.from({length:36},(_,i)=>i*10+5),rng)){
      if(baffles.length>=kept.length+teeth)break;if(gaps.some(g=>dist(g.angle,angle)<g.size/2+9)||baffles.some(b=>dist(b.angle,angle)<17))continue;
      const side=index===level.rings.length-1?'inward':motif===4?'inward':rng()<.5?'inward':'outward';
      const corridor=side==='inward'?inner:outer,maxLength=Math.max(6,Math.min(26,Math.floor(corridor-34))),length=Math.max(6,maxLength-(Math.floor(rng()*3)*4));const b={angle,length,side,width:8};
      if(branchSafe(mark,ring.radius,b))baffles.push(b);
    }
    changes+=Math.abs(gaps.length-source.rings[index].gaps.length)+baffles.filter(b=>!source.rings[index].baffles?.some(o=>o.angle===b.angle&&o.side===b.side&&o.length===b.length)).length;
    ring.gaps=gaps;ring.baffles=baffles;
  });
  let channel='';
  if(attempt>=100){
    const mode=attempt%6;
    if(level.dividers?.every(w=>w.a.x===w.b.x)){
      const sourceWalls=level.dividers,mid=(sourceWalls[0].a.x+sourceWalls.at(-1).a.x)/2;
      level.dividers=sourceWalls.flatMap((wall,j)=>{
        const sign=Math.sign(mid-wall.a.x),offset=mode===0?sign*20:mode===1?-sign*24:mode===2?(j%2?-20:20):mode===3?sign*28:mode===4?18:-18;
        const stagger=(mode===3?j*12:0),points=[wall.a,{x:wall.a.x,y:505+stagger},{x:wall.a.x+offset,y:555+stagger},{x:wall.a.x+(mode===5?-offset:offset),y:610},{x:wall.a.x,y:665},wall.b];
        return points.slice(1).map((point,i)=>({a:points[i],b:point,radius:wall.radius}));
      });
      channel=[' · Boğaz koridoru',' · Yelpaze kanallar',' · Basamaklı iniş',' · Kademeli kapılar',' · Eğik koridor',' · S kanalları'][mode];changes+=6;
    }else if(!level.dividers){
      const spread=[40,48,34,44,38,50][mode],bend=[565,590,550,575,600,555][mode];
      level.dividers=[{a:{x:270,y:290},b:{x:270,y:517},radius:4},...[-1,1].flatMap(side=>{const points=[{x:270,y:517},{x:270+side*spread,y:bend},{x:270+side*(spread-10),y:620},{x:270+side*28,y:652}];return points.slice(1).map((p,i)=>({a:points[i],b:p,radius:4}));})];channel=' · Kırık çatal';changes+=4;
    }
  }
  if(level.keys?.length)level.rules={...level.rules,requiredKeys:level.keys.map(k=>k.id)};
  return {level,motif:names[motif]+channel,changes};
}

const before=auditLayouts(LEVELS);console.log(`BEFORE: ${LEVELS.length} levels, ${before.exactDuplicates} duplicate profiles, ${before.pairs.length} near pairs`);
const checkpoint='layout-authoring.checkpoint.json',chosen=[],profiles=[],records=[];
let resumed=existsSync(checkpoint)?JSON.parse(readFileSync(checkpoint,'utf8')):[];
// A checkpoint is tied to the exact original source snapshot, not only its ID.
if(resumed.some((r,i)=>r.version!==3||r.source!==JSON.stringify(LEVELS[i])))resumed=[];
for(let i=0;i<LEVELS.length;i++){
  const source=LEVELS[i];if(resumed[i]){const r=resumed[i];chosen.push(r.level);profiles.push(mazeProfile(r.level));records.push(r);continue;}
  let accepted=null,profile=mazeProfile(source),nearest=profiles.length?Math.min(...profiles.map(p=>mazeDistance(p,profile))):1;
  if(nearest>=MIN_MAZE_DISTANCE-1e-9)accepted={level:clone(source),motif:'Korunan özgün düzen',revised:false,attempt:0};
  else{
    const route=protectedRoute(source);
    for(let attempt=0;attempt<1500;attempt++){
      const proposed=candidate(source,route,attempt);if(proposed.changes<4)continue;profile=mazeProfile(proposed.level);
      nearest=Math.min(...profiles.map(p=>mazeDistance(p,profile)));if(nearest<MIN_MAZE_DISTANCE-1e-9)continue;
      const check=validateSolution(proposed.level);if(!check.success||simulate(proposed.level.rings.map(r=>r.initial),proposed.level).success)continue;
      accepted={level:proposed.level,motif:proposed.motif,revised:true,attempt};break;
    }
  }
  if(!accepted)throw Error('No sufficiently distinct solvable maze for '+label(source));
  chosen.push(accepted.level);profiles.push(mazeProfile(accepted.level));records.push({...accepted,version:3,source:JSON.stringify(source)});
  writeFileSync(checkpoint,JSON.stringify(records));console.log(`${i+1}/140 ${label(source)} ${accepted.motif} attempt=${accepted.attempt} min=${nearest.toFixed(3)}`);
}
const after=auditLayouts(chosen);if(after.pairs.length||after.exactDuplicates)throw Error('Final uniqueness check failed');
const data=Object.fromEntries(chosen.map((l,i)=>[l.id,{rings:l.rings.map(({gaps,baffles})=>({gaps,baffles})),dividers:l.dividers,motif:records[i].motif,revised:records[i].revised}]));
writeFileSync('src/authored-layouts.ts',`// Generated offline by scripts/author-unique-layouts.mjs. Every layout is certified.\nimport type {Ring,Level} from './levels.ts';\nexport const AUTHORED_LAYOUTS:Record<number,{rings:Pick<Ring,'gaps'|'baffles'>[];dividers?:Level['dividers'];motif:string;revised:boolean}>=${JSON.stringify(data,null,2)};\n`);
const rows=chosen.map((l,i)=>({code:label(l),rings:l.rings.length,revised:records[i].revised,motif:records[i].motif,closest:label(chosen[after.nearest[i].index]),distance:after.nearest[i].distance}));
writeFileSync('layout-audit.json',JSON.stringify({before:{duplicates:before.exactDuplicates,nearPairs:before.pairs.length},after:{duplicates:after.exactDuplicates,nearPairs:after.pairs.length,minDistance:Math.min(...rows.map(r=>r.distance))},changed:rows.filter(r=>r.revised).length,rows},null,2));
console.log(`DONE: ${rows.filter(r=>r.revised).length} layouts revised; 140 profiles unique; min distance ${Math.min(...rows.map(r=>r.distance)).toFixed(3)}`);
