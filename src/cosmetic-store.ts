import type {Progress} from './progress.ts';
import {iconArt} from './ui-art.ts';
/** Earned coins only. This view has no external transaction/provider hooks. */
export function cosmeticStoreMarkup(progress:Progress){return `<div class="cosmetic-store"><p class="menu-summary">✦ ${progress.coins} altın</p><div class="mode-list"><button data-cosmetic="skins"><span class="mode-art">${iconArt('collection')}</span><strong>Top görünümleri</strong></button><button data-cosmetic="themes"><span class="mode-art">${iconArt('star')}</span><strong>Themes</strong></button><button data-cosmetic="palettes"><span class="mode-art">${iconArt('collection')}</span><strong>Renk paletleri</strong></button></div></div>`;}
