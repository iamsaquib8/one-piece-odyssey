import type { LegalSection } from '../types';

/**
 * Plain-language notices for an independent, non-commercial fan project.
 * Written to describe what this site actually does — every claim here is
 * verifiable in the source — and reviewed by no lawyer. Not legal advice.
 */

/** Rights-holder takedown contact. Assembled at runtime so scrapers do not lift it whole. */
const CONTACT_USER = 'saquibulhassan6';
const CONTACT_DOMAIN = 'gmail.com';
export const contactAddress = `${CONTACT_USER}@${CONTACT_DOMAIN}`;

export const legalUpdated = '2026-09-06';

export const legalSections: LegalSection[] = [
  {
    id: 'disclaimer',
    title: 'Disclaimer',
    summary: 'An unofficial fan project, with no connection to the rights holders.',
    paragraphs: [
      'One Piece Odyssey is an independent, non-commercial fan project made by a reader of the manga. It is not affiliated with, endorsed by, sponsored by, or connected to Eiichiro Oda, Shueisha, VIZ Media, Toei Animation, or any other rights holder, licensee, or distributor of One Piece.',
      'ONE PIECE © Eiichiro Oda / Shueisha. All names, characters, places, and story events belong to their respective owners. No ownership of the underlying work is claimed here, and nothing on this site should be read as an official statement about it.',
      'This site hosts no manga pages, scans, or translations. It offers original written summaries and original illustrations describing a work you should read from its publisher. Please support the official release.',
    ],
  },
  {
    id: 'editorial',
    title: 'Editorial position',
    summary: 'Summaries are one reader’s account, not official canon.',
    paragraphs: [
      'Every summary, description, and art brief is an original editorial interpretation. It is not a substitute for the manga, and it is not an authoritative account of it. Where this edition describes what a place looks like or how an event unfolded, that reading may be wrong, incomplete, or later contradicted by the story itself.',
      'Arc and saga divisions are this project’s navigation, not an official publisher taxonomy. Chapter ranges are reading references rather than panel-level citations. Location positions on the world map are schematic story topology — the order in which places are reached — and never canonical coordinates.',
      'This edition covers the story only through the chapter noted in the footer, while the manga continues past it. Full-story mode carries spoilers for everything it covers. The reading-progress control limits discovery to completed arcs; undated profile summaries are hidden in limited mode.',
    ],
  },
  {
    id: 'terms',
    title: 'Terms of use',
    summary: 'Read it, share it, expect no warranty.',
    paragraphs: [
      'You may read, link to, and share this site freely for personal, non-commercial use. You may not present its text or illustrations as official One Piece material, as your own work, or as part of a paid or commercial offering.',
      'The site is provided “as is”, without warranty of any kind, express or implied. No guarantee is made that it is accurate, current, complete, or continuously available, and it may change or disappear without notice. To the fullest extent permitted by law, the maintainer accepts no liability for any loss arising from your use of the site or reliance on anything in it.',
      'Links to VIZ, ONE PIECE.com, and other outside sites are provided as sources and as routes to the official release. Those destinations are not controlled by this project, and their content and terms are their own.',
      'If you are a rights holder and want something here changed or removed, write to the address below and it will be addressed promptly and in good faith.',
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy',
    summary: 'No accounts, no cookies, no analytics — your logbook stays on your device.',
    paragraphs: [
      'This site has no accounts, no sign-in, and no commerce. It sets no cookies, runs no analytics or advertising, and sends no telemetry. Nothing you do here is transmitted to the maintainer or to any third party, because the site makes no network calls of its own.',
      'Your logbook — which arcs you have saved or explored, your motion preference, and your reading position — is stored only in your own browser, under a single localStorage entry named “grand-line-logbook-v1”. It never leaves your device, and the maintainer cannot read it.',
      'Clearing your browser’s site data for this domain erases that entry and resets the logbook. If storage is unavailable or blocked, the site stays fully usable for the session and simply forgets between visits.',
      'Fonts are self-hosted and served from this site, so loading a page does not call out to a font provider or any other external service.',
    ],
  },
  {
    id: 'sources',
    title: 'Sources & fair use',
    summary: 'Cited against the official English release.',
    paragraphs: [
      'Each entry cites the official English chapter archive at VIZ and the official story archive at ONE PIECE.com. Chapter numbers follow the official English release. The publication cutoff shown in the footer records the latest officially released chapter as of the date it was last verified.',
      'This project quotes no substantial portion of the work. It comments on and summarizes a published manga in original words and original artwork — commentary, criticism, and reference of the kind fair dealing and fair use are meant to cover. That framing is a good-faith position, not a legal determination.',
      'Corrections are welcome. If something here misreads the story or misattributes a source, please write in so it can be fixed.',
    ],
  },
];
