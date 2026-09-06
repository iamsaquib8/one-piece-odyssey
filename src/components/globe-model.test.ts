import {describe,it,expect} from 'vitest';
import {globePlaces,globePlaceById,spherePoint} from './globe-model';
import {atlasPlaces} from './atlas-model';
describe('schematic planet',()=>{
  it('keeps unknown geography off the globe while retaining searchable field notes',()=>{
    expect(atlasPlaces.some(p=>p.id==='god-valley')).toBe(true);
    expect(globePlaceById.has('god-valley')).toBe(false);
    expect(globePlaceById.has('laugh-tale')).toBe(false);
    expect(globePlaces.filter(p=>p.lat===0&&p.lon===0)).toEqual([]);
  });
  it('places landmarks on the sphere and keeps detail locations near their setting',()=>{
    for(const p of globePlaces)expect(Math.hypot(...spherePoint(p))).toBeCloseTo(2.5,8);
    const w=globePlaceById.get('water-seven')!,g=globePlaceById.get('galley-la-headquarters')!;
    expect(Math.abs(w.lon-g.lon)).toBeLessThan(5);expect(Math.abs(w.lat-g.lat)).toBeLessThan(5);
  });
});
