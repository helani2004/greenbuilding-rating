import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';import {evaluate} from '../shared/engine.mjs';
const standard=JSON.parse(readFileSync(new URL('../shared/standard.json',import.meta.url)));
const prerequisites=Object.fromEntries(standard.categories[0].prerequisites.map(p=>[p.id,{answer:'yes',evidenceId:'stored-file'}]));
test('one incomplete prerequisite locks every credit',()=>{const a={...prerequisites,'MN-P4':{answer:'no',evidenceId:'stored-file'},'MN-C1':{answer:'yes',evidenceId:'stored-file'}};assert.equal(evaluate(standard,a).total,0);assert.equal(evaluate(standard,a).categories[0].unlocked,false);});
test('Yes without evidence does not achieve prerequisite',()=>{const a={...prerequisites,'MN-P1':{answer:'yes'}};assert.equal(evaluate(standard,a).categories[0].unlocked,false);});
test('eligible credits add to four and revocation removes points',()=>{const a={...prerequisites,...Object.fromEntries(standard.categories[0].credits.map(c=>[c.id,{answer:'yes',evidenceId:'stored-file'}]))};assert.equal(evaluate(standard,a).total,4);a['MN-P1'].answer='no';assert.equal(evaluate(standard,a).total,0);});
test('allocation is 100 and demonstration never produces final report',()=>{const result=evaluate(standard,prerequisites);assert.equal(result.maxPoints,100);assert.equal(result.finalReportAvailable,false);});
