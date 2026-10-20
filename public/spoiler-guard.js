// Prerendered pages carry a full-edition summary for search engines and link previews.
// A reader who limits spoilers must never see it, so this runs before first paint and
// marks the document; styles.css then hides the summary until the app replaces it.
try {
  var saved = JSON.parse(localStorage.getItem('grand-line-logbook-v1') || 'null');
  if (saved && saved.spoilerThrough !== null && saved.spoilerThrough !== undefined) document.documentElement.classList.add('reading-limited');
} catch (error) { /* No storage means no limit was set. */ }
