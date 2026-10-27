import {LEVEL,type Level} from '../src/levels.ts';
/** Frozen former level-3 geometry retained only to regression-test pocket physics. */
export const LEGACY_SEQUENCE:Level={
  ...JSON.parse(JSON.stringify(LEVEL)),id:3,name:'Legacy pocket fixture',
  rings:[{...JSON.parse(JSON.stringify(LEVEL.rings[0])),initial:270},{radius:213,width:14,gaps:[{angle:90,size:20}],initial:90,baffles:[0,55,125,180,225,305].map(angle=>({angle,length:22,side:'inward' as const,width:11}))}],
  cups:[{color:'pink',x:145,y:682,width:190},{color:'blue',x:395,y:682,width:190}],solution:[0,15],sequence:[{angles:[0,15],waitFor:'pink'},{angles:[0,345],waitFor:'blue'}],
};
