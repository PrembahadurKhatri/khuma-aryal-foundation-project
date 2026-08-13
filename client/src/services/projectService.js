import api from "./api.js";

export const fetchProjects = async () => {
  const { data } = await api.get("/projects");
  return data;
};

// payload: { titleEn, titleNe, descriptionEn, descriptionNe, status,
//            keepImages: string[] (existing URLs kept), newImageFiles: File[] }
const toFormData = ({ newImageFiles, keepImages, ...rest }) => {
  const form = new FormData();
  Object.entries(rest).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    form.append(key, value);
  });
  if (keepImages) form.append("keepImages", JSON.stringify(keepImages));
  (newImageFiles || []).forEach((file) => form.append("images", file));
  return form;
};

export const createProject = async (payload) => {
  const { data } = await api.post("/projects", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateProject = async (id, payload) => {
  const { data } = await api.put(`/projects/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteProject = async (id) => {
  const { data } = await api.delete(`/projects/${id}`);
  return data;
};
