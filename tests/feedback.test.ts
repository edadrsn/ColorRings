import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DeliveryCombo,interpolateRotation} from '../src/presentation.ts';
import {PhysicsWorld,DT} from '../src/physics.ts';

test('visual rotation follows the short arc across zero without overshooting',()=>{
  assert.equal(interpolateRotation(359,1,.5),0);
  assert.equal(interpolateRotation(1,359,.5),0);
  assert.equal(interpolateRotation(10,40,-1),10);
  assert.equal(interpolateRotation(10,40,2),40);
});
test('combo groups quick successful deliveries and resets after waiting or a mistake',()=>{
  const combo=new DeliveryCombo();
  assert.equal(combo.deliver(1,true),1);
  assert.equal(combo.deliver(2,true),2);
  assert.equal(combo.deliver(2,true),3);
  assert.equal(combo.deliver(6,true),1);
  assert.equal(combo.deliver(6.1,false),0);
  assert.equal(combo.deliver(6.2,true),1);
  combo.reset();assert.equal(combo.deliver(6.3,true),1);
});
test('render angles retain the last physics step and cloning does not share them',()=>{
  const world=new PhysicsWorld([359,0]);world.setAngles([5,0]);world.advance(DT*2.5);
  assert.equal(world.previousAngles[0],1);assert.equal(world.angles[0],3);
  assert.ok(Math.abs(world.renderAlpha-.5)<1e-8);
  assert.equal(interpolateRotation(world.previousAngles[0],world.angles[0],world.renderAlpha),2);
  const copy=world.clone();assert.deepEqual(copy.previousAngles,world.previousAngles);
  copy.previousAngles[0]=300;assert.equal(world.previousAngles[0],1);
});
