import type {PaletteId} from './palettes.ts';

/** Render dimensions only. The 540×790 physics board and 14px collider are unchanged. */
export const PLAY_VIEW={width:540,height:776};
export const BALL_ART_SIZE=66;
export const PALETTE_MOTION:Record<PaletteId,{trailAlpha:number;shine:number;accent:number}>={
 pastel:{trailAlpha:.25,shine:.44,accent:0xc6b4f5},
 neon:{trailAlpha:.48,shine:.7,accent:0x5eeaff},
 candy:{trailAlpha:.34,shine:.6,accent:0xff80c6},
 ocean:{trailAlpha:.3,shine:.5,accent:0x62e1e2},
 galaxy:{trailAlpha:.4,shine:.6,accent:0xbe92ff},
};
export function rollingAngle(previous:number,current:number,alpha:number){
 return previous+(current-previous)*Math.max(0,Math.min(1,alpha));
}
export function impactStyle(strength:number,nx=0,ny=-1){
 const intensity=Math.min(1,Math.max(0,strength-30)/200),amount=.035+.075*intensity;
 return {intensity,particles:2+Math.round(intensity*5),scaleX:1+amount*(Math.abs(ny)-Math.abs(nx)),scaleY:1+amount*(Math.abs(nx)-Math.abs(ny))};
}
