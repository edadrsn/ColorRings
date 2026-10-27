export type ZipEntry={name:string;data:Uint8Array};
export function crc32(bytes:Uint8Array):number{let crc=0xffffffff;for(const byte of bytes){crc^=byte;for(let bit=0;bit<8;bit++)crc=(crc>>>1)^((crc&1)?0xedb88320:0);}return (crc^0xffffffff)>>>0;}
/** Uncompressed ZIP, ASCII file names, no external library or network request. */
export function zipStore(entries:ZipEntry[]):Uint8Array{
  const encoder=new TextEncoder(),files=entries.map(e=>({...e,fileName:encoder.encode(e.name),crc:crc32(e.data)}));
  const localSize=files.reduce((n,f)=>n+30+f.fileName.length+f.data.length,0),directorySize=files.reduce((n,f)=>n+46+f.fileName.length,0);
  const bytes=new Uint8Array(localSize+directorySize+22),view=new DataView(bytes.buffer);let offset=0,directory=localSize;
  for(const f of files){const at=offset;view.setUint32(at,0x04034b50,true);view.setUint16(at+4,20,true);view.setUint16(at+12,33,true);view.setUint32(at+14,f.crc,true);view.setUint32(at+18,f.data.length,true);view.setUint32(at+22,f.data.length,true);view.setUint16(at+26,f.fileName.length,true);bytes.set(f.fileName,at+30);bytes.set(f.data,at+30+f.fileName.length);offset+=30+f.fileName.length+f.data.length;
    const c=directory;view.setUint32(c,0x02014b50,true);view.setUint16(c+4,20,true);view.setUint16(c+6,20,true);view.setUint16(c+14,33,true);view.setUint32(c+16,f.crc,true);view.setUint32(c+20,f.data.length,true);view.setUint32(c+24,f.data.length,true);view.setUint16(c+28,f.fileName.length,true);view.setUint32(c+42,at,true);bytes.set(f.fileName,c+46);directory+=46+f.fileName.length;
  }
  view.setUint32(directory,0x06054b50,true);view.setUint16(directory+8,files.length,true);view.setUint16(directory+10,files.length,true);view.setUint32(directory+12,directorySize,true);view.setUint32(directory+16,localSize,true);return bytes;
}
