import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const scope={};
runInNewContext(readFileSync(new URL('../public/kitchen-core.js',import.meta.url),'utf8'),{globalThis:scope});
const core=scope.CristyKitchenCore;
const row=(plan,id)=>plan.items.find(i=>i.id===id);

test('one tap yields five distinct family recipes and an unpriced private draft',()=>{
  const p=core.makePlan();
  assert.equal(p.meals.length,5);
  assert.equal(p.servings,6);
  assert.equal(p.version,1);
  assert.equal(new Set(p.meals.map(m=>m.id)).size,5);
  assert.equal(p.priced,false);
  assert.equal(p.retailerConnected,false);
  assert.equal(p.shoppingItems.length,p.items.length);
  assert.ok(p.meals.every(m=>m.steps.length>=4));
});

test('combines common ingredients and rounds actual packages upward',()=>{
  const p=core.makePlan();
  assert.equal(row(p,'chicken').required,5);
  assert.equal(row(p,'chicken').packages,5);
  assert.equal(row(p,'rice').required,2.75);
  assert.equal(row(p,'rice').packages,3);
  assert.equal(row(p,'beans').required,4);
  assert.equal(row(p,'beans').packages,4);
  assert.equal(row(p,'tortillas').required,15);
  assert.equal(row(p,'tortillas').packages,2);
  assert.equal(row(p,'oil').packages,1);
  assert.deepEqual([...row(p,'rice').recipes],['fajita-bowls','vegetable-fried-rice']);
});

test('swap changes the meal and recalculates ingredient quantities without stale amounts',()=>{
  const original=core.makePlan();
  const swapped=core.swap(original,3,'mustard-chicken');
  assert.equal(swapped.version,2);
  assert.equal(swapped.meals[3].id,'mustard-chicken');
  assert.equal(row(swapped,'rice').required,1.25);
  assert.equal(row(swapped,'rice').packages,2);
  assert.equal(row(swapped,'mustard').required,3);
  assert.equal(original.meals[3].id,'fajita-bowls');
  assert.equal(row(original,'rice').required,2.75);
});

test('portion adjustment changes all ingredient quantities deterministically',()=>{
  const p=core.changeServings(core.makePlan(),8);
  assert.equal(p.servings,8);
  assert.equal(p.version,2);
  assert.equal(p.meals[0].servings,8);
  assert.equal(row(p,'chicken').required,6.67);
  assert.equal(row(p,'chicken').packages,7);
  assert.equal(row(p,'tortillas').packages,2);
});

test('pantry confirmation excludes only confirmed items and keeps recipe requirement',()=>{
  const original=core.makePlan();
  const adjusted=core.setPantry(original,'rice',true);
  assert.equal(adjusted.version,2);
  assert.equal(row(adjusted,'rice').have,true);
  assert.ok(!adjusted.shoppingItems.some(i=>i.id==='rice'));
  assert.ok(original.shoppingItems.some(i=>i.id==='rice'));
  const restored=core.setPantry(adjusted,'rice',false);
  assert.ok(restored.shoppingItems.some(i=>i.id==='rice'));
  assert.equal(restored.version,3);
});

test('exclusions, unknown items, repeats and invalid servings fail closed',()=>{
  assert.throws(()=>core.makePlan({excluded:['garlic']}),/excluded ingredient/);
  assert.throws(()=>core.makePlan({excluded:['imaginary']}),/unknown/);
  assert.throws(()=>core.makePlan({pantry:['imaginary']}),/unknown/);
  assert.throws(()=>core.makePlan({servings:3}),/between 4 and 10/);
  assert.throws(()=>core.makePlan({mealIds:['beef-tacos','beef-tacos','beef-tacos','beef-tacos','beef-tacos']}),/different dinners/);
  assert.throws(()=>core.swap(core.makePlan(),2,'unknown'),/available recipe/);
});

test('copy text never claims store pricing or a created cart',()=>{
  const txt=core.listText(core.makePlan());
  assert.match(txt,/Unpriced draft/);
  assert.match(txt,/No retailer cart has been created/);
  assert.match(txt,/Boneless chicken thighs/);
});