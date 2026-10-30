/** Sort a copy: authored catalog order and stable cosmetic IDs stay intact. */
export function byCoinPrice<T extends {cost:number}>(items:readonly T[]):T[]{return [...items].sort((a,b)=>a.cost-b.cost);}
