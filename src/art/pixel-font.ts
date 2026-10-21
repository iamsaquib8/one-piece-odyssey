// A 5×7 bitmap font drawn as SVG paths. Share images are rendered at build time by librsvg
// and posters are rasterised from a data: URL in the browser; neither can load the site's
// web fonts, so lettering is drawn as pixels like everything else on the site.

const ROWS = 7;
const WIDTH = 5;

const GLYPHS: Record<string, string> = {
  A: '.###.|#...#|#...#|#####|#...#|#...#|#...#',
  B: '####.|#...#|#...#|####.|#...#|#...#|####.',
  C: '.###.|#...#|#....|#....|#....|#...#|.###.',
  D: '####.|#...#|#...#|#...#|#...#|#...#|####.',
  E: '#####|#....|#....|####.|#....|#....|#####',
  F: '#####|#....|#....|####.|#....|#....|#....',
  G: '.###.|#...#|#....|#.###|#...#|#...#|.####',
  H: '#...#|#...#|#...#|#####|#...#|#...#|#...#',
  I: '.###.|..#..|..#..|..#..|..#..|..#..|.###.',
  J: '..###|...#.|...#.|...#.|...#.|#..#.|.##..',
  K: '#...#|#..#.|#.#..|##...|#.#..|#..#.|#...#',
  L: '#....|#....|#....|#....|#....|#....|#####',
  M: '#...#|##.##|#.#.#|#.#.#|#...#|#...#|#...#',
  N: '#...#|#...#|##..#|#.#.#|#..##|#...#|#...#',
  O: '.###.|#...#|#...#|#...#|#...#|#...#|.###.',
  P: '####.|#...#|#...#|####.|#....|#....|#....',
  Q: '.###.|#...#|#...#|#...#|#.#.#|#..#.|.##.#',
  R: '####.|#...#|#...#|####.|#.#..|#..#.|#...#',
  S: '.####|#....|#....|.###.|....#|....#|####.',
  T: '#####|..#..|..#..|..#..|..#..|..#..|..#..',
  U: '#...#|#...#|#...#|#...#|#...#|#...#|.###.',
  V: '#...#|#...#|#...#|#...#|#...#|.#.#.|..#..',
  W: '#...#|#...#|#...#|#.#.#|#.#.#|#.#.#|.#.#.',
  X: '#...#|#...#|.#.#.|..#..|.#.#.|#...#|#...#',
  Y: '#...#|#...#|.#.#.|..#..|..#..|..#..|..#..',
  Z: '#####|....#|...#.|..#..|.#...|#....|#####',
  '0': '.###.|#...#|#..##|#.#.#|##..#|#...#|.###.',
  '1': '..#..|.##..|..#..|..#..|..#..|..#..|.###.',
  '2': '.###.|#...#|....#|...#.|..#..|.#...|#####',
  '3': '####.|....#|....#|.###.|....#|....#|####.',
  '4': '...#.|..##.|.#.#.|#..#.|#####|...#.|...#.',
  '5': '#####|#....|####.|....#|....#|#...#|.###.',
  '6': '..##.|.#...|#....|####.|#...#|#...#|.###.',
  '7': '#####|....#|...#.|..#..|.#...|.#...|.#...',
  '8': '.###.|#...#|#...#|.###.|#...#|#...#|.###.',
  '9': '.###.|#...#|#...#|.####|....#|...#.|.##..',
  '-': '.....|.....|.....|.###.|.....|.....|.....',
  '·': '.....|.....|.....|..#..|.....|.....|.....',
  '+': '.....|..#..|..#..|#####|..#..|..#..|.....',
  '.': '.....|.....|.....|.....|.....|.##..|.##..',
  ',': '.....|.....|.....|.....|.##..|..#..|.#...',
  "'": '..#..|..#..|.#...|.....|.....|.....|.....',
  '"': '.#.#.|.#.#.|.....|.....|.....|.....|.....',
  ':': '.....|.##..|.##..|.....|.##..|.##..|.....',
  '!': '..#..|..#..|..#..|..#..|..#..|.....|..#..',
  '?': '.###.|#...#|....#|...#.|..#..|.....|..#..',
  '/': '....#|....#|...#.|..#..|.#...|#....|#....',
  '&': '.##..|#..#.|#.#..|.#...|#.#.#|#..#.|.##.#',
  '(': '...#.|..#..|.#...|.#...|.#...|..#..|...#.',
  ')': '.#...|..#..|...#.|...#.|...#.|..#..|.#...',
  '฿': '.#...|####.|##..#|####.|##..#|####.|.#...',
};

const ADVANCE = WIDTH + 1;
const SPACE = 4;

const normalise = (text: string) => text
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, '-')
  .toUpperCase();

export interface PixelText {
  /** One path in glyph-pixel units; scale it with a transform. */
  d: string;
  width: number;
  height: number;
}

/** Characters the font cannot draw advance like a space rather than throwing. */
export function pixelText(text: string): PixelText {
  let x = 0;
  const runs: string[] = [];
  for (const char of normalise(text)) {
    const glyph = GLYPHS[char];
    if (!glyph) { x += SPACE; continue; }
    glyph.split('|').forEach((row, y) => {
      for (const match of row.matchAll(/#+/g)) runs.push(`M${x + match.index!} ${y}h${match[0].length}v1h-${match[0].length}z`);
    });
    x += ADVANCE;
  }
  return { d: runs.join(''), width: Math.max(0, x - 1), height: ROWS };
}

/** Width in glyph pixels, without building the path. */
export function pixelTextWidth(text: string): number {
  let x = 0;
  for (const char of normalise(text)) x += GLYPHS[char] ? ADVANCE : SPACE;
  return Math.max(0, x - 1);
}

/** Greedy word wrap to a pixel width; a single word longer than the width gets its own line. */
export function wrapPixelText(text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word;
    if (line && pixelTextWidth(next) > maxWidth) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

/** The largest whole-pixel scale at which the text fits the width, clamped to [min, max]. */
export function fitScale(text: string, maxWidth: number, min: number, max: number): number {
  const width = pixelTextWidth(text);
  return width ? Math.max(min, Math.min(max, Math.floor(maxWidth / width))) : max;
}
