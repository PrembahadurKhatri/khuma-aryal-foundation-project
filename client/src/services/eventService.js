import api from "./api.js";

export const fetchEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

// payload: { nameEn, nameNe, date, time, locationEn, locationNe,
//            registerLink, imageFile?, album, keepImages: string[],
//            newImageFiles: File[] }
//
// Empty strings are sent through on purpose (not skipped like undefined/
// null) — clearing a text field or the album link submits "", and that has
// to reach the server so it actually overwrites the old value instead of
// being silently ignored (see galleryService.js's toFormData for the same
// fix, applied there first).
const toFormData = ({ imageFile, keepImages, newImageFiles, ...rest }) => {
  const form = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(key, value);
  });
  if (imageFile) form.append("image", imageFile);
  if (keepImages) form.append("keepImages", JSON.stringify(keepImages));
  (newImageFiles || []).forEach((file) => form.append("images", file));
  return form;
};

export const createEvent = async (payload) => {
  const { data } = await api.post("/events", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateEvent = async (id, payload) => {
  const { data } = await api.put(`/events/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteEvent = async (id) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};
