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
const toFormData = ({ coverFile, keepPhotos, newPhotoFiles, ...rest }) => {
  const form = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
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
