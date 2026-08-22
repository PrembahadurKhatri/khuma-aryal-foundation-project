import api from "./api.js";

export const fetchAlbums = async (params = {}) => {
  const { data } = await api.get("/gallery", { params });
  return data;
};

export const fetchAlbum = async (id) => {
  const { data } = await api.get(`/gallery/${id}`);
  return data;
};

// payload: { titleEn, titleNe, coverFile?, keepPhotos: string[], newPhotoFiles: File[] }
//
// Empty strings are sent through on purpose (not skipped like undefined/null)
// — an admin clearing the description (or beneficiaries) field submits "",
// and that has to reach the server so it actually overwrites the old value.
// Skipping "" here used to make a cleared field silently keep its previous
// value forever, since the server's guarded-update only touches a field
// when the request said something about it at all.
const toFormData = ({ coverFile, keepPhotos, newPhotoFiles, ...rest }) => {
  const form = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    form.append(key, value);
  });
  if (coverFile) form.append("cover", coverFile);
  if (keepPhotos) form.append("keepPhotos", JSON.stringify(keepPhotos));
  (newPhotoFiles || []).forEach((file) => form.append("photos", file));
  return form;
};

export const createAlbum = async (payload) => {
  const { data } = await api.post("/gallery", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateAlbum = async (id, payload) => {
  const { data } = await api.put(`/gallery/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteAlbum = async (id) => {
  const { data } = await api.delete(`/gallery/${id}`);
  return data;
};
