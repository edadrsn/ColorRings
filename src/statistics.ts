import type {Progress} from './progress.ts';
export function recordVictory(progress:Progress,moves:number){progress.statistics.wins++;progress.statistics.moves+=moves;}
export function statisticsView(progress:Progress){
  return {completed:progress.completed.length,stars:Object.values(progress.stars).reduce((sum,s)=>sum+s,0),perfect:progress.perfect.length,averageMoves:progress.statistics.wins?progress.statistics.moves/progress.statistics.wins:null,noHints:progress.noHintWins.length,seconds:progress.statistics.seconds,challenges:Object.keys(progress.challengeStars).length,measuredWins:progress.statistics.wins};
}
export function liveScore(moves:number,seconds:number,balls:number):number{return Math.max(100,Math.round(1000+balls*100-moves*35-seconds*10));}
