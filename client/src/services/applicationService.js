import api from "./api.js";

// Public — used by VacancyDetail.jsx's fillup form.
// payload: { applicantName, email, phone, coverLetterFile, resumeFile? }
export const submitApplication = async (vacancyId, payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "resumeFile") form.append("resume", value);
    else if (key === "coverLetterFile") form.append("coverLetter", value);
    else form.append(key, value);
  });
  const { data } = await api.post(`/vacancies/${vacancyId}/apply`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

// Admin
export const fetchApplications = async (params = {}) => {
  const { data } = await api.get("/applications", { params });
  return data;
};

export const updateApplicationStatus = async (id, status) => {
  const { data } = await api.put(`/applications/${id}`, { status });
  return data;
};

export const deleteApplication = async (id) => {
  const { data } = await api.delete(`/applications/${id}`);
  return data;
};
