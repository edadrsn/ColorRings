import type {Color,Vec} from './levels.ts';
export type RingLink={driver:number;follower:number;ratio:number};
export type Splitter={id:string;x:number;y:number;color:Color;radius:number;outlets:[Vec,Vec]};
export type WinRules={maxMoves?:number;deliveryOrder?:Color[];requiredKeys?:string[]};
export type PlanAction={ring?:number;to?:number;play?:boolean;waitFor?:Color|'all'|`key:${string}`};
