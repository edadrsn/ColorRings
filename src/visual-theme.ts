import type {ThemeId} from './themes.ts';
import type {PaletteId} from './palettes.ts';
/** An explicitly selected decorative theme wins; the base theme follows the color palette. */
export function presentationTheme(theme:ThemeId,palette:PaletteId):ThemeId{return theme==='classic'?({pastel:'classic',neon:'neon',candy:'candy',ocean:'ocean',galaxy:'space'} as const)[palette]:theme;}
export const PALETTE_BACKDROPS:Record<PaletteId,{top:string;bottom:string;wall:string}>={pastel:{top:'#ffe2f1',bottom:'#d9f5ff',wall:'#697ca3'},neon:{top:'#101e42',bottom:'#2a1853',wall:'#39d8ed'},candy:{top:'#fff1b8',bottom:'#ffb8d6',wall:'#e154a4'},ocean:{top:'#d5fbff',bottom:'#78c9e4',wall:'#2386a4'},galaxy:{top:'#111c43',bottom:'#412262',wall:'#a679ff'}};
