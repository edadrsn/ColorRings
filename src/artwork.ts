import {paintSphere} from './materials.ts';
import {paletteColors,type PaletteId} from './palettes.ts';
import type Phaser from 'phaser';
import { BOARD, COLORS, LEVELS, radians, type Level, type Color } from './levels.ts';
import { ringSegments } from './physics.ts';
import {themeById,type ThemeId} from './themes.ts';


/** Original Canvas artwork, generated once and reused as small local textures. */
export function createArtwork(scene: Phaser.Scene, level:Level=LEVELS[0],palette:PaletteId='pastel'): void {
  const shades=paletteColors(palette);
  for (const color of Object.keys(COLORS) as Color[]) {
    const base = shades[color].css;
    const {light,mid,dark}=shades[color];
    if (!scene.textures.exists(colorTexture('marble',color,palette))) {
      const texture = scene.textures.createCanvas(colorTexture('marble',color,palette), 128, 128)!;
      const ctx = texture.getContext();
      paintSphere(ctx,'classic',shades[color]);
      texture.refresh();
    }
    if (!scene.textures.exists(colorTexture('trail',color,palette))) {
      const texture = scene.textures.createCanvas(colorTexture('trail',color,palette), 64, 64)!;
      const ctx = texture.getContext(), gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 31);
      gradient.addColorStop(0, '#ffffffdf'); gradient.addColorStop(.2, `${base}b0`); gradient.addColorStop(1, `${base}00`);
      ctx.fillStyle = gradient; ctx.fillRect(0, 0, 64, 64); texture.refresh();
    }
    if (!scene.textures.exists(colorTexture('bucket',color,palette))) {
      const texture = scene.textures.createCanvas(colorTexture('bucket',color,palette), 400, 220)!;
      const ctx = texture.getContext(); ctx.scale(2, 2); ctx.translate(100, 20);
      ctx.fillStyle = '#61577420'; ctx.beginPath(); ctx.ellipse(0, 68, 73, 9, 0, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.shadowColor = '#5b4b7325'; ctx.shadowBlur = 10; ctx.shadowOffsetY = 6;
      const body = ctx.createLinearGradient(-74, 0, 74, 0);
      body.addColorStop(0, dark); body.addColorStop(.28, light);
      body.addColorStop(.53, base); body.addColorStop(1, mid);
      ctx.fillStyle = body; ctx.beginPath(); ctx.moveTo(-72, -5); ctx.lineTo(-57, 61); ctx.quadraticCurveTo(0, 69, 57, 61); ctx.lineTo(72, -5); ctx.closePath(); ctx.fill(); ctx.restore();
      ctx.fillStyle = '#ffffff35'; ctx.beginPath(); ctx.moveTo(-60, 4); ctx.lineTo(-48, 53); ctx.lineTo(-31, 55); ctx.lineTo(-40, 5); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#ffffff24'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-65, 22); ctx.quadraticCurveTo(0, 32, 65, 22); ctx.stroke();
      ctx.fillStyle = base; ctx.beginPath(); ctx.ellipse(0, -5, 76, 14, 0, 0, Math.PI * 2); ctx.fill();
      const inside = ctx.createLinearGradient(0, -15, 0, 5); inside.addColorStop(0, dark); inside.addColorStop(1, base);
      ctx.fillStyle = inside; ctx.beginPath(); ctx.ellipse(0, -5, 65, 8, 0, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = '#ffffffc0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(0, -5, 75, 13, 0, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#ffffff7a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-55, 58); ctx.quadraticCurveTo(0, 67, 55, 58); ctx.stroke();
      texture.refresh();
    }
  }
  // Only the active level is resident; a 20-level campaign must not prebuild
  // dozens of 768px textures on a mobile browser.
  level.rings.forEach((_, index) => createRingArtwork(scene, level, index));
}
export const ringTexture = (level: Level, index: number) => `ring-${level.id}-${index}-gloss`;
export const themedRingTexture=(level:Level,index:number,theme:ThemeId)=>theme==='classic'?ringTexture(level,index):`${ringTexture(level,index)}-${theme}`;
export function createThemeArtwork(scene:Phaser.Scene,level:Level,theme:ThemeId){level.rings.forEach((_,i)=>createRingArtwork(scene,level,i,theme));}
function createRingArtwork(scene: Phaser.Scene, level: Level, index: number,themeId:ThemeId='classic'): void {
  const key = themedRingTexture(level, index,themeId); if (scene.textures.exists(key)) return;
  const theme=themeById(themeId);
  const texture = scene.textures.createCanvas(key, 768, 768)!;
  const ctx = texture.getContext(); ctx.scale(1.5, 1.5);
  const segments = ringSegments(index, 0, level);
  const draw = (extra: number, offset: number, color: string | CanvasGradient) => {
    ctx.strokeStyle = color; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    for (const segment of segments) {
      ctx.lineWidth = segment.radius * 2 + extra;
      ctx.beginPath(); ctx.moveTo(segment.a.x - BOARD.center.x + 256, segment.a.y - BOARD.center.y + 256 + offset);
      ctx.lineTo(segment.b.x - BOARD.center.x + 256, segment.b.y - BOARD.center.y + 256 + offset); ctx.stroke();
    }
  };
  ctx.save(); ctx.shadowColor = '#39314840'; ctx.shadowBlur = 9; ctx.shadowOffsetY = 5; draw(5, 7, '#463c541a'); ctx.restore();
  draw(5, 6, '#10213d'); draw(3, 1, '#273650');
  const accent=['#ed77bd','#43bac9','#9b85e9','#ebb45a'][index%4];const bevel = ctx.createLinearGradient(0, 35, 0, 470); bevel.addColorStop(0,themeId==='classic'?accent:theme.edge); bevel.addColorStop(.4,themeId==='classic'?'#536b86':theme.wall); bevel.addColorStop(1,'#243852');
  draw(1, -1, bevel); draw(-6, -3, '#d7f7ff70');
  const ring = level.rings[index];
  for (const gap of ring.gaps) for (const edge of [-1, 1]) {
    const a = radians(gap.angle + gap.size / 2 * edge), x = 256 + Math.cos(a) * ring.radius, y = 256 + Math.sin(a) * ring.radius;
    ctx.shadowColor=theme.edge;ctx.shadowBlur=8;ctx.fillStyle = index ? '#52fff0' : '#ff9ade'; ctx.beginPath(); ctx.arc(x, y - 1, 4.3, 0, Math.PI * 2); ctx.fill();
    ctx.shadowBlur=0;ctx.fillStyle = '#ffffffdf'; ctx.beginPath(); ctx.arc(x - 1, y - 2, 1.2, 0, Math.PI * 2); ctx.fill();
  }
  const a = Math.PI, x = 256 + Math.cos(a) * ring.radius, y = 256 + Math.sin(a) * ring.radius;
  if (!ring.gaps.some(g => Math.abs(((180-g.angle+540)%360)-180) < g.size/2)) {
    ctx.fillStyle = index ? '#b7dfef' : '#d3b5f4'; ctx.beginPath(); ctx.arc(x, y, 8, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#655273'; ctx.beginPath(); ctx.arc(x-2, y-2, 1.5, 0, Math.PI*2); ctx.arc(x+2, y+2, 1.5, 0, Math.PI*2); ctx.fill();
  }
  texture.refresh();
}

export const colorTexture=(kind:'marble'|'trail'|'bucket',color:Color,palette:PaletteId='pastel')=>`${kind}-${color}-${palette}`;
export const ballTexture=(color:Color,skin:import('./cosmetics.ts').SkinId,palette:PaletteId='pastel')=>skin==='classic'?colorTexture('marble',color,palette):`marble-${color}-${skin}-${palette}`;
export function createSkinArtwork(scene:Phaser.Scene,skin:import('./cosmetics.ts').SkinId,palette:PaletteId='pastel'):void{
  const shades=paletteColors(palette);
  if(skin==='classic')return;
  for(const color of Object.keys(COLORS) as Color[]){
    const key=ballTexture(color,skin,palette);if(scene.textures.exists(key))continue;
    const texture=scene.textures.createCanvas(key,128,128)!,ctx=texture.getContext();
    paintSphere(ctx,skin,shades[color]);
    texture.refresh();
  }
}

