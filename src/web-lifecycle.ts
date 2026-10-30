/** Web lifecycle boundary; never overrides the player's own pause preference. */
export class WebLifecycle{
 private pageVisible=true;private frozen=false;
 setPageVisible(visible:boolean){this.pageVisible=visible;}
 setFrozen(frozen:boolean){this.frozen=frozen;}
 background(hidden:boolean){return hidden||!this.pageVisible||this.frozen;}
 shouldPause(hidden:boolean,manual:boolean,menu:boolean,preview:boolean){return this.background(hidden)||manual||menu||preview;}
}
