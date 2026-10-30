/** Original upbeat electro-pop groove: plucked lead, syncopated bass and light drums. */
export const MUSIC_BPM=112;
export const MUSIC_STEP_SECONDS=60/MUSIC_BPM/4;
export type MusicNote={frequency:number;duration:number;volume:number;wave:OscillatorType;endFrequency?:number;attack?:number};
const hz=(midi:number)=>440*2**((midi-69)/12);
const chords=[[60,64,67],[55,59,62],[57,60,64],[53,57,60]];
const lead=[null,null,76,null,null,79,76,null,null,74,null,72,null,null,76,null,
 null,null,74,null,null,79,74,null,null,71,null,74,null,null,79,null,
 null,null,76,null,null,81,79,null,null,76,null,72,null,null,74,null,
 null,null,72,null,null,76,72,null,null,69,null,72,null,null,67,null];
export function musicNotes(step:number):MusicNote[]{
 const beat=step%16,chord=chords[Math.floor(step/16)%4],notes:MusicNote[]=[];
 if(beat%4===0)notes.push({frequency:140,endFrequency:48,duration:.11,volume:.026,wave:'sine',attack:.003});
 if([0,3,8,11].includes(beat))notes.push({frequency:hz(chord[0]-12+(beat===11?7:0)),duration:.15,volume:.018,wave:'triangle',attack:.005});
 if(beat===4||beat===12)notes.push({frequency:hz(chord[1]),duration:.12,volume:.008,wave:'triangle',attack:.004},{frequency:hz(chord[2]),duration:.14,volume:.007,wave:'sine',attack:.004});
 if(beat%4===2)notes.push({frequency:2300,duration:.022,volume:.002,wave:'triangle',attack:.002});
 const pitch=lead[step%64];if(pitch!==null)notes.push({frequency:hz(pitch+(Math.floor(step/64)%2&&beat===14?12:0)),duration:.19,volume:.016,wave:'triangle',attack:.006});
 return notes;
}
