import api from "./api.js";

export const fetchStories = async () => {
  const { data } = await api.get("/stories");
  return data;
};

// payload: { name, summaryEn, summaryNe, photoFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "photoFile") form.append("photo", value);
    else form.append(key, value);
  });
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
