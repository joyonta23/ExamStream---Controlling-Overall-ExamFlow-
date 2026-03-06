import api from "./api";

export const createExam = async (examData) => {
  const response = await api.post("/exams", examData);
  return response.data;
};

export const getExams = async () => {
  const response = await api.get("/exams");
  return response.data;
};

export const getExam = async (id) => {
  const response = await api.get(`/exams/${id}`);
  return response.data;
};

export const updateExam = async (id, examData) => {
  const response = await api.put(`/exams/${id}`, examData);
  return response.data;
};

export const deleteExam = async (id) => {
  const response = await api.delete(`/exams/${id}`);
  return response.data;
};

export const getExamStatus = async (id) => {
  const response = await api.get(`/exams/${id}/status`);
  return response.data;
};
