import type {Color,Level} from './levels.ts';
import type {PhysicsWorld} from './physics.ts';
export function bucketTarget(level:Level,color:Color):number{return level.goals?.[color]??level.balls.filter(ball=>ball.color===color).length;}
export function bucketDelivered(world:PhysicsWorld,color:Color):number{return world.runs.filter((run,i)=>world.states[i].done&&run.outcome==='correct'&&run.cup===color).length;}
