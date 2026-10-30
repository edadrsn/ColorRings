import {test} from 'node:test';
import assert from 'node:assert/strict';
import {EXTRA_TRANSLATIONS} from '../src/translations-extra.ts';
import {LANGUAGES,translate,translationRows,loadLanguage,saveLanguage} from '../src/i18n.ts';
test('Italian and Dutch cover every canonical English catalog entry explicitly',()=>{
 const rows=EXTRA_TRANSLATIONS.trim().split('\n').map(line=>line.split('|')),keys=new Set<string>();
 for(const row of rows){assert.equal(row.length,3,row[0]);assert.ok(row.every(value=>value.trim()),row[0]);assert.ok(!keys.has(row[0]),row[0]);keys.add(row[0]);}
 for(const row of translationRows)assert.ok(keys.has(row[1]),row[1]);
});
test('new languages translate actual controls, objectives and save across sessions',()=>{
 let saved='';const storage={getItem:()=>saved,setItem:(_key:string,value:string)=>{saved=value;}};
 for(const language of ['it','nl'] as const){assert.ok(LANGUAGES.some(l=>l.id===language));saveLanguage(storage,language);assert.equal(loadLanguage(storage),language);}
 assert.equal(translate('Ayarlar','it'),'Impostazioni');assert.equal(translate('Play','it'),'Gioca');assert.equal(translate('Bölümler','nl'),'Levels');assert.equal(translate('Play','nl'),'Spelen');
 assert.equal(translate('3 hamle · hedef 2','it'),'3 mosse · obiettivo 2');assert.equal(translate('3 hamle · hedef 2','nl'),'3 zetten · doel 2');
});
