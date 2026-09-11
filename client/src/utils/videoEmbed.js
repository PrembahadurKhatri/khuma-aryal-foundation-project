// Turns a YouTube/Vimeo/Facebook watch-page URL into its embeddable iframe
// src. Anything else is assumed to already be embeddable (e.g. a link
// copied straight from a "Share > Embed" dialog) and passed through
// unchanged.
const YOUTUBE_RE = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
const VIMEO_RE = /vimeo\.com\/(?:video\/)?(\d+)/;
// A raw facebook.com/.../videos/... or fb.watch link sends X-Frame-Options:
// deny and can't be framed directly at all — unlike YouTube/Vimeo, Facebook
// requires wrapping the link in its own embeddable "video plugin" page.
const FACEBOOK_RE = /(?:facebook\.com|fb\.watch)/i;

// Facebook's video.php plugin does NOT auto-fit the iframe it's given —
// without explicit width/height query params it renders its player at its
// own fixed default size (landscape-ish), regardless of the actual clip's
// real shape or the box we're displaying it in. That left a portrait Reel
// rendered small and top-aligned inside our portrait frame, with the
// unfilled remainder showing as plain black — the player itself was
// undersized, not (as it first looks) mis-cropped. Passing width/height
// matching our own intended box lets the plugin size its player to
// actually fill it. Defaults are a plain 16:9 landscape pair;
// VideoLightbox.jsx passes a portrait pair instead for anything that
// isn't YouTube/Vimeo, matching the box it renders those into.
export function toEmbedUrl(url, { width = 640, height = 360 } = {}) {
  if (!url) return null;
  const youtube = url.match(YOUTUBE_RE);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(VIMEO_RE);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (FACEBOOK_RE.test(url) && !url.includes("plugins/video.php")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false&width=${width}&height=${height}`;
  }
  return url;
}
