// ---------------------------------------------------------------------------
// Content service — the single seam between the UI and its data source.
//
// Today every function resolves from the local, bilingual arrays in
// src/data/content.js. When the Express + MongoDB backend is ready, this is
// the ONLY file that needs to change: replace each body with a `fetch("/api/...")`
// call that returns the same shape (arrays of objects with { en, ne } text
// fields), and every page/component keeps working untouched. That is also
// where the future CMS's add/delete operations will plug in
// (createMessage, deleteMessage, etc.) alongside these read operations.
// ---------------------------------------------------------------------------
import { siteInfo, leaderMessages, projects, newsItems, galleryImages } from "../data/content.js";

// Simulates network latency so loading states behave the same way they will
// once this hits a real API. Safe to remove once fetch() replaces it.
const resolve = (data) => new Promise((res) => setTimeout(() => res(data), 120));

export function getSiteInfo() {
  return resolve(siteInfo);
}

export function getMessages() {
  return resolve(leaderMessages);
}

export function getProjects() {
  return resolve(projects);
}

export function getNews() {
  return resolve(newsItems);
}

export function getGalleryImages() {
  return resolve(galleryImages);
}
