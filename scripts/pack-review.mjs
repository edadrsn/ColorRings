import {readFileSync,writeFileSync,readdirSync} from 'node:fs';
import {join} from 'node:path';
import {zipStore} from '../src/zip-store.ts';
const entries=[];
function add(root,prefix=''){for(const file of readdirSync(root,{withFileTypes:true})){const local=join(root,file.name),name=prefix+file.name;if(file.isDirectory())add(local,name+'/');else entries.push({name,data:readFileSync(local)});}}
add('review-captures');
for(const [path,name] of [['gameplay-polish/LEVEL_VALIDATION.md','LEVEL_VALIDATION.md'],['gameplay-polish/difficulty.json','difficulty.json'],['GAMEPLAY_POLISH.md','GAMEPLAY_POLISH.md']])entries.push({name,data:readFileSync(path)});
writeFileSync('Color-Rings-140-Bolum.zip',zipStore(entries));console.log(`Self-contained gallery archive: ${entries.length} files.`);
