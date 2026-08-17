import api from "./api.js";

export const fetchLeaders = async () => {
  const { data } = await api.get("/leaders");
  return data;
};

// payload: { role, order, nameEn, nameNe, titleEn, titleNe, messageEn, messageNe, photoFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "photoFile") form.append("photo", value);
    else form.append(key, value);
  });
  return form;
};

export const createLeader = async (payload) => {
  const { data } = await api.post("/leaders", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateLeader = async (id, payload) => {
  const { data } = await api.put(`/leaders/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteLeader = async (id) => {
  const { data } = await api.delete(`/leaders/${id}`);
  return data;
};
