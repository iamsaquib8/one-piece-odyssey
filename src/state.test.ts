import { describe, expect, it } from 'vitest';
import { decodeReader, readReader, saveReader, decodeRoute, encodeRoute, toggleItem, isLegacyUrl, canonicalUrl } from './state';
describe('device-local logbook', () => {
  it('preserves old saves and defaults existing readers to the full edition', () => {
    const reader = decodeReader('{"version":1,"saved":["arc:wano"],"explored":["romance-dawn"]}');
    expect(reader.saved).toEqual(['arc:wano']);
    expect(reader.explored).toEqual(['romance-dawn']);
    expect(reader.spoilerThrough).toBe(null);
  });
  it('persists a reading horizon and fails closed for malformed values', () => {
    expect(decodeReader('{"version":1,"spoilerThrough":7}').spoilerThrough).toBe(7);
    for (const value of [-1, 'all', {}, 7.5]) {
      expect(decodeReader(JSON.stringify({version: 1, spoilerThrough: value})).spoilerThrough).toBe(0);
    }
  });
  it('recovers from corrupt, unavailable and malformed storage', () => {
    expect(decodeReader('{bad').saved).toEqual([]);
    expect(decodeReader('{"version":1,"saved":[1,"arc:alabasta"],"resume":{"y":-12}}').resume.y).toBe(0);
    expect(readReader({getItem(){throw new Error('disabled')}}).explored).toEqual([]);
    expect(saveReader({setItem(){throw new Error('quota')}}, decodeReader(null))).toBe(false);
  });
  it('toggles identifiers without duplicates or changing other items', () => {
    expect(toggleItem(['arc:alabasta'], 'arc:alabasta')).toEqual([]);
    expect(toggleItem(['arc:alabasta'], 'location:water-seven')).toEqual(['arc:alabasta','location:water-seven']);
  });
});
describe('shareable navigation', () => {
  it('round trips discovery views without accepting a shared spoiler override', () => {
    expect(decodeRoute('?view=trails&spoilerThrough=400')).toEqual({view: 'trails'});
    expect(decodeRoute(encodeRoute({view: 'mysteries'}))).toEqual({view: 'mysteries'});
  });
  it('round-trips crew profiles and preserves the originating view',()=>{
    const route={view:'crew' as const,kind:'crew' as const,id:'red-hair'};
    expect(decodeRoute(encodeRoute(route))).toEqual(route);
  });
  it('round-trips story beats with the originating world view', () => {
    const route = {view:'world' as const, kind:'arc' as const, id:'alabasta', beat:'rain-returns'};
    expect(decodeRoute(encodeRoute(route))).toEqual(route);
  });
  it('keeps a committed search query only on the search view', () => {
    expect(decodeRoute(encodeRoute({view:'search', q:'water seven'}))).toEqual({view:'search', q:'water seven'});
    expect(decodeRoute('?q=arlong')).toEqual({view:'journey'});
  });
  it('uses journey for unknown views, retaining invalid ids for recovery UI', () => {
    expect(decodeRoute('?view=garbage&location=missing')).toEqual({view:'journey', kind:'location', id:'missing'});
  });
  it('round-trips the legal view so terms and disclaimer stay linkable', () => {
    expect(decodeRoute('/legal/')).toEqual({view:'legal'});
    expect(encodeRoute({view:'legal'})).toBe('/legal/');
  });
  it('gives every record and view its own path', () => {
    expect(encodeRoute({view:'journey'})).toBe('/');
    expect(encodeRoute({view:'journey', kind:'arc', id:'wano', beat:'onigashima'})).toBe('/arc/wano/?beat=onigashima');
    expect(encodeRoute({view:'trails', kind:'character', id:'luffy'})).toBe('/character/luffy/?view=trails');
    expect(encodeRoute({view:'crew'})).toBe('/crew/');
    expect(decodeRoute('/crew/red-hair')).toEqual({view:'journey', kind:'crew', id:'red-hair'});
    expect(decodeRoute('/crew')).toEqual({view:'crew'});
  });
  it('falls back to the journey for paths it does not know', () => {
    for (const url of ['/arc', '/nowhere/', '/arc/wano/extra', '/view/crew']) expect(decodeRoute(url)).toEqual({view:'journey'});
  });
  it('still opens links shared before paths existed, and rewrites them', () => {
    expect(decodeRoute('/?view=world&arc=alabasta&beat=rain-returns')).toEqual({view:'world', kind:'arc', id:'alabasta', beat:'rain-returns'});
    expect(isLegacyUrl('/?arc=wano')).toBe(true);
    expect(isLegacyUrl('/arc/wano/')).toBe(false);
    expect(isLegacyUrl('/?mapPlace=egghead')).toBe(false);
    expect(canonicalUrl('/?view=mysteries')).toBe('/mysteries/');
    expect(canonicalUrl('/?view=world&mapPlace=egghead')).toBe('/world/?mapPlace=egghead');
  });
});
