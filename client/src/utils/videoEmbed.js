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

export function toEmbedUrl(url) {
  if (!url) return null;
  const youtube = url.match(YOUTUBE_RE);
  if (youtube) return `https://www.youtube.com/embed/${youtube[1]}`;
  const vimeo = url.match(VIMEO_RE);
  if (vimeo) return `https://player.vimeo.com/video/${vimeo[1]}`;
  if (FACEBOOK_RE.test(url) && !url.includes("plugins/video.php")) {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(url)}&show_text=false`;
  }
  return url;
}
