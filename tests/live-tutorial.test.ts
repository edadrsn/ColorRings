import {test} from 'node:test';
import assert from 'node:assert/strict';
import {LiveTutorial} from '../src/live-tutorial.ts';
test('live lesson requires actual in-motion rotation and correct delivery',()=>{const lesson=new LiveTutorial();lesson.rotate(false);assert.equal(lesson.view?.step,1);lesson.deliver(false);assert.equal(lesson.complete,false);lesson.rotate(true);assert.equal(lesson.view?.step,2);lesson.deliver(true);assert.equal(lesson.complete,true);assert.equal(lesson.view,null);});
test('live teaching can be deliberately skipped and accepts delivery before rotation',()=>{const lesson=new LiveTutorial();lesson.deliver(true);assert.equal(lesson.complete,false);lesson.rotate(true);assert.equal(lesson.complete,true);const skipped=new LiveTutorial();skipped.skip();assert.equal(skipped.complete,true);});
