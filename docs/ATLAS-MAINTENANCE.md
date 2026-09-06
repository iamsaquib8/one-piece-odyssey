# Maintaining the globe and crews

## Atlas files

- `src/components/atlas-model.ts`: flat chart coordinates, parent settings, camera bounds, region presets, manga voyage stops.
- `src/components/globe-model.ts`: schematic sphere coordinates and region viewing angles. Never imply these are canonical latitude/longitude. God Valley is intentionally excluded from globe placement while its field notes remain searchable.
- `src/components/globe-art.ts`: original procedural ocean texture and low-poly landmark models. Extend `createLandmark` with recognizable silhouettes when adding major destinations.
- `src/components/GlobeView.tsx`: rendering lifecycle, orbit input, raycast selection, label projection, camera flights, motion and WebGL fallback. Dispose new geometry, materials and textures on unmount.
- `src/components/WorldAtlas.tsx`: projection switch, routes, filters, inspector, URL selection, saved locations and voyage playback.
- `src/atlas.css`: desktop and mobile chart composition.

A new location needs an entry in the existing location data and either an atlas anchor or a parent setting. Main locations need a sphere coordinate and a landmark model. Locations with unrevealed positions must remain in the searchable list without fabricated globe coordinates. Run the model tests to catch unplaced entries accidentally falling to 0°, 0°.

The 3D bundle loads only when globe view is requested. Rendering is demand-driven when idle, with a capped device pixel ratio. Automatic rotation starts only when requested and follows the motion preference. Keep the full chart/list usable when WebGL fails. The production build currently warns about the Three.js and detailed-reader chunks; the globe bundle is approximately 139 kB gzip.

## Crew records and portraits

`src/data/crews.ts` owns groups, relevance, arc relationships, sources and `crewCoverageThrough` (1126). `other-characters.ts` adds supporting profiles to the original Straw Hat data. `all-characters.ts` is the unified detail/search lookup. Keep the Straw Hat-only roster logic in `crew-roster.ts` separate: expanding that input would wrongly put rivals aboard Luffy's ship.

To add a group, create a stable crew ID, register key members, add a first-appearance value, source the chapter references, and add portrait recipes in `CharacterPortrait.tsx`. Use `factions` for non-pirate organizations. Membership may include former members, and profiles must say so. Relevance is an editorial reading order, not a strength score. The broader manga reader has a different coverage horizon; advance the crew horizon only after reviewing its records.

Links use `?view=crew&crew=red-hair`, `?character=shanks`, and `?view=world&mapPlace=egghead`. Saves use `crew:<id>`, alongside existing arc/location/character keys. Never rename an ID without migrating saved and shared links.

## Verification

Run type checking, content validation, Vitest, a production build, then Playwright. The atlas/crew suite tests globe rendering and region flights, selecting islands and reopening notes, alternate-chart fallback, crew search and profiles, Back/Forward and saved records, reduced motion, 320/390/768px and phone-landscape layouts, and axe checks including contrast. The full suite also covers the existing journey, arc reader and notices.

In a sandbox that disallows tsx's IPC socket, use `node --import tsx scripts/build-index.ts` and `node --import tsx scripts/validate.ts`; these execute the same project scripts without the CLI's socket. Browser tests require local-server/browser permissions.


### Verified 6 September 2026

Type checking and the production build passed. Vitest: 22/22. Playwright: 36/36 across desktop Chromium and Pixel 7 emulation, including new-screen axe contrast checks. Content validation resolves 70 locations, 113 character profiles and 46 crews/factions. Manual browser inspection at localhost:5173 confirmed the globe and Red Hair Pirates overlay with no console warnings/errors. Mobile globe screenshots were also inspected. A new Lighthouse score was not measured in this pass. These changes are local; this pass did not deploy them.
