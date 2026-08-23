import api from "./api.js";

export const fetchStories = async () => {
  const { data } = await api.get("/stories");
  return data;
};

// payload: { name, summaryEn, summaryNe, photoFile?, album,
//            keepImages: string[], newImageFiles: File[] }
//
// Empty strings are sent through on purpose (not skipped like undefined/
// null) — clearing a text field or the album link submits "", and that has
// to reach the server so it actually overwrites the old value instead of
// being silently ignored (see galleryService.js's toFormData for the same
// fix, applied there first).
const toFormData = ({ photoFile, keepImages, newImageFiles, ...rest }) => {
  const form = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(key, value);
  });
  if (photoFile) form.append("photo", photoFile);
  if (keepImages) form.append("keepImages", JSON.stringify(keepImages));
  (newImageFiles || []).forEach((file) => form.append("images", file));
  return form;
};

export const createStory = async (payload) => {
  const { data } = await api.post("/stories", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateStory = async (id, payload) => {
  const { data } = await api.put(`/stories/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteStory = async (id) => {
  const { data } = await api.delete(`/stories/${id}`);
  return data;
};
