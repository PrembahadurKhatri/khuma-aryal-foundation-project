// ---------------------------------------------------------------------------
// Content service — the single seam between the UI and its data source.
//
// getSiteInfo/getProjects/getNews/getGalleryImages now read from the live
// Express + MongoDB API (see server/) instead of the local content.js
// arrays — every page/component that already renders this data via
// pick(field, language) keeps working untouched, because the API returns
// the exact same { en, ne } bilingual shape those arrays used. Mongo's
// `_id` is normalized to `id` here (rather than in every component) since
// the original static data used `id`.
//
// getMessages() (the Home page's founder/president/leadership messages) is
// the one exception — there is no admin CMS screen for that content yet, so
// it still resolves from the local `leaderMessages` array. Give it the same
// treatment (model + controller + admin page) if/when that's needed.
// ---------------------------------------------------------------------------
import { leaderMessages } from "../data/content.js";
import api from "./api.js";

const withId = (doc) => ({ ...doc, id: doc._id });

export async function getSiteInfo() {
  const { data } = await api.get("/settings");
  return data.data;
}

export function getMessages() {
  return Promise.resolve(leaderMessages);
}

export async function getProjects() {
  const { data } = await api.get("/projects");
  return data.data.map(withId);
}

export async function getNews() {
  const { data } = await api.get("/news");
  return data.data.map(withId);
}

export async function getGalleryImages() {
  const { data } = await api.get("/gallery");
  return data.data.map(withId);
}
