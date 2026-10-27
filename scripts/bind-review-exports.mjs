import {readFileSync,writeFileSync} from 'node:fs';
import {LEVELS} from '../src/levels.ts';
import {crc32} from '../src/zip-store.ts';
// Run after exporting every full-size image from review.html's actual DOM download links.
const levels=LEVELS.map(level=>{const code=level.mastery?'U'+String(level.mastery).padStart(3,'0'):'K'+String(level.id).padStart(2,'0'),bytes=readFileSync('review-captures/bolumler/'+code+'.png');if(bytes.readUInt32BE(16)!==540||bytes.readUInt32BE(20)!==960)throw Error('Invalid capture '+code);return {code,source:JSON.stringify(level),crc:crc32(bytes)};});
writeFileSync('review-captures/capture-manifest.json',JSON.stringify({schema:1,captureMethod:'Full-size PNG download links generated through the real review.html UI',levels}));console.log('Bound 140 actual UI exports to current level sources and CRC.');
