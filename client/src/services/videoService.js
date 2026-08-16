import api from "./api.js";

export const fetchVideos = async () => {
  const { data } = await api.get("/videos");
  return data;
};

// payload: { titleEn, titleNe, descriptionEn, descriptionNe, category, duration, embedUrl, videoFile?, thumbnailFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "videoFile") form.append("video", value);
    else if (key === "thumbnailFile") form.append("thumbnail", value);
    else form.append(key, value);
  });
  return form;
};

export const createVideo = async (payload) => {
  const { data } = await api.post("/videos", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateVideo = async (id, payload) => {
  const { data } = await api.put(`/videos/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteVideo = async (id) => {
  const { data } = await api.delete(`/videos/${id}`);
  return data;
};
