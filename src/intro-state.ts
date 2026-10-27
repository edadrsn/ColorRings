export type IntroState={selected:boolean;rotated:boolean;aligned:boolean;started:boolean;matched:boolean;solved:boolean};
export const freshIntro=():IntroState=>({selected:false,rotated:false,aligned:false,started:false,matched:false,solved:false});
export function loadIntro(value:unknown):IntroState{const result=freshIntro();if(value&&typeof value==='object')for(const key of Object.keys(result) as (keyof IntroState)[])result[key]=(value as Record<string,unknown>)[key]===true;return result;}
