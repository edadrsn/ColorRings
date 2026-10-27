export type MenuPosition={scroll:number;focus?:string};
export type MenuRoute={key:string;title:string;render:()=>void};
export type MenuEntry=MenuRoute&MenuPosition;
/** UI-only navigation: rebuilding a page never replays a purchase, reward or game action. */
export class MenuHistory{
 private entries:MenuEntry[]=[];
 private active:MenuEntry|null=null;
 get current(){return this.active;}
 get depth(){return this.entries.length;}
 visit(route:MenuRoute,position:MenuPosition={scroll:0}){
  const refresh=this.active?.key===route.key;
  if(this.active&&!refresh)this.entries.push({...this.active,...position});
  this.active={...route,scroll:refresh?position.scroll:0};return refresh;
 }
 root(route:MenuRoute){this.entries=[];this.active={...route,scroll:0};}
 updateRender(render:()=>void){if(this.active)this.active={...this.active,render};}
 back():MenuEntry|null{const previous=this.entries.pop()??null;this.active=previous;return previous;}
 clear(){this.entries=[];this.active=null;}
}
