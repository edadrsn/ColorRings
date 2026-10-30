import {TRANSLATIONS} from './translations.ts';
import {EXTRA_TRANSLATIONS} from './translations-extra.ts';
import type {StorageLike} from './progress.ts';
export const LANGUAGES=[{id:'tr',name:'Türkçe'},{id:'en',name:'English'},{id:'de',name:'Deutsch'},{id:'es',name:'Español'},{id:'fr',name:'Français'},{id:'pt',name:'Português'},{id:'it',name:'Italiano'},{id:'nl',name:'Nederlands'}] as const;
export type Language=typeof LANGUAGES[number]['id'];
export const LANGUAGE_KEY='spin-sort-language-v1';
export function languageCode(value:unknown):Language|null{return typeof value==='string'&&LANGUAGES.some(l=>l.id===value)?value as Language:null;}
export function loadLanguage(storage:StorageLike|null):Language{try{return languageCode(storage?.getItem(LANGUAGE_KEY))??'tr';}catch{return 'tr';}}
export function saveLanguage(storage:StorageLike|null,language:Language){try{storage?.setItem(LANGUAGE_KEY,language);return !!storage;}catch{return false;}}
const additional=new Map(EXTRA_TRANSLATIONS.trim().split('\n').map(line=>{const [english,...values]=line.split('|');return [english,values] as const;}));
const rows=TRANSLATIONS.trim().split('\n').map(line=>{const row=line.split('|');return [...row,...(additional.get(row[1])??[row[1],row[1]])];});
export const translationRows=rows;
const turkish:Record<string,string>={Play:'Oyna',Undo:'Geri al',Restart:'Baştan','Next Level':'Sonraki bölüm',Statistics:'İstatistikler',Collection:'Koleksiyon',Store:'Mağaza',Themes:'Temalar',Achievements:'Başarımlar',Challenges:'Görevler',Challenge:'Görev',Daily:'Günlük','Daily Puzzle':'Günlük bulmaca','Live Mode':'Canlı mod',All:'Tümü',Owned:'Açık',Locked:'Kilitli',OWNED:'AÇIK',LOCKED:'KİLİTLİ',EQUIPPED:'KUŞANILDI',Equipped:'Kuşanıldı',Equip:'Kuşan',Unlock:'Aç',Common:'Yaygın',Rare:'Nadir',Epic:'Destansı',Legendary:'Efsanevi',Featured:'Öne çıkan',Balls:'Toplar',Gold:'Altın','LEVEL COMPLETE':'BÖLÜM TAMAMLANDI','Replay Solution':'Çözümü izle'};
const dictionaries=Object.fromEntries(LANGUAGES.map((l,i)=>[l.id,new Map(rows.map(row=>[row[0],row[i]]))])) as Record<Language,Map<string,string>>;
const escape=(s:string)=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// A single replacement pass prevents translating already translated words again.
// Unicode boundaries avoid touching identifiers, material names and substrings.
const pattern=new RegExp(`(?<![\\p{L}\\p{N}_])(${rows.map(r=>r[0]).sort((a,b)=>b.length-a.length).map(escape).join('|')})(?![\\p{L}\\p{N}_])`,'gu');
export function translate(source:string,language:Language):string{
 if(language==='tr')return source.replace(/\b(Next Level|Daily Puzzle|Live Mode|LEVEL COMPLETE|Replay Solution|Play|Undo|Restart|Statistics|Collection|Store|Themes|Achievements|Challenges|Challenge|Daily|All|Owned|Locked|OWNED|LOCKED|EQUIPPED|Equipped|Equip|Unlock|Common|Rare|Epic|Legendary|Featured|Balls|Gold)\b/g,key=>turkish[key]??key);
 const dictionary=dictionaries[language],trimmed=source.trim(),exact=dictionary.get(trimmed);
 if(exact!==undefined)return source.replace(trimmed,exact);
 const wrong=/^(Pembe|Mavi|Sarı|Yeşil|Mor) top (pembe|mavi|sarı|yeşil|mor) kovaya düştü\. Kendi renkli kovasına yönlendir\.$/.exec(trimmed);
 if(wrong)return source.replace(trimmed,dictionary.get('{ball} top {cup} kovaya düştü. Kendi renkli kovasına yönlendir.')!.replace('{ball}',translate(wrong[1].toLocaleLowerCase('tr'),language)).replace('{cup}',translate(wrong[2],language)));
 return source.replace(pattern,key=>dictionary.get(key)??key);
}
/** Localizes existing DOM views without replacing their elements or handlers.
 * Remembers original text so switching languages never translates a translation.
 * Only mutation targets are visited; no per-frame full-document scans. */
export class Localizer{
 language:Language;private root:HTMLElement;private texts=new WeakMap<Text,{source:string;rendered:string}>();private attributes=new WeakMap<Element,Map<string,{source:string;rendered:string}>>();private observer:MutationObserver;private briefs:Map<string,string>;
 constructor(root:HTMLElement,language:Language,briefs=new Map<string,string>()){
  this.briefs=briefs;
  this.root=root;this.language=language;
  this.observer=new MutationObserver(records=>{
   const nodes=new Set<Node>();for(const r of records){if(r.type==='childList')r.addedNodes.forEach(n=>nodes.add(n));else nodes.add(r.target);}
   for(const node of nodes)this.visit(node);
  });
  this.observer.observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['aria-label','title','alt']});this.refresh();
 }
 setLanguage(language:Language){this.language=language;this.refresh();}
 refresh(){document.documentElement.lang=this.language;this.visit(this.root);}
 disconnect(){this.observer.disconnect();}
 private text(source:string){const brief=this.language!=='tr'&&!dictionaries[this.language].has(source.trim())?this.briefs.get(source):undefined;return translate(brief??source,this.language);}
 private visit(node:Node){
  if(node.nodeType===3){const text=node as Text;if(text.parentElement?.closest('script,style,pre,[data-no-translate],svg'))return;
   const current=text.data,old=this.texts.get(text),source=old&&old.rendered===current?old.source:current,rendered=this.text(source);
   this.texts.set(text,{source,rendered});if(rendered!==current)text.data=rendered;return;
  }
  if(node.nodeType!==1)return;const element=node as HTMLElement;if(element.matches('script,style,pre,[data-no-translate],svg'))return;
  let saved=this.attributes.get(element);if(!saved){saved=new Map();this.attributes.set(element,saved);}
  for(const key of ['aria-label','title','alt']){const current=element.getAttribute(key);if(current===null)continue;const old=saved.get(key),source=old?.rendered===current?old.source:current,rendered=this.text(source);saved.set(key,{source,rendered});if(rendered!==current)element.setAttribute(key,rendered);}
  element.childNodes.forEach(child=>this.visit(child));
 }
}
