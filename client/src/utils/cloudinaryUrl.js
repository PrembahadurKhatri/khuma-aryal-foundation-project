// Cloudinary uploads are stored in whatever format they were uploaded as
// (see server/config/cloudinary.js's allowed_formats) — a photo saved from
// a phone as .avif gets served back as raw .avif forever, with no format
// negotiation. AVIF isn't decodable by every browser/in-app webview still
// in real use (older Android, some embedded Facebook/Messenger browsers,
// pre-16 iOS Safari) — for those visitors the <img> fails to decode and
// falls back to PlaceholderImage's placeholder, which reads as "this
// notice is broken" rather than "your browser and this one photo don't
// get along."
//
// Inserting Cloudinary's f_auto,q_auto transformation makes Cloudinary
// itself pick whatever format (AVIF/WebP/JPEG) the requesting browser's
// Accept header actually supports, and right-sizes quality — so the same
// stored file now renders for every visitor instead of only some.
export function withAutoFormat(url) {
  if (!url || typeof url !== "string") return url;
  const marker = "/image/upload/";
  const i = url.indexOf(marker);
  if (i === -1) return url; // not a Cloudinary image delivery URL — leave untouched
  // Idempotent: don't double up if this URL already has a transformation.
  const rest = url.slice(i + marker.length);
  if (rest.startsWith("f_auto") || rest.startsWith("q_auto")) return url;
  return url.slice(0, i + marker.length) + "f_auto,q_auto/" + rest;
}
