import api from "./api.js";

export const fetchNotices = async () => {
  const { data } = await api.get("/notices");
  return data;
};

// payload: { titleEn, titleNe, date, priority, attachmentFile?, album,
//            keepImages: string[], newImageFiles: File[] }
//
// Empty strings are sent through on purpose (not skipped like undefined/
// null) — clearing a text field or the album link submits "", and that has
// to reach the server so it actually overwrites the old value instead of
// being silently ignored (see galleryService.js's toFormData for the same
// fix, applied there first).
const toFormData = ({ attachmentFile, keepImages, newImageFiles, ...rest }) => {
  const form = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(key, value);
  });
  if (attachmentFile) form.append("attachment", attachmentFile);
  if (keepImages) form.append("keepImages", JSON.stringify(keepImages));
  (newImageFiles || []).forEach((file) => form.append("images", file));
  return form;
};

export const createNotice = async (payload) => {
  const { data } = await api.post("/notices", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateNotice = async (id, payload) => {
  const { data } = await api.put(`/notices/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteNotice = async (id) => {
  const { data } = await api.delete(`/notices/${id}`);
  return data;
};
