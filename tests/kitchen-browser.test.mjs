import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=require('playwright');}catch{}
const file=name=>fileURLToPath(new URL('../public/'+name,import.meta.url));

test('Kitchen: one-tap plan, cart calculations, cookbook and responsive behavior', {skip:!playwright,timeout:90000},async()=>{
  const browser=await playwright.chromium.launch({headless:true,...(process.env.CRISTYBREATHE_TEST_CHROMIUM?{executablePath:process.env.CRISTYBREATHE_TEST_CHROMIUM}:{})});
  try{
    for(const width of [1440,390,320]){
      const page=await browser.newPage({viewport:{width,height:850}});
      const errors=[];
      page.on('pageerror',err=>errors.push(err.message));
      await page.setContent('<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#e9ede6"><main id="main" style="max-width:1120px;margin:auto;padding:30px 23px"></main></body></html>');
      await page.addStyleTag({path:file('kitchen.css')});
      await page.addScriptTag({path:file('kitchen-core.js')});
      await page.addScriptTag({path:file('kitchen-ui.js')});
      await page.evaluate(()=>{document.getElementById('main').innerHTML=CristyKitchenUI.render();CristyKitchenUI.bind(document.getElementById('main'));});
      assert.equal(await page.getByRole('heading',{name:'Dinner, taken care of.'}).isVisible(),true);
      await page.getByRole('button',{name:/Prepare my week/}).click();
      assert.equal(await page.getByRole('heading',{name:'Your week, beautifully handled.'}).isVisible(),true);
      await page.getByRole('button',{name:/See groceries/}).click();
      assert.equal(await page.getByRole('heading',{name:'Your grocery bag.'}).isVisible(),true);
      assert.equal(await page.getByText('3 × 1 lb bag').count()>0,true);
      await page.locator('[data-kt-pantry="rice"]').check();
      assert.equal(await page.locator('[data-kt-pantry="rice"]').isChecked(),true);
      await page.getByRole('button',{name:'This week'}).click();
      await page.getByRole('button',{name:/Swap Thursday/}).click();
      assert.equal(await page.getByText('Thursday changed. Grocery quantities and cookbook updated.').isVisible(),true);
      await page.getByRole('button',{name:/Open cookbook/}).click();
      assert.equal(await page.getByRole('button',{name:'Print / Save the cookbook'}).isVisible(),true);
      assert.equal(await page.locator('.kt-print-recipe').count(),6);
      await page.emulateMedia({media:'print'});
      assert.equal(await page.locator('.kt-print-only').evaluate(el=>getComputedStyle(el).display!=='none'),true);
      await page.emulateMedia({media:'screen'});
      await page.locator('[data-kt-action="cook-lemon-chicken"]').first().click();
      assert.equal(await page.getByText('STEP 1 / 4').isVisible(),true);
      await page.getByRole('button',{name:/Next step/}).click();
      assert.equal(await page.getByText('STEP 2 / 4').isVisible(),true);
      assert.deepEqual(errors,[]);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'horizontal overflow at '+width);
      await page.close();
    }
  }finally{await browser.close();}
});
