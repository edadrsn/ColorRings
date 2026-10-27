import type {Level,Key,Lock} from './levels.ts';
import type {PlanAction,RingLink} from './advanced-types.ts';
type RelayPatch={id:number;key:Key;lock:Lock;plan:PlanAction[];moves:number;stages:number;twist:boolean;ringLimits?:number[];maxMoves?:number;initials:number[];links?:RingLink[]};
/** Authored offline, then replayed through RingSession and the real fixed-step physics. */
export const RELAY_PATCHES=[
 {
  "id": 72,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 160,
   "y": 286
  },
  "lock": {
   "id": "relay-ring",
   "ring": 2,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 0,
    "to": 0
   },
   {
    "ring": 1,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 2,
    "to": 15
   },
   {
    "play": false,
    "waitFor": "pink"
   },
   {
    "ring": 2,
    "to": 355,
    "play": false
   },
   {
    "play": false,
    "waitFor": "yellow"
   },
   {
    "ring": 2,
    "to": 335,
    "play": false
   },
   {
    "play": false,
    "waitFor": "blue"
   }
  ],
  "moves": 5,
  "stages": 4,
  "twist": false,
  "initials": [
   140,
   200,
   155
  ]
 },
 {
  "id": 98,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 160,
   "y": 288
  },
  "lock": {
   "id": "relay-ring",
   "ring": 2,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 0,
    "to": 0
   },
   {
    "ring": 1,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 2,
    "to": 330
   },
   {
    "play": false,
    "waitFor": "all"
   }
  ],
  "moves": 3,
  "stages": 2,
  "twist": false,
  "ringLimits": [
   2,
   2,
   2
  ],
  "maxMoves": 5,
  "initials": [
   135,
   180,
   195
  ]
 },
 {
  "id": 99,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 194,
   "y": 258
  },
  "lock": {
   "id": "relay-ring",
   "ring": 2,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 0,
    "to": 0
   },
   {
    "ring": 1,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 2,
    "to": 330
   },
   {
    "play": false,
    "waitFor": "all"
   }
  ],
  "moves": 3,
  "stages": 2,
  "twist": false,
  "ringLimits": [
   2,
   2,
   2
  ],
  "maxMoves": 5,
  "initials": [
   210,
   180,
   165
  ]
 },
 {
  "id": 103,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 244.14359353944897,
   "y": 292.7846096908265,
   "ring": 0
  },
  "lock": {
   "id": "relay-ring",
   "ring": 3,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 1,
    "to": 30
   },
   {
    "ring": 2,
    "to": 315
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 0,
    "to": 330
   },
   {
    "play": false,
    "waitFor": "blue"
   },
   {
    "ring": 3,
    "to": 60,
    "play": false
   },
   {
    "play": false,
    "waitFor": "pink"
   }
  ],
  "moves": 4,
  "stages": 3,
  "twist": true,
  "ringLimits": [
   3,
   2,
   2,
   3
  ],
  "maxMoves": 5,
  "initials": [
   60,
   195,
   150,
   135
  ],
  "links": [
   {
    "driver": 0,
    "follower": 3,
    "ratio": 1.1666666666666667
   }
  ]
 },
 {
  "id": 110,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 331.9282032302755,
   "y": 371.2627944162883,
   "ring": 0
  },
  "lock": {
   "id": "relay-ring",
   "ring": 3,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 1,
    "to": 330
   },
   {
    "ring": 2,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 0,
    "to": 0
   },
   {
    "play": false,
    "waitFor": "pink"
   },
   {
    "ring": 3,
    "to": 355,
    "play": false
   },
   {
    "play": false,
    "waitFor": "yellow"
   },
   {
    "ring": 3,
    "to": 335,
    "play": false
   },
   {
    "play": false,
    "waitFor": "blue"
   }
  ],
  "moves": 5,
  "stages": 4,
  "twist": true,
  "ringLimits": [
   3,
   2,
   2,
   4
  ],
  "maxMoves": 6,
  "initials": [
   120,
   195,
   180,
   150
  ],
  "links": [
   {
    "driver": 0,
    "follower": 3,
    "ratio": 1.125
   }
  ]
 },
 {
  "id": 111,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 264,
   "y": 170,
   "ring": 0
  },
  "lock": {
   "id": "relay-ring",
   "ring": 2,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 1,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 0,
    "to": 0
   },
   {
    "play": false,
    "waitFor": "blue"
   },
   {
    "ring": 2,
    "to": 355,
    "play": false
   },
   {
    "play": false,
    "waitFor": "yellow"
   },
   {
    "ring": 2,
    "to": 15,
    "play": false
   },
   {
    "play": false,
    "waitFor": "pink"
   }
  ],
  "moves": 4,
  "stages": 4,
  "twist": true,
  "ringLimits": [
   3,
   2,
   4
  ],
  "maxMoves": 5,
  "initials": [
   270,
   180,
   195
  ],
  "links": [
   {
    "driver": 0,
    "follower": 2,
    "ratio": 1.5555555555555556
   }
  ]
 },
 {
  "id": 112,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 195.04668119422595,
   "y": 360.61017305526644,
   "ring": 0
  },
  "lock": {
   "id": "relay-ring",
   "ring": 2,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 1,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 0,
    "to": 0
   },
   {
    "play": false,
    "waitFor": "pink"
   },
   {
    "ring": 2,
    "to": 355,
    "play": false
   },
   {
    "play": false,
    "waitFor": "purple"
   },
   {
    "ring": 2,
    "to": 335,
    "play": false
   },
   {
    "play": false,
    "waitFor": "blue"
   }
  ],
  "moves": 4,
  "stages": 4,
  "twist": true,
  "ringLimits": [
   3,
   2,
   4
  ],
  "maxMoves": 5,
  "initials": [
   45,
   180,
   195
  ],
  "links": [
   {
    "driver": 0,
    "follower": 2,
    "ratio": 4
   }
  ]
 },
 {
  "id": 132,
  "key": {
   "id": "relay-key",
   "lock": "relay-ring",
   "x": 319.80384757729337,
   "y": 378.2627944162883,
   "ring": 0
  },
  "lock": {
   "id": "relay-ring",
   "ring": 2,
   "kind": "ring"
  },
  "plan": [
   {
    "ring": 1,
    "to": 0
   },
   {
    "play": true,
    "waitFor": "key:relay-key"
   },
   {
    "ring": 0,
    "to": 0
   },
   {
    "play": false,
    "waitFor": "blue"
   },
   {
    "ring": 2,
    "to": 355,
    "play": false
   },
   {
    "play": false,
    "waitFor": "yellow"
   },
   {
    "ring": 2,
    "to": 15,
    "play": false
   },
   {
    "play": false,
    "waitFor": "pink"
   }
  ],
  "moves": 4,
  "stages": 4,
  "twist": true,
  "ringLimits": [
   3,
   2,
   4
  ],
  "maxMoves": 5,
  "initials": [
   120,
   180,
   195
  ],
  "links": [
   {
    "driver": 0,
    "follower": 2,
    "ratio": -1.1666666666666667
   }
  ]
 }
] satisfies RelayPatch[];
export function applyRelayLevels(levels:Level[]){
 const env=(globalThis as typeof globalThis&{process?:{env?:Record<string,string|undefined>}}).process?.env;
 if(env?.COLOR_RINGS_RELAY_AUTHORING==='1')return;
 for(const patch of RELAY_PATCHES){
  const l=levels.find(level=>level.id===patch.id);if(!l)continue;
  l.rings=l.rings.map((ring,i)=>({...ring,initial:patch.initials[i]}));if(patch.links)l.links=patch.links.map(link=>({...link}));
  l.keys=[...l.keys??[],{...patch.key}];l.locks=[...l.locks??[],{...patch.lock}];
  l.rules={...l.rules,requiredKeys:[...l.rules?.requiredKeys??[],patch.key.id],maxMoves:patch.maxMoves};
  l.plan=patch.plan.map(action=>({...action}));l.targetMoves=patch.moves;
  if(patch.ringLimits)l.ringLimits=[...patch.ringLimits];
  l.stars={three:patch.moves,two:patch.moves+Math.max(2,Math.ceil(patch.moves/2))};
  if(l.perfect)l.perfect={...l.perfect,moves:patch.moves};
  l.lesson=patch.twist?'Önce anahtarı topla; iç halkayla bağlı dış yolu birlikte aç.':'Önce iç yolu aç ve anahtarı topla; sonra dış halkayı döndür.';
 }
}
