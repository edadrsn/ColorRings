import {ECONOMY} from './economy-config.ts';
export const THEMES=[
  {id:'classic',name:'Classic',cost:ECONOMY.themePrices['classic'],background:'#f0edf8',dark:false,wall:'#625572',edge:'#c7b8d8',description:'Pastel ve tanıdık.'},
  {id:'neon',name:'Neon',cost:ECONOMY.themePrices['neon'],background:'#211c35',dark:true,wall:'#605a85',edge:'#69ebe0',description:'Koyu zeminde ışıklı kenarlar.'},
  {id:'candy',name:'Candy',cost:ECONOMY.themePrices['candy'],background:'#fce7f1',dark:false,wall:'#b46a9b',edge:'#ffe5f2',description:'Pembe şeker ve açık mavi.'},
  {id:'space',name:'Space',cost:ECONOMY.themePrices['space'],background:'#141d38',dark:true,wall:'#506a92',edge:'#acc9ff',description:'Sakin yıldızlar ve lacivert.'},
  {id:'aurora',name:'Aurora',cost:ECONOMY.themePrices['aurora'],background:'#102c32',dark:true,wall:'#37666d',edge:'#86f1c8',description:'Kutup ışıkları ve zümrüt halkalar.'},
  {id:'ocean',name:'Ocean',cost:ECONOMY.themePrices['ocean'],background:'#e3f3fa',dark:false,wall:'#386d89',edge:'#9be2ee',description:'Turkuaz dalgalar, derin mavi geçitler.'},
  {id:'sunset',name:'Sunset',cost:ECONOMY.themePrices['sunset'],background:'#fff0e5',dark:false,wall:'#965c70',edge:'#ffc499',description:'Gün batımı, sıcak mercan ve şeftali.'},
  {id:'forest',name:'Forest',cost:ECONOMY.themePrices['forest'],background:'#e9f2e5',dark:false,wall:'#496852',edge:'#b7dba7',description:'Yaprak dokuları ve sakin yeşiller.'},
  {id:'sakura',name:'Sakura',cost:ECONOMY.themePrices['sakura'],background:'#fbeaf2',dark:false,wall:'#8b567d',edge:'#f6b5d4',description:'Kiraz çiçekleri ve gül pembesi.'},
  {id:'glacier',name:'Glacier',cost:ECONOMY.themePrices['glacier'],background:'#e9f5fb',dark:false,wall:'#4f7393',edge:'#bbecff',description:'Buz kristalleri, gümüş mavi kenarlar.'},
  {id:'desert',name:'Desert',cost:ECONOMY.themePrices['desert'],background:'#f8eedb',dark:false,wall:'#876543',edge:'#edce91',description:'Altın kumlar ve yumuşak kum tepeleri.'},
  {id:'midnight',name:'Midnight',cost:ECONOMY.themePrices['midnight'],background:'#211c30',dark:true,wall:'#62547e',edge:'#d5b6fa',description:'Mor takımyıldızlar ve ay ışığı.'},
  {id:'prism',name:'Prism',cost:ECONOMY.themePrices['prism'],background:'#e4f6f3',dark:false,wall:'#506b8a',edge:'#8de5d7',description:'çok yüzlü cam desenleri.'},
  {id:'velvet',name:'Velvet',cost:ECONOMY.themePrices['velvet'],background:'#24182e',dark:true,wall:'#7d507b',edge:'#efb7d6',description:'altın yıldızlı kadife.'},
] as const;
export type ThemeId=typeof THEMES[number]['id'];
export const validTheme=(value:unknown):value is ThemeId=>THEMES.some(theme=>theme.id===value);
export const themeById=(id:ThemeId)=>THEMES.find(theme=>theme.id===id)!;
