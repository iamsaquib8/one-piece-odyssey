import {expect,it} from 'vitest';
import {layoutMapLabels,labelsOverlap,mapLabelBudget} from './map-labels';
it('keeps long labels inside narrow canvases without overlap, prioritizing selection',()=>{
  const result=layoutMapLabels([
    {id:'nearby',x:80,y:80,width:160,height:44,priority:1},
    {id:'selected',x:15,y:90,width:210,height:44,priority:10},
    {id:'edge',x:310,y:410,width:140,height:44,priority:2},
  ],320,420,3);
  expect(result[0].id).toBe('selected');expect(result.map(b=>b.id)).not.toContain('nearby');
  for(const box of result){expect(box.left).toBeGreaterThanOrEqual(12);expect(box.left+box.width).toBeLessThanOrEqual(308);expect(box.top+box.height).toBeLessThanOrEqual(408);}
  expect(labelsOverlap(result[0],result[1])).toBe(false);
});
it('starts quiet and reveals fewer names on phones as the reader zooms',()=>{
  expect(mapLabelBudget(1400,1)).toBe(1);expect(mapLabelBudget(320,1)).toBe(1);
  expect(mapLabelBudget(390,2)).toBe(2);expect(mapLabelBudget(390,3)).toBe(3);expect(mapLabelBudget(1000,3)).toBe(7);
});
