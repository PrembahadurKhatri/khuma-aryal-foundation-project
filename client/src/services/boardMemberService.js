import api from "./api.js";

export const fetchBoardMembers = async () => {
  const { data } = await api.get("/board-members");
  return data;
};

// payload: { order, nameEn, nameNe, designationEn, designationNe, photoFile? }
const toFormData = (payload) => {
  const form = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (key === "photoFile") form.append("photo", value);
    else form.append(key, value);
  });
  return form;
};

export const createBoardMember = async (payload) => {
  const { data } = await api.post("/board-members", toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const updateBoardMember = async (id, payload) => {
  const { data } = await api.put(`/board-members/${id}`, toFormData(payload), {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const deleteBoardMember = async (id) => {
  const { data } = await api.delete(`/board-members/${id}`);
  return data;
};
