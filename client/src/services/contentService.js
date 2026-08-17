// ---------------------------------------------------------------------------
// Content service — the single seam between the UI and its data source.
//
// getSiteInfo/getProjects/getNews/getGalleryAlbums/getMessages all read from
// the live Express + MongoDB API (see server/) instead of local content.js
// arrays — every page/component that already renders this data via
// pick(field, language) keeps working untouched, because the API returns
// the exact same { en, ne } bilingual shape those arrays used. Mongo's
// `_id` is normalized to `id` here (rather than in every component) since
// the original static data used `id`.
//
// getMessages() (the Home page's founder/president/leadership messages) is
// backed by the Leader model — see server/models/Leader.js and the admin
// "Leadership" page (admin/LeadersManage.jsx).
// ---------------------------------------------------------------------------
import api from "./api.js";

const withId = (doc) => ({ ...doc, id: doc._id });

export async function getSiteInfo() {
  const { data } = await api.get("/settings");
  return data.data;
}

export async function getMessages() {
  const { data } = await api.get("/leaders");
  return data.data.map(withId);
}

export async function getProjects() {
  const { data } = await api.get("/projects");
  return data.data.map(withId);
}

// Used by ProjectDetail.jsx. `album`, if the project has one linked, comes
// back populated (title/coverImage/photos) — normalize its _id too so
// `project.album.id` works the same way `project.id` does.
export async function getProject(id) {
  const { data } = await api.get(`/projects/${id}`);
  const project = withId(data.data);
  if (project.album) project.album = withId(project.album);
  return project;
}

export async function getNews() {
  const { data } = await api.get("/news");
  return data.data.map(withId);
}

// Used by NewsDetail.jsx.
export async function getNewsItem(id) {
  const { data } = await api.get(`/news/${id}`);
  return withId(data.data);
}

// Gallery is organized as albums: a thumbnail grid of cover photo + title
// (getGalleryAlbums, used by Gallery.jsx), opening into every photo in that
// album (getGalleryAlbum, used by AlbumDetail.jsx).
export async function getGalleryAlbums(params) {
  const { data } = await api.get("/gallery", { params });
  return data.data.map(withId);
}

export async function getGalleryAlbum(id) {
  const { data } = await api.get(`/gallery/${id}`);
  return withId(data.data);
}

// Gallery videos — shown alongside photo Albums on the Gallery page, either
// an embedded link (YouTube/Vimeo/etc) or a directly-uploaded file. See
// models/Video.js.
export async function getGalleryVideos(params) {
  const { data } = await api.get("/videos", { params });
  return data.data.map(withId);
}

// "Important Notices" — office/holiday/scholarship-style announcements
// shown on the News page, separate from News itself. See models/Notice.js.
export async function getNotices() {
  const { data } = await api.get("/notices");
  return data.data.map(withId);
}

// Used by NoticeDetail.jsx.
export async function getNotice(id) {
  const { data } = await api.get(`/notices/${id}`);
  return withId(data.data);
}

// "Upcoming Events" — see models/Event.js.
export async function getEvents() {
  const { data } = await api.get("/events");
  return data.data.map(withId);
}

// Used by EventDetail.jsx.
export async function getEvent(id) {
  const { data } = await api.get(`/events/${id}`);
  return withId(data.data);
}

// "Impact / Success Stories" — see models/Story.js.
export async function getStories() {
  const { data } = await api.get("/stories");
  return data.data.map(withId);
}

// Used by StoryDetail.jsx.
export async function getStory(id) {
  const { data } = await api.get(`/stories/${id}`);
  return withId(data.data);
}

// "Downloads" — useful documents (annual report, brochure, etc). See models/Download.js.
export async function getDownloads() {
  const { data } = await api.get("/downloads");
  return data.data.map(withId);
}

// "Job Vacancies" — open positions shown on the News page. See models/Vacancy.js.
export async function getVacancies() {
  const { data } = await api.get("/vacancies");
  return data.data.map(withId);
}

// Used by VacancyDetail.jsx.
export async function getVacancy(id) {
  const { data } = await api.get(`/vacancies/${id}`);
  return withId(data.data);
}
