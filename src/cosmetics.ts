import {ECONOMY} from './economy-config.ts';
const CATALOG=[
  {id:'classic',name:'Klasik',cost:ECONOMY.skinPrices['classic'],description:'Parlak renkler, sade bir akış.'},
  {id:'pearl',name:'İnci',cost:ECONOMY.skinPrices['pearl'],description:'İnci dokunuşu ve yumuşak yansımalar.'},
  {id:'neon',name:'Neon',cost:ECONOMY.skinPrices['neon'],description:'Işıklı kenarlar, canlı bir parıltı.'},
  {id:'stardust',name:'Yıldız tozu',cost:ECONOMY.skinPrices['stardust'],description:'Küçük yıldızlarla gökyüzü ışıltısı.'},
  {id:'galaxy',name:'Galaxy',cost:ECONOMY.skinPrices['galaxy'],description:'Rengin üzerinde dönen yıldız yörüngeleri.'},
  {id:'rainbow',name:'Rainbow',cost:ECONOMY.skinPrices['rainbow'],description:'Renkli bir kuşak, aynı oyun rengi.'},
  {id:'gold',name:'Gold',cost:ECONOMY.skinPrices['gold'],description:'Altın çerçeveli renkli cam.'},
  {id:'diamond',name:'Diamond',cost:ECONOMY.skinPrices['diamond'],description:'Keskin elmas yüzeyler.'},
  {id:'crystal',name:'Crystal',cost:ECONOMY.skinPrices['crystal'],description:'Buzlu kristal çizgiler.'},
  {id:'candy',name:'Candy',cost:ECONOMY.skinPrices['candy'],description:'Şeker gibi çizgili yüzey.'},
  {id:'fire',name:'Fire',cost:ECONOMY.skinPrices['fire'],description:'Kısa alev desenleri.'},
  {id:'ice',name:'Ice',cost:ECONOMY.skinPrices['ice'],description:'Kar tanesi ve soğuk yansımalar.'},
  {id:'ocean',name:'Ocean',cost:ECONOMY.skinPrices['ocean'],description:'Camın içinde küçük dalgalar.'},
  {id:'lava',name:'Lava',cost:ECONOMY.skinPrices['lava'],description:'Işıklı çatlaklar.'},
  {id:'cat',name:'Cat',cost:ECONOMY.skinPrices['cat'],description:'Minik kedi yüzü.'},
  {id:'panda',name:'Panda',cost:ECONOMY.skinPrices['panda'],description:'10 bölümü ipucusuz tamamla.',achievement:'no-hints'},
  {id:'star',name:'Star',cost:ECONOMY.skinPrices['star'],description:'5 Perfect Flow kazan.',achievement:'perfect'},
  {id:'heart',name:'Heart',cost:ECONOMY.skinPrices['heart'],description:'Parlak kalp mührü.'},
  {id:'bubble',name:'Bubble',cost:ECONOMY.skinPrices['bubble'],description:'İç içe saydam baloncuklar.'},
  {id:'cosmic',name:'Cosmic',cost:ECONOMY.skinPrices['cosmic'],description:'50 bulmaca tamamla.',achievement:'master'},
  {id:'prism',name:'Prism',cost:0,description:'Premium test paketi · ışığı bölen prizmalar.',premium:'premium'},
  {id:'orbit',name:'Orbit',cost:0,description:'Premium test paketi · çift yıldız yörüngesi.',premium:'premium'},
  {id:'royal',name:'Royal',cost:0,description:'Premium test paketi · altın taç mührü.',premium:'premium'},
] as const;
export type SkinId=typeof CATALOG[number]['id'];
export const SKINS:readonly {id:SkinId;name:string;cost:number;description:string;achievement?:string;premium?:string}[]=CATALOG;
export const validSkin=(id:unknown):id is SkinId=>SKINS.some(skin=>skin.id===id);

