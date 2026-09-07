import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('globe, region flight, island notes and alternate chart',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/?view=world');
  const globe=page.getByTestId('earth-globe');
  await expect(globe).toBeVisible({timeout:30000});
  await expect(globe.locator('canvas, .globe-fallback').first()).toBeVisible({timeout:15000});
  await expect(page.getByRole('button',{name:'3D globe',exact:true})).toHaveAttribute('aria-pressed','true');
  if(await page.getByLabel('Sea region',{exact:true}).isVisible())await page.getByLabel('Sea region',{exact:true}).selectOption('new-world');
  else await page.getByRole('navigation',{name:'Map regions'}).getByRole('button',{name:'New World',exact:true}).click();
  await expect(page.locator('.atlas-map-status strong')).toHaveText('New World');
  await page.getByLabel('Find a place').fill('Egghead');
  await page.locator('.atlas-place-list').getByRole('button',{name:/Egghead/}).click();
  await expect(page.locator('.atlas-note-title h2')).toHaveText('Egghead');
  await page.getByRole('button',{name:'Open field notes',exact:true}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page).toHaveURL(/location=egghead/);
  await page.getByRole('button',{name:'Close details'}).click();
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.atlas-note-title h2')).toHaveText('Egghead');
  await page.getByRole('button',{name:'Flat chart',exact:true}).click();
  await expect(page.locator('.atlas-canvas')).toBeVisible();
  await expect(globe).toHaveCount(0);
  await page.getByRole('button',{name:'Zoom in',exact:true}).click();
  await expect(page.getByRole('button',{name:'Zoom out',exact:true})).toBeEnabled();
  await page.getByRole('button',{name:'Map layers',exact:true}).click();
  await expect(page.locator('.atlas-layers')).toBeVisible();
  expect(errors).toEqual([]);
});

test('crew filters, animated portraits, details, history and saved records',async({page})=>{
  await page.goto('/?view=crew');
  await expect(page.locator('.fleet-card')).toHaveCount(46);
  await page.getByRole('searchbox',{name:'Search crews, captains, and members'}).fill('Red Hair');
  await expect(page.locator('.fleet-card')).toHaveCount(1);
  await expect(page.locator('.captain-portrait svg')).toBeVisible();
  await page.getByRole('button',{name:'Open crew record',exact:true}).click();
  const dialog=page.getByRole('dialog');
  await expect(dialog).toContainText('Red Hair Pirates');
  await page.getByRole('button',{name:'Save Red Hair Pirates',exact:true}).click();
  await dialog.locator('.detail-member').filter({hasText:'Shanks'}).click();
  await expect(dialog.locator('.wanted-portrait strong')).toHaveText('Shanks');
  await expect(page).toHaveURL(/character=shanks/);
  await page.goBack();
  await expect(dialog.locator('.crew-detail-heading h2')).toHaveText('Red Hair Pirates');
  await page.goForward();
  await expect(dialog.locator('.wanted-portrait strong')).toHaveText('Shanks');
  await page.getByRole('button',{name:'Close details'}).click();
  await expect(dialog).toBeHidden();
  await page.goto('/?view=saved');
  await expect(page.getByRole('button',{name:/crew Red Hair Pirates/})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('button',{name:/crew Red Hair Pirates/})).toBeVisible();
});

test('globe has a usable fallback when WebGL is unavailable',async({page})=>{
  await page.addInitScript(()=>{const get=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(this:HTMLCanvasElement,kind:string,...rest:unknown[]){if(kind==='webgl'||kind==='webgl2'||kind==='experimental-webgl')return null;return Reflect.apply(get,this,[kind,...rest]);} as typeof get;});
  await page.goto('/?view=world');
  await page.getByRole('button',{name:'Open flat atlas',exact:true}).click();
  await expect(page.locator('.atlas-canvas')).toBeVisible();
  await page.getByLabel('Find a place').fill('Water Seven');
  await expect(page.locator('.atlas-place-list')).toContainText('Water Seven');
});

test('motion preference disables automatic globe movement and portrait motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?view=world');
  await expect(page.getByRole('button',{name:'Auto rotate',exact:true})).toBeDisabled();
  await expect(page.getByRole('button',{name:'Play voyage',exact:true})).toBeDisabled();
  await page.goto('/?view=crew&crew=red-hair');
  await expect(page.getByRole('dialog')).toBeVisible();
  expect(await page.locator('.detail-dialog .portrait-bust').first().evaluate(el=>getComputedStyle(el).animationName)).toBe('none');
});

test('map and crew screens stay within narrow and landscape viewports',async({page})=>{
  for(const viewport of [{width:320,height:640},{width:390,height:844},{width:768,height:1024},{width:844,height:390}]){
    await page.setViewportSize(viewport);
    await page.goto('/?view=world');
    await expect(page.getByTestId('earth-globe').locator('canvas')).toBeVisible();
    await page.locator('.atlas-canvas-wrap').screenshot({path:`/tmp/odyssey-globe-${viewport.width}.png`});
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),`No horizontal overflow at ${viewport.width}px`).toBe(viewport.width);
    await page.goto('/?view=crew');
    await expect(page.locator('.fleet-card').first()).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth),`No horizontal overflow at ${viewport.width}px`).toBe(viewport.width);
  }
});

test('new atlas and crew controls pass accessibility checks',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const view of ['world','crew']){
    await page.goto(`/?view=${view}`);
    await expect(page.locator(view==='world'?'.globe-webgl':'.fleet-card').first()).toBeVisible();
    const result=await new AxeBuilder({page}).include(view==='world'?'.atlas-page':'.fleet-view').analyze();
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))}))).toEqual([]);
  }
});


test('map labels and controls stay separate at phone, tablet and desktop sizes',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  for(const viewport of [{width:320,height:640},{width:390,height:844},{width:768,height:1024},{width:1440,height:900},{width:844,height:390}]){
    await page.setViewportSize(viewport);await page.goto('/?view=world');
    const canvas=page.locator('.globe-webgl');await expect(canvas).toBeVisible();
    await expect(page.locator('.globe-place-label:visible')).toHaveCount(1);
    for(let z=0;z<4;z++){
      if(z)await page.getByRole('button',{name:'Zoom in',exact:true}).click();
      await expect.poll(async()=>page.evaluate(()=>{
        const rect=(el:Element)=>el.getBoundingClientRect();
        const overlap=(a:DOMRect,b:DOMRect)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
        const canvas=document.querySelector('.globe-webgl')!,bounds=rect(canvas);
        const labels=Array.from(document.querySelectorAll('.globe-place-label')).filter(el=>getComputedStyle(el).visibility==='visible').map(rect);
        const controls=Array.from(document.querySelectorAll('.atlas-map-tools button,.atlas-map-help button')).filter(el=>rect(el).width>0).map(rect);
        return labels.every((a,i)=>a.left>=bounds.left&&a.right<=bounds.right&&a.top>=bounds.top&&a.bottom<=bounds.bottom&&!labels.slice(i+1).some(b=>overlap(a,b)))&&controls.every(c=>!overlap(c,bounds));
      })).toBe(true);
    }
    await page.getByRole('button',{name:'Reset view',exact:true}).click();
    await page.locator('.atlas-shell').screenshot({path:`/tmp/odyssey-clear-map-${viewport.width}.png`});
    if(viewport.width<=760){
      await page.getByRole('button',{name:'Open Water Seven notes',exact:true}).click();
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button',{name:'Close details',exact:true}).click();
      await page.getByRole('button',{name:'Find an island',exact:true}).click();
      await expect(page.getByRole('searchbox',{name:'Find a place'})).toBeFocused();
    }
  }
});
