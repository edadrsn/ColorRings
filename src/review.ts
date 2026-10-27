import Phaser from 'phaser';
import {LEVELS,type Level} from './levels.ts';
import {RingsScene} from './scene.ts';
import {objectiveText} from './objectives.ts';
import {zipStore,crc32,type ZipEntry} from './zip-store.ts';
import './review.css';

document.querySelector('#review')!.innerHTML=`<header><h1>Color Rings · Bölüm incelemesi</h1><p>40 Klasik + 100 Ustalık. K01 veya U037 gibi bir numara söylemen yeterli.</p><p class="hint">Görseller, oyundaki aynı Phaser sahnesinin başlangıç düzeninden alınır. Bu sayfa altın, yıldız ve oyuncu kaydını değiştirmez.</p><nav><button id="generate" class="primary" disabled>140 bölümün görsellerini hazırla</button><button id="download" disabled>Tüm PNG'leri ZIP indir</button><a href="/">Oyuna dön</a></nav><p id="status" role="status">Çizim motoru hazırlanıyor…</p><progress id="progress" max="140" value="0"></progress></header><main><h2>Numaralı karşılaştırma sayfaları</h2><div id="sheets"></div><h2>Her bölümün ayrı görseli</h2><div class="filters"><select id="campaign" aria-label="Bölüm yolu"><option value="all">Tüm bölümler</option><option value="K">Klasik · 40</option><option value="U">Ustalık · 100</option></select><input id="search" placeholder="K12, U37 veya bölüm adı" aria-label="Bölüm ara"></div><div id="levels"></div></main><div id="renderer" aria-hidden="true"></div><dialog id="zoom"><img id="zoom-image" alt="Bölüm görseli"><nav><a id="one-download" class="download">PNG indir</a><button id="close">Kapat</button></nav></dialog>`;
const element=<T extends HTMLElement>(id:string)=>document.getElementById(id) as T;
const generate=element<HTMLButtonElement>('generate'),download=element<HTMLButtonElement>('download'),status=element('status');
const entries:ZipEntry[]=[],fullImages=new Map<string,string>();
const captured:{code:string;source:string;crc:number}[]=[];
const knownCodes=new Set(LEVELS.map(l=>l.mastery?`U${String(l.mastery).padStart(3,'0')}`:`K${String(l.id).padStart(2,'0')}`));
const focusCodes=[...new Set((new URLSearchParams(location.search).get('focus')??'').split(',').map(value=>{const m=value.trim().match(/^([ku])0*([0-9]+)$/i);return m?m[1].toUpperCase()+String(Number(m[2])).padStart(m[1].toUpperCase()==='U'?3:2,'0'):'';}).filter(value=>knownCodes.has(value)))].slice(0,12);
function focusCanvas(){const canvas=document.createElement('canvas');canvas.width=1200;canvas.height=70+Math.ceil(focusCodes.length/4)*525;const ctx=canvas.getContext('2d')!;ctx.fillStyle='#e8dfef';ctx.fillRect(0,0,canvas.width,canvas.height);ctx.fillStyle='#59436c';const title='SEÇİLEN BÖLÜMLER · '+focusCodes.join(' / ');let size=28;do{ctx.font=`bold ${size--}px Segoe UI, sans-serif`;}while(ctx.measureText(title).width>1156&&size>13);ctx.fillText(title,22,44);return canvas;}
if(focusCodes.length){const button=document.createElement('button');button.textContent='Kayıtlı görsellerden seçki indir';element('download').after(button);button.onclick=async()=>{button.disabled=true;try{const canvas=focusCanvas(),ctx=canvas.getContext('2d')!;for(const [i,id] of focusCodes.entries()){const img=new Image();img.src=`/review-captures/bolumler/${id}.png`;await img.decode();const x=i%4*300+12,y=70+Math.floor(i/4)*525;ctx.drawImage(img,x,y,276,491);ctx.fillStyle='#59436c';ctx.font='bold 17px Segoe UI, sans-serif';ctx.fillText(`${id} · ${LEVELS.find(l=>code(l)===id)!.rings.length} halka`,x,y+513);}const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('PNG')), 'image/png'));const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='focus.png';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status.textContent='Seçki PNG hazır.';}catch{status.textContent='Kayıtlı görseller bulunamadı; önce tam görsel setini oluştur.';}finally{button.disabled=false;}};}
let game:Phaser.Game;
const scene=new RingsScene({ready:()=>{setTimeout(()=>{game.loop.stop();scene.setReducedMotion(true);scene.setPaused(true);generate.disabled=false;status.textContent='140 bölüm hazır. Görselleri oluşturmak için düğmeye bas.';},0);},begin:()=>false,change:()=>{},end:()=>{},arrive:()=>{},finish:()=>{}});
game=new Phaser.Game({type:Phaser.CANVAS,parent:'renderer',width:540,height:790,backgroundColor:'#f0edf8',audio:{noAudio:true},scene:[scene],render:{antialias:true},banner:false});
function png(canvas:HTMLCanvasElement){const url=canvas.toDataURL('image/png'),raw=atob(url.split(',')[1]);return {url,data:Uint8Array.from(raw,c=>c.charCodeAt(0))};}
function openImage(url:string,name:string){element<HTMLImageElement>('zoom-image').src=url;const link=element<HTMLAnchorElement>('one-download');link.href=url;link.download=name;element<HTMLDialogElement>('zoom').showModal();}
element('close').onclick=()=>element<HTMLDialogElement>('zoom').close();
function code(l:Level){return l.mastery?`U${String(l.mastery).padStart(3,'0')}`:`K${String(l.id).padStart(2,'0')}`;}
function caption(l:Level){return `${l.rings.length} halka · ${l.balls.length} başlangıç topu · ${l.mastery?'Ustalık '+l.mastery:'Klasik '+l.id}`;}
function wrap(ctx:CanvasRenderingContext2D,text:string,x:number,y:number,width:number){let line='';for(const word of text.split(' ')){if(ctx.measureText(line+word).width>width){ctx.fillText(line,x,y);y+=17;line='';}line+=word+' ';}ctx.fillText(line,x,y);}
generate.onclick=async()=>{
  generate.disabled=true;generate.textContent='Görseller hazırlanıyor…';
  try{
    const shot=document.createElement('canvas');shot.width=540;shot.height=960;const ctx=shot.getContext('2d')!;
    let sheet=document.createElement('canvas');sheet.width=1500;sheet.height=1120;let sheetContext=sheet.getContext('2d')!;
    const focus=focusCanvas(),focusContext=focus.getContext('2d')!;
    for(let i=0;i<LEVELS.length;i++){
      const l=LEVELS[i],id=code(l),name=`${id}.png`;
      scene.loadLevel(l);scene.setTheme('classic');scene.setSkin('classic');scene.setSymbols(true);scene.setMotionPreview(false);scene.setPaused(false);scene.setAngles(l.rings.map(r=>r.initial));
      // The normal Phaser scene/renderer is stepped; the physics world is never started.
      game.step(i*34,16);game.step(i*34+16,16);
      ctx.fillStyle='#f0edf8';ctx.fillRect(0,0,540,960);ctx.fillStyle='#59436c';ctx.font='bold 27px Segoe UI, sans-serif';ctx.fillText(`${id} · ${l.mastery?'USTALIK':'KLASİK'}`,22,34);
      ctx.font='16px Segoe UI, sans-serif';ctx.fillText(l.name,22,60);ctx.fillStyle='#856c98';ctx.font='13px Segoe UI, sans-serif';ctx.fillText(caption(l),22,85);ctx.font='11px Segoe UI, sans-serif';wrap(ctx,objectiveText(l),22,107,490);
      ctx.drawImage(game.canvas,0,140);ctx.fillStyle='#856c98';ctx.font='12px Segoe UI, sans-serif';ctx.fillText('Başlangıç düzeni · Aynı oyun sahnesi',22,949);
      const image=png(shot);entries.push({name:`bolumler/${name}`,data:image.data});fullImages.set(id,image.url);captured.push({code:id,source:JSON.stringify(l),crc:crc32(image.data)});
      const focusAt=focusCodes.indexOf(id);if(focusAt>=0){const x=focusAt%4*300+12,y=70+Math.floor(focusAt/4)*525;focusContext.drawImage(shot,x,y,276,491);focusContext.fillStyle='#59436c';focusContext.font='bold 17px Segoe UI, sans-serif';focusContext.fillText(`${id} · ${l.rings.length} halka`,x,y+513);}
      const thumb=document.createElement('canvas');thumb.width=180;thumb.height=320;thumb.getContext('2d')!.drawImage(shot,0,0,180,320);
      const card=document.createElement('a');card.className='card';card.href=image.url;card.download=name;card.dataset.code=id;card.dataset.search=`${id} ${l.mastery?'u'+l.mastery:'k'+l.id} ${l.name}`.toLocaleLowerCase('tr');
      card.innerHTML=`<img loading="lazy" src="${thumb.toDataURL()}" alt="${id} — ${l.rings.length} halka"><span>${id} · ${l.rings.length} halka</span><small>${l.name}</small>`;
      card.onclick=event=>{event.preventDefault();openImage(fullImages.get(id)!,name);};element('levels').append(card);
      if(i%10===0){sheet=document.createElement('canvas');sheet.width=1500;sheet.height=1120;sheetContext=sheet.getContext('2d')!;sheetContext.fillStyle='#e8dfef';sheetContext.fillRect(0,0,1500,1120);sheetContext.fillStyle='#59436c';sheetContext.font='bold 30px Segoe UI, sans-serif';sheetContext.fillText(`${l.mastery?'USTALIK':'KLASİK'} · ${l.mastery??l.id}–${(l.mastery??l.id)+9}`,24,44);}
      const position=i%10,x=position%5*300+12,y=70+Math.floor(position/5)*525;sheetContext.drawImage(shot,x,y,276,491);sheetContext.font='bold 17px Segoe UI, sans-serif';sheetContext.fillStyle='#59436c';sheetContext.fillText(`${id} · ${l.rings.length} halka`,x,y+513);
      if(i%10===9){const first=LEVELS[i-9],sheetName=`${first.mastery?'Ustalik':'Klasik'}-${String(first.mastery??first.id).padStart(3,'0')}-${String(l.mastery??l.id).padStart(3,'0')}.png`,page=png(sheet);entries.push({name:`sayfalar/${sheetName}`,data:page.data});const figure=document.createElement('figure');figure.innerHTML=`<a href="${page.url}" download="${sheetName}"><img src="${page.url}" alt="${sheetName}" loading="lazy"></a><figcaption>${sheetName.replace('.png','')} · Büyütmek için dokun</figcaption>`;figure.querySelector('a')!.onclick=event=>{event.preventDefault();openImage(page.url,sheetName);};element('sheets').append(figure);}
      element<HTMLProgressElement>('progress').value=i+1;status.textContent=`${i+1}/140 bölüm hazır`;
      await new Promise<void>(resolve=>setTimeout(resolve,0));
    }
    if(focusCodes.length){entries.push({name:'focus.png',data:png(focus).data},{name:'review-selection.json',data:new TextEncoder().encode(JSON.stringify({codes:focusCodes,purpose:new URLSearchParams(location.search).get('reason')==='similarity'?'similarity':'requested'}))});}
    entries.push({name:'capture-manifest.json',data:new TextEncoder().encode(JSON.stringify({schema:1,levels:captured}))});
    download.disabled=false;generate.textContent='140 bölüm hazır ✓';status.textContent='140 ayrı PNG ve 14 karşılaştırma sayfası hazır. Bir görsele dokunarak büyütebilirsin.';
  }catch(error){status.textContent=`Görsel hazırlanamadı: ${error instanceof Error?error.message:String(error)}`;generate.disabled=false;generate.textContent='Yeniden dene';}
};
download.onclick=()=>{const data=zipStore(entries),url=URL.createObjectURL(new Blob([new Uint8Array(data).buffer],{type:'application/zip'}));const link=document.createElement('a');link.href=url;link.download='Color-Rings-140-Bolum.zip';link.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
function filter(){const selected=element<HTMLSelectElement>('campaign').value,query=element<HTMLInputElement>('search').value.trim().toLocaleLowerCase('tr');for(const card of Array.from(element('levels').querySelectorAll<HTMLElement>('.card')))card.hidden=(selected!=='all'&&!card.dataset.code!.startsWith(selected))||!card.dataset.search!.includes(query);}
element('campaign').onchange=filter;element('search').oninput=filter;


