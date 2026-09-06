import {expect,it} from 'vitest';
import {atlasPlaces,clampCamera,zoomAt,HOME_CAMERA} from './atlas-model';
it('keeps zoom and camera inside the chart after extreme pan/pinch input',()=>{
  expect(clampCamera({x:-999,y:9999,zoom:99})).toEqual({x:300,y:1225,zoom:4});
  expect(clampCamera({x:0,y:0,zoom:.1})).toEqual(HOME_CAMERA);
});
it('keeps the cursor world point anchored when zooming in',()=>{
  expect(zoomAt(HOME_CAMERA,2,{x:1500,y:800})).toEqual({x:1350,y:750,zoom:2});
});
it('maps ships as destinations and places sublocations near their parent',()=>{
  const water=atlasPlaces.find(p=>p.id==='water-seven')!;
  const galley=atlasPlaces.find(p=>p.id==='galley-la-headquarters')!;
  expect(atlasPlaces.find(p=>p.id==='baratie')?.major).toBe(true);
  expect(Math.hypot(water.x-galley.x,water.y-galley.y)).toBeLessThan(180);
});
