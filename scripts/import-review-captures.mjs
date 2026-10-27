import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,dirname,sep} from 'node:path';
const source=process.argv[2];if(!source)throw new Error('Usage: node scripts/import-review-captures.mjs <ZIP>');
const b=readFileSync(source),root=resolve('review-captures');let p=0,count=0;
while(b.readUInt32LE(p)===0x04034b50){
 const method=b.readUInt16LE(p+8),n=b.readUInt16LE(p+26),extra=b.readUInt16LE(p+28),size=b.readUInt32LE(p+18);
 const name=b.subarray(p+30,p+30+n).toString();
 if(method!==0||!(/^(bolumler\/[KU]\d+\.png|sayfalar\/[A-Za-z0-9-]+\.png|capture-manifest\.json)$/.test(name)))throw new Error('Unexpected archive entry '+name);
 const path=resolve(root,name);if(!path.startsWith(root+sep))throw new Error('Outside capture workspace');
 const start=p+30+n+extra;mkdirSync(dirname(path),{recursive:true});writeFileSync(path,b.subarray(start,start+size));p=start+size;count++;
}
writeFileSync('Color-Rings-140-Bolum.zip',b);console.log(`Updated ${count} verified-path capture files.`);

