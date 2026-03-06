import api from "./api";

export const submitAnswer = async (formData) => {
  const response = await api.post("/answers", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getAnswersByExam = async (examId) => {
  const response = await api.get(`/answers/exam/${examId}`);
  return response.data;
};

export const getMyAnswers = async (examId) => {
  const response = await api.get(`/answers/my-answers/${examId}`);
  return response.data;
};

export const getAnswersByStudent = async (studentId, examId) => {
  const response = await api.get(
    `/answers/student/${studentId}/exam/${examId}`,
  );
  return response.data;
};

export const deleteAnswer = async (id) => {
  const response = await api.delete(`/answers/${id}`);
  return response.data;
};
