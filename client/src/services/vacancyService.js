import api from "./api.js";

export const fetchVacancies = async () => {
  const { data } = await api.get("/vacancies");
  return data;
};

// payload: { titleEn, titleNe, descriptionEn, descriptionNe, type, locationEn, locationNe, deadline, applyLink }
// No files involved here, unlike most other services — plain JSON is fine.
export const createVacancy = async (payload) => {
  const { data } = await api.post("/vacancies", payload);
  return data;
};

export const updateVacancy = async (id, payload) => {
  const { data } = await api.put(`/vacancies/${id}`, payload);
  return data;
};

export const deleteVacancy = async (id) => {
  const { data } = await api.delete(`/vacancies/${id}`);
  return data;
};
