import api from "./api.js";

export const fetchEvents = async () => {
  const { data } = await api.get("/events");
  return data;
};

// payload: { nameEn, nameNe, date, time, locationEn, locationNe, registerLink, imageFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "imageFile") form.append("image", value);
    else form.append(key, value);
  });
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
