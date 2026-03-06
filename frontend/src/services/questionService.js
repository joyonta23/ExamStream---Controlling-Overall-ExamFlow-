import api from "./api";

export const createQuestion = async (formData) => {
  const response = await api.post("/questions", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getQuestionsByExam = async (examId) => {
  const response = await api.get(`/questions/exam/${examId}`);
  return response.data;
};

export const getQuestion = async (id) => {
  const response = await api.get(`/questions/${id}`);
  return response.data;
};

export const updateQuestion = async (id, formData) => {
  const response = await api.put(`/questions/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteQuestion = async (id) => {
  const response = await api.delete(`/questions/${id}`);
  return response.data;
};
