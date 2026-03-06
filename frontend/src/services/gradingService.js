import api from "./api";

export const submitGrading = async (formData) => {
  const response = await api.post("/grading/submit", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const getGradingByAnswer = async (answerId) => {
  const response = await api.get(`/grading/answer/${answerId}`);
  return response.data;
};

export const getGradingsByExam = async (examId) => {
  const response = await api.get(`/grading/exam/${examId}`);
  return response.data;
};

export const getGradingsByStudent = async (studentId, examId) => {
  const response = await api.get(
    `/grading/student/${studentId}/exam/${examId}`,
  );
  return response.data;
};

export const deleteGrading = async (id) => {
  const response = await api.delete(`/grading/${id}`);
  return response.data;
};
