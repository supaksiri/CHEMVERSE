import test from 'node:test';
import assert from 'node:assert/strict';
import { ScientificEngine } from '../src/engine.js';

const near=(actual,expected,tolerance)=>assert.ok(Math.abs(actual-expected)<=tolerance,`${actual} is not within ${tolerance} of ${expected}`);

test('0.100 M HCl starts at pH 1',()=>{const e=new ScientificEngine('titration');near(e.snapshot().pH,1,.001)});
test('strong acid/base equivalence is pH 7',()=>{const e=new ScientificEngine('titration');e.add(25);near(e.snapshot().pH,7,.001)});
test('base excess raises pH',()=>{const e=new ScientificEngine('titration');e.add(30);assert.ok(e.snapshot().pH>11)});
test('AgCl theoretical mass follows limiting reagent',()=>{const e=new ScientificEngine('precipitation');e.add(20);near(e.snapshot().precipitateMass,.286642,.00001)});
test('extra chloride remains after equivalence',()=>{const e=new ScientificEngine('precipitation');e.add(30);assert.ok(e.snapshot().species['Cl⁻']>0)});
test('hydrogen volume approaches stoichiometric limit',()=>{const e=new ScientificEngine('gas');e.add(10);for(let i=0;i<30;i++)e.advance(5);assert.ok(e.snapshot().gasVolume>45)});
test('closed gas apparatus increases pressure',()=>{const e=new ScientificEngine('gas');e.closed=true;e.add(10);e.advance(50);assert.ok(e.snapshot().pressure>1)});
test('KI increases the H2O2 model rate',()=>{const e=new ScientificEngine('kinetics');const slow=e.snapshot().rate;e.add(1);assert.ok(e.snapshot().rate>slow)});
test('temperature increases kinetics rate',()=>{const e=new ScientificEngine('kinetics');e.add(1);const cold=e.snapshot().rate;e.setTemperature(45);assert.ok(e.snapshot().rate>cold)});
test('equilibrium produces complex and absorbance',()=>{const e=new ScientificEngine('equilibrium');e.add(10);assert.ok(e.snapshot().species['FeSCN²⁺']>0);assert.ok(e.snapshot().absorbance>0)});
test('burette is interlocked until authentic setup is complete',()=>{const e=new ScientificEngine('titration');assert.equal(e.startFlow(),false);e.apparatusAction('transferSample');e.apparatusAction('fillBurette');e.apparatusAction('calibrateProbe');e.apparatusAction('placeProbe');assert.equal(e.startFlow(),true)});
test('real-time flow updates dose and pH from one state',()=>{const e=new ScientificEngine('titration');['transferSample','fillBurette','calibrateProbe','placeProbe'].forEach(x=>e.apparatusAction(x));e.startFlow(1);for(let i=0;i<250;i++)e.tick(.1);e.stopFlow();near(e.snapshot().added,25,.02);near(e.snapshot().pH,7,.15);assert.ok(e.snapshot().history.length>20)});
