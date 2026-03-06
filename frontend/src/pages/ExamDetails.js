import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExam, updateExam } from "../services/examService";
import {
  getQuestionsByExam,
  createQuestion,
  deleteQuestion,
} from "../services/questionService";
import { getAnswersByExam } from "../services/answerService";
import { getGradingsByExam, submitGrading } from "../services/gradingService";
import "./DashboardTrend.css";

const ExamDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [gradings, setGradings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [gradingModal, setGradingModal] = useState(null); // { answerId, studentName }
  const [gradingForm, setGradingForm] = useState({
    score: "",
    feedback: "",
    gradedFiles: [],
  });
  const [submittingGrade, setSubmittingGrade] = useState(false);
  const [questionForm, setQuestionForm] = useState({
    questionNumber: "",
    questionText: "",
    marks: 10,
    questionImage: null,
    questionPdf: null,
  });
  const [editingExam, setEditingExam] = useState(false);
  const [savingExam, setSavingExam] = useState(false);
  const [examForm, setExamForm] = useState({
    title: "",
    description: "",
    startTime: "",
    examDuration: "",
    uploadDeadline: "",
    totalQuestions: 1,
  });

  const formatDateTimeLocal = (dateValue) => {
    const date = new Date(dateValue);
    const timezoneOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - timezoneOffset).toISOString().slice(0, 16);
  };

  useEffect(() => {
    fetchExamData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchExamData = async () => {
    try {
      const [examData, questionsData, answersData, gradingsData] =
        await Promise.all([
          getExam(id),
          getQuestionsByExam(id),
          getAnswersByExam(id),
          getGradingsByExam(id),
        ]);
      setExam(examData);
      setQuestions(questionsData);
      setAnswers(answersData);
      setGradings(gradingsData);
      setExamForm({
        title: examData.title || "",
        description: examData.description || "",
        startTime: formatDateTimeLocal(examData.startTime),
        examDuration: examData.examDuration || "",
        uploadDeadline: formatDateTimeLocal(examData.uploadDeadline),
        totalQuestions:
          examData.totalQuestions || examData.questions?.length || 1,
      });
    } catch (err) {
      setError("Failed to fetch exam details");
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setQuestionForm({
      ...questionForm,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    setQuestionForm({
      ...questionForm,
      questionImage: e.target.files[0],
    });
  };

  const handlePdfChange = (e) => {
    setQuestionForm({
      ...questionForm,
      questionPdf: e.target.files[0],
    });
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    const plannedQuestionCount = Number(exam?.totalQuestions || 1);
    if (questions.length >= plannedQuestionCount) {
      alert(
        `Question limit reached (${plannedQuestionCount}). Increase total question count to add more.`,
      );
      return;
    }

    const formData = new FormData();
    formData.append("examId", id);
    formData.append("questionNumber", questionForm.questionNumber);
    formData.append("questionText", questionForm.questionText);
    formData.append("marks", questionForm.marks);
    if (questionForm.questionImage) {
      formData.append("questionImage", questionForm.questionImage);
    }
    if (questionForm.questionPdf) {
      formData.append("questionPdf", questionForm.questionPdf);
    }

    try {
      await createQuestion(formData);
      setShowAddQuestion(false);
      setQuestionForm({
        questionNumber: "",
        questionText: "",
        marks: 10,
        questionImage: null,
        questionPdf: null,
      });
      fetchExamData();
    } catch (err) {
      alert("Failed to add question");
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (window.confirm("Are you sure you want to delete this question?")) {
      try {
        await deleteQuestion(questionId);
        fetchExamData();
      } catch (err) {
        alert("Failed to delete question");
      }
    }
  };

  const handleExamFormChange = (e) => {
    const { name, value } = e.target;
    setExamForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();

    const plannedQuestions = Number(examForm.totalQuestions);
    if (
      !Number.isInteger(plannedQuestions) ||
      plannedQuestions < questions.length
    ) {
      alert(
        `Total Questions must be at least current questions count (${questions.length}).`,
      );
      return;
    }

    const start = new Date(examForm.startTime);
    const deadline = new Date(examForm.uploadDeadline);
    if (deadline <= start) {
      alert("Upload deadline must be after start time.");
      return;
    }

    setSavingExam(true);
    try {
      const updated = await updateExam(id, {
        title: examForm.title,
        description: examForm.description,
        startTime: examForm.startTime,
        examDuration: Number(examForm.examDuration),
        uploadDeadline: examForm.uploadDeadline,
        totalQuestions: plannedQuestions,
      });
      setExam(updated);
      setEditingExam(false);
      alert("Exam settings updated successfully");
      fetchExamData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to update exam settings");
    } finally {
      setSavingExam(false);
    }
  };

  const handleGradingChange = (e) => {
    const { name, value } = e.target;
    setGradingForm({
      ...gradingForm,
      [name]: value,
    });
  };

  const handleGradedFileChange = (e) => {
    setGradingForm({
      ...gradingForm,
      gradedFiles: Array.from(e.target.files || []),
    });
  };

  const getAnswerFileUrls = (answer) => {
    if (!answer) return [];
    if (Array.isArray(answer.answerFiles) && answer.answerFiles.length > 0) {
      return answer.answerFiles;
    }
    return answer.answerFile ? [answer.answerFile] : [];
  };

  const getGradingFileUrls = (grading) => {
    if (!grading) return [];
    if (Array.isArray(grading.gradedFiles) && grading.gradedFiles.length > 0) {
      return grading.gradedFiles;
    }
    return grading.gradedFile ? [grading.gradedFile] : [];
  };

  const handleSubmitGrading = async (e) => {
    e.preventDefault();

    if ((gradingForm.gradedFiles || []).length === 0 || !gradingForm.score) {
      alert("Please upload at least one graded file and enter a score");
      return;
    }

    setSubmittingGrade(true);

    const formData = new FormData();
    formData.append("answerId", gradingModal.answerId);
    formData.append("score", gradingForm.score);
    formData.append("feedback", gradingForm.feedback);
    gradingForm.gradedFiles.forEach((file) => {
      formData.append("gradedFiles", file);
    });

    try {
      await submitGrading(formData);
      alert("Grading submitted successfully!");
      setGradingModal(null);
      setGradingForm({ score: "", feedback: "", gradedFiles: [] });
      fetchExamData();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit grading");
    } finally {
      setSubmittingGrade(false);
    }
  };

  const getGradingForAnswer = (answerId) => {
    return gradings.find((g) => g.answer._id === answerId);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!exam)
    return (
      <div className="trend-dashboard-shell">
        <div className="trend-dashboard-grid-bg" />
        <div className="trend-dashboard-panel">
          <div className="alert alert-error">Exam not found</div>
        </div>
      </div>
    );

  const configuredTotalQuestions = Number(exam.totalQuestions || 1);
  const canAddMoreQuestions = questions.length < configuredTotalQuestions;

  return (
    <div className="trend-dashboard-shell">
      <div className="trend-dashboard-grid-bg" />
      <div className="trend-dashboard-panel">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2 style={{ color: "#ffffff" }}>{exam.title}</h2>
          <button
            onClick={() => navigate("/instructor")}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginBottom: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3 style={{ margin: 0, color: "#ffffff" }}>Exam Settings</h3>
            <button
              type="button"
              onClick={() => setEditingExam((prev) => !prev)}
              className="btn btn-primary"
            >
              {editingExam ? "Cancel Edit" : "Edit Exam"}
            </button>
          </div>

          <p
            style={{ color: "#ffffff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ffffff" }}>Description:</strong>{" "}
            {exam.description}
          </p>
          <p
            style={{ color: "#ffffff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ffffff" }}>Start Time:</strong>{" "}
            {new Date(exam.startTime).toLocaleString()}
          </p>
          <p
            style={{ color: "#ffffff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ffffff" }}>Duration:</strong>{" "}
            {exam.examDuration} minutes
          </p>
          <p
            style={{ color: "#ffffff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ffffff" }}>Upload Deadline:</strong>{" "}
            {new Date(exam.uploadDeadline).toLocaleString()}
          </p>
          <p
            style={{ color: "#ffffff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ffffff" }}>Total Questions:</strong>{" "}
            {questions.length} / {configuredTotalQuestions}
          </p>
          <p
            style={{ color: "#ffffff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ffffff" }}>Total Submissions:</strong>{" "}
            {answers.length}
          </p>

          {editingExam && (
            <div
              className="card"
              style={{ background: "#f8f9ff", marginTop: "20px" }}
            >
              <h4 style={{ marginBottom: "20px", color: "#1a1a1a" }}>
                Update Exam Settings
              </h4>
              <form onSubmit={handleUpdateExam}>
                <div className="form-group">
                  <label>Exam Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={examForm.title}
                    onChange={handleExamFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Description</label>
                  <textarea
                    name="description"
                    value={examForm.description}
                    onChange={handleExamFormChange}
                    rows="3"
                  />
                </div>

                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="datetime-local"
                    name="startTime"
                    value={examForm.startTime}
                    onChange={handleExamFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Duration (minutes) *</label>
                  <input
                    type="number"
                    name="examDuration"
                    value={examForm.examDuration}
                    onChange={handleExamFormChange}
                    min="1"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Upload Deadline *</label>
                  <input
                    type="datetime-local"
                    name="uploadDeadline"
                    value={examForm.uploadDeadline}
                    onChange={handleExamFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Total Questions *</label>
                  <input
                    type="number"
                    name="totalQuestions"
                    value={examForm.totalQuestions}
                    onChange={handleExamFormChange}
                    min={questions.length || 1}
                    required
                  />
                  <small style={{ color: "#666" }}>
                    Must be at least current questions count ({questions.length}
                    )
                  </small>
                </div>

                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={savingExam}
                >
                  {savingExam ? "Saving..." : "Save Changes"}
                </button>
              </form>
            </div>
          )}
        </div>

        <div style={{ borderTop: "2px solid #e0e0e0", paddingTop: "30px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h3 style={{ color: "#1a1a1a" }}>Questions</h3>
            <button
              onClick={() => setShowAddQuestion(!showAddQuestion)}
              className="btn btn-primary"
              disabled={!canAddMoreQuestions}
              title={
                canAddMoreQuestions
                  ? ""
                  : "Question limit reached. Increase total question count first."
              }
            >
              {showAddQuestion ? "Cancel" : "+ Add Question"}
            </button>
          </div>

          {!canAddMoreQuestions && (
            <div className="alert alert-info" style={{ marginBottom: "15px" }}>
              You have reached the configured total question count (
              {configuredTotalQuestions}). Increase it from "Edit Exam" to add
              more questions.
            </div>
          )}

          {showAddQuestion && (
            <div className="card" style={{ background: "#f8f9ff" }}>
              <h4 style={{ marginBottom: "20px", color: "#1a1a1a" }}>
                Add New Question
              </h4>
              <form onSubmit={handleAddQuestion}>
                <div className="form-group">
                  <label>Question Number</label>
                  <input
                    type="number"
                    name="questionNumber"
                    value={questionForm.questionNumber}
                    onChange={handleQuestionChange}
                    required
                    min="1"
                    max={configuredTotalQuestions}
                  />
                </div>

                <div className="form-group">
                  <label>Question Text</label>
                  <textarea
                    name="questionText"
                    value={questionForm.questionText}
                    onChange={handleQuestionChange}
                    required
                    rows="4"
                  />
                </div>

                <div className="form-group">
                  <label>Marks</label>
                  <input
                    type="number"
                    name="marks"
                    value={questionForm.marks}
                    onChange={handleQuestionChange}
                    required
                    min="1"
                  />
                </div>

                <div className="form-group">
                  <label>Question Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <small style={{ color: "#333" }}>
                    Upload an image for this question
                  </small>
                </div>

                <div className="form-group">
                  <label>Question PDF (Optional)</label>
                  <input type="file" accept=".pdf" onChange={handlePdfChange} />
                  <small style={{ color: "#333" }}>
                    Upload a PDF document for this question
                  </small>
                </div>

                <button type="submit" className="btn btn-success">
                  Add Question
                </button>
              </form>
            </div>
          )}

          {questions.length === 0 ? (
            <p style={{ textAlign: "center", color: "#333", padding: "30px" }}>
              No questions added yet. Click "Add Question" to start.
            </p>
          ) : (
            <div>
              {questions.map((question) => (
                <div key={question._id} className="question-card">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "start",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: "#667eea" }}>
                        Question {question.questionNumber}
                      </h4>
                      <p
                        style={{
                          marginTop: "10px",
                          fontSize: "16px",
                          color: "#333",
                        }}
                      >
                        {question.questionText}
                      </p>
                      {question.questionImage && (
                        <img
                          src={question.questionImage}
                          alt={`Question ${question.questionNumber}`}
                          className="question-image"
                        />
                      )}
                      {question.questionPdf && (
                        <div style={{ marginTop: "10px" }}>
                          <a
                            href={question.questionPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary"
                            style={{ fontSize: "14px", padding: "8px 16px" }}
                          >
                            📄 View Question PDF
                          </a>
                        </div>
                      )}
                      <p style={{ marginTop: "10px", color: "#333" }}>
                        <strong style={{ color: "#1a1a1a" }}>Marks:</strong>{" "}
                        {question.marks}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteQuestion(question._id)}
                      className="btn btn-danger"
                      style={{ marginLeft: "15px" }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          style={{
            borderTop: "2px solid #e0e0e0",
            paddingTop: "30px",
            marginTop: "30px",
          }}
        >
          <h3 style={{ marginBottom: "20px", color: "#1a1a1a" }}>
            Student Submissions
          </h3>
          {answers.length === 0 ? (
            <p style={{ textAlign: "center", color: "#333", padding: "20px" }}>
              No submissions yet.
            </p>
          ) : (
            <div>
              {answers.map((answer) => {
                const grading = getGradingForAnswer(answer._id);
                const answerFileUrls = getAnswerFileUrls(answer);
                const gradingFileUrls = getGradingFileUrls(grading);
                return (
                  <div
                    key={answer._id}
                    style={{
                      background: "#f8f9fa",
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "10px",
                      border: grading ? "2px solid #28a745" : "1px solid #ddd",
                    }}
                  >
                    <p style={{ color: "#333", marginBottom: "5px" }}>
                      <strong style={{ color: "#1a1a1a" }}>Student:</strong>{" "}
                      {answer.student?.name} ({answer.student?.email})
                    </p>
                    <p style={{ color: "#333", marginBottom: "5px" }}>
                      <strong style={{ color: "#1a1a1a" }}>Question:</strong> Q
                      {answer.question?.questionNumber}
                    </p>
                    <p style={{ color: "#333", marginBottom: "5px" }}>
                      <strong style={{ color: "#1a1a1a" }}>Submitted:</strong>{" "}
                      {new Date(answer.submittedAt).toLocaleString()}
                    </p>
                    <p style={{ color: "#333", marginBottom: "10px" }}>
                      <strong style={{ color: "#1a1a1a" }}>Status:</strong>{" "}
                      {answer.isLate ? "⚠️ Late" : "✅ On Time"}
                    </p>

                    {grading && (
                      <div
                        style={{
                          marginTop: "15px",
                          background: "#e8f5e9",
                          padding: "10px",
                          borderRadius: "5px",
                        }}
                      >
                        <p style={{ color: "#155724", marginBottom: "5px" }}>
                          <strong>✓ Graded:</strong>{" "}
                          {new Date(grading.markedAt).toLocaleString()}
                        </p>
                        <p style={{ color: "#155724", marginBottom: "5px" }}>
                          <strong>Score:</strong> {grading.score}/
                          {answer.question?.marks}
                        </p>
                        {grading.feedback && (
                          <p style={{ color: "#155724" }}>
                            <strong>Feedback:</strong> {grading.feedback}
                          </p>
                        )}
                        <div style={{ marginTop: "10px" }}>
                          {gradingFileUrls.map((fileUrl, index) => (
                            <a
                              key={fileUrl}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-success"
                              style={{
                                marginRight: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              View Graded Answer {index + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: "10px",
                        display: "flex",
                        gap: "10px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "8px",
                        }}
                      >
                        {answerFileUrls.map((fileUrl, index) => (
                          <a
                            key={fileUrl}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary"
                          >
                            View Original Answer {index + 1}
                          </a>
                        ))}
                      </div>
                      <button
                        onClick={() =>
                          setGradingModal({
                            answerId: answer._id,
                            studentName: answer.student?.name,
                          })
                        }
                        className="btn btn-success"
                      >
                        {grading ? "Update Grade" : "Add Grade"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Grading Modal */}
        {gradingModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
          >
            <div className="card" style={{ maxWidth: "500px", width: "90%" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "20px",
                }}
              >
                <h3 style={{ color: "#ead8d8" }}>
                  Grade - {gradingModal.studentName}
                </h3>
                <button
                  onClick={() => {
                    setGradingModal(null);
                    setGradingForm({
                      score: "",
                      feedback: "",
                      gradedFiles: [],
                    });
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: "24px",
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmitGrading}>
                <div className="form-group">
                  <label>Score (out of marks)</label>
                  <input
                    type="number"
                    name="score"
                    value={gradingForm.score}
                    onChange={handleGradingChange}
                    required
                    min="0"
                    placeholder="e.g., 8"
                  />
                </div>

                <div className="form-group">
                  <label>Feedback (optional)</label>
                  <textarea
                    name="feedback"
                    value={gradingForm.feedback}
                    onChange={handleGradingChange}
                    rows="3"
                    placeholder="Add your feedback/comments here"
                  />
                </div>

                <div className="form-group">
                  <label>Upload Graded Answers / Photos *</label>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                    onChange={handleGradedFileChange}
                    multiple
                    required
                  />
                  {(gradingForm.gradedFiles || []).length > 0 && (
                    <div style={{ marginTop: "10px", color: "#28a745" }}>
                      {(gradingForm.gradedFiles || []).map((file) => (
                        <div key={`${file.name}-${file.lastModified}`}>
                          📎 {file.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{ display: "flex", gap: "10px", marginTop: "20px" }}
                >
                  <button
                    type="submit"
                    className="btn btn-success"
                    style={{ flex: 1 }}
                    disabled={submittingGrade}
                  >
                    {submittingGrade ? "Submitting..." : "Submit Grading"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGradingModal(null);
                      setGradingForm({
                        score: "",
                        feedback: "",
                        gradedFiles: [],
                      });
                    }}
                    className="btn btn-secondary"
                    style={{ flex: 1 }}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamDetails;
