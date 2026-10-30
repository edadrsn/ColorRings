import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SKINS} from '../src/cosmetics.ts';
import {paintSphere,MATERIALS} from '../src/materials.ts';
import {paletteColors} from '../src/palettes.ts';
import {presentationTheme} from '../src/visual-theme.ts';
import {freshProgress} from '../src/progress.ts';
import {homeMarkup} from '../src/home-view.ts';
import {skinDetailMarkup,dailyMarkup} from '../src/menu-views.ts';
import {rewardArt} from '../src/ui-art.ts';
import {cosmeticStoreMarkup} from '../src/cosmetic-store.ts';
import {RenderTelemetry} from '../src/render-telemetry.ts';
function drawing(skin:typeof SKINS[number]['id'],color:'pink'|'blue'){
 const calls:unknown[]=[];const gradient={addColorStop:(...args:unknown[])=>calls.push(['stop',...args])};
 const ctx=new Proxy({}, {get:(_t,key)=>(...args:unknown[])=>{calls.push([key,...args]);return String(key).startsWith('create')?gradient:undefined;},set:(_t,key,value)=>{calls.push([key,value]);return true;}}) as CanvasRenderingContext2D;
 paintSphere(ctx,skin,paletteColors('pastel')[color]);return calls;
}
test('23 cached materials produce distinct drawing programs, with a color-coded seal for every skin',()=>{
 assert.equal(Object.keys(MATERIALS).length,SKINS.length);const signatures=SKINS.map(s=>JSON.stringify(drawing(s.id,'pink')));assert.equal(new Set(signatures).size,23);
 for(const s of SKINS){const pink=JSON.stringify(drawing(s.id,'pink')),blue=JSON.stringify(drawing(s.id,'blue'));assert.notEqual(pink,blue);assert.ok(pink.includes(paletteColors('pastel').pink.css));assert.ok(blue.includes(paletteColors('pastel').blue.css));}
});
test('white pearl, metal gold and galaxy surfaces have materially distinct luminance sources',()=>{assert.equal(MATERIALS.pearl.light,'#ffffff');assert.notEqual(MATERIALS.gold.mid,MATERIALS.classic.mid);assert.notEqual(MATERIALS.galaxy.dark,MATERIALS.classic.dark);});
test('palette environment changes the base world; explicitly selected themes remain respected',()=>{assert.equal(presentationTheme('classic','neon'),'neon');assert.equal(presentationTheme('classic','galaxy'),'space');assert.equal(presentationTheme('classic','ocean'),'ocean');assert.equal(presentationTheme('classic','candy'),'candy');assert.equal(presentationTheme('classic','pastel'),'classic');assert.equal(presentationTheme('glacier','galaxy'),'glacier');});
test('home has working primary and secondary routes, original scene art and visible coin count',()=>{const p=freshProgress();p.coins=91;const html=homeMarkup(p);for(const id of ['play','challenge','collection','store','daily','achievements','levels','statistics','settings'])assert.ok(html.includes(`data-nav="${id}"`));assert.ok(html.includes('home-landscape'));assert.ok(html.includes('91'));assert.equal(p.coins,91);});
test('achievement, coin-priced and owned detail previews expose correct actions',()=>{const p=freshProgress();assert.match(skinDetailMarkup(p,'panda',['a','b']),/Başarımla açılır/);assert.match(skinDetailMarkup(p,'prism',['a','b']),/Unlock · ✦ 320/);assert.match(skinDetailMarkup(p,'gold',['a','b']),/Unlock · ✦ 280/);p.owned.push('gold');assert.match(skinDetailMarkup(p,'gold',['a','b']),/>Equip</);assert.equal(p.skin,'classic');});
test('cosmetic store offers only earned-coin categories and original reward art',()=>{const p=freshProgress(),html=cosmeticStoreMarkup(p);for(const id of ['skins','themes','palettes'])assert.ok(html.includes(`data-cosmetic="${id}"`));assert.match(rewardArt(),/^<svg/);assert.ok(!/TEST|premium|data-product|data-ad/i.test(html));});
test('render telemetry is bounded and ignores hidden/paused/non-frame observations',()=>{const meter=new RenderTelemetry();meter.sample(NaN,true);meter.sample(1000,true);meter.sample(16,false);assert.equal(meter.snapshot().samples,0);for(let i=0;i<300;i++)meter.sample(20,true);assert.deepEqual(meter.snapshot(),{samples:240,fps:50,p95:20});});
test('daily reward presentation renders actual configured gold rather than template text',()=>{const p=freshProgress(),html=dailyMarkup(p,'2026-10-27');assert.match(html,/45 altın/);assert.ok(!html.includes('${'));p.daily['2026-10-27']=3;assert.match(dailyMarkup(p,'2026-10-27'),/ödülü alındı/);});
