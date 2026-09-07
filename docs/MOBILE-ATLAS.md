# Mobile atlas and overlap fixes

The map no longer places the zoom stack, heading, auto-rotate button or minimap over the planet. Controls have a dedicated row; layers expand above the map instead of obscuring it. On phones, a native region selector replaces the small row of region buttons. The selected location can open directly from the strip below the globe, alongside a search shortcut.

`src/components/map-labels.ts` prioritizes the selected destination, clamps measured label rectangles to the visible map and drops labels that collide. The full-world view shows only the selected name; zoom reveals additional names, with a smaller budget on phones. Canvas width controls both the camera framing and label density.

`src/components/GlobeView.tsx` caches label dimensions per viewport. `WorldAtlas.tsx` owns controls and the selected location. `src/atlas.css` owns the map's responsive composition; `src/styles.css` includes narrow-header and tablet-footer fixes. The existing single detail overlay and native document scroll remain the reading/navigation owners.

Verification: `tests/atlas-mobile.spec.ts` checks globe controls, notes, region changes, flat-chart fallback, accessibility including contrast, horizontal overflow, measured label overlap and controls staying outside the canvas. Screen widths include 320, 390, 768 and 1440px, plus 844×390 phone landscape. `map-labels.test.ts` covers long labels at boundaries and the zoom-based density limits. Build before running Playwright, which tests the production preview.

Flat-chart artwork has its own regression check: every rendered landmark must stay within its intended marker size, remain attached to its map anchor, and avoid intersecting other landmark bounds at 100–250% zoom on desktop and phones. `MapIsland` needs explicit SVG width/height attributes; CSS dimensions alone let nested viewports expand to the outer chart. Its transform must use the map coordinate space (`view-box`), rather than the landmark's varying painted bounds (`fill-box`). The Florian Triangle and Marineford schematic anchors leave room for their neighbouring scenes.
