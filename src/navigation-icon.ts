/** Navigation glyphs share a viewport and stroke so font metrics cannot shift them. */
export function navigationIcon(name:'home'|'back'|'close'){
 const paths={home:'M3 10.5 12 3l9 7.5M5 9v12h5v-7h4v7h5V9',back:'m15 5-7 7 7 7',close:'m6 6 12 12M18 6 6 18'};
 return `<svg class="navigation-icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${paths[name]}"/></svg>`;
}
