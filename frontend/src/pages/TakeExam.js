import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getExam, getExamStatus } from "../services/examService";
import { getQuestionsByExam } from "../services/questionService";
import { submitAnswer, getMyAnswers } from "../services/answerService";
import { getGradingsByStudent } from "../services/gradingService";
import Timer from "../components/Timer";
import { getCurrentUser } from "../services/authService";
import "./DashboardTrend.css";

const TakeExam = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [myAnswers, setMyAnswers] = useState([]);
  const [gradings, setGradings] = useState([]);
  const [examStatus, setExamStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [uploadingFor, setUploadingFor] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState({});

  useEffect(() => {
    fetchExamData();
    const interval = setInterval(fetchExamStatus, 10000); // Update status every 10 seconds
    return () => clearInterval(interval);
  }, [id]);

  const fetchExamData = async () => {
    try {
      const user = getCurrentUser();
      const [examData, questionsData, answersData, statusData, gradingsData] =
        await Promise.all([
          getExam(id),
          getQuestionsByExam(id),
          getMyAnswers(id),
          getExamStatus(id),
          getGradingsByStudent(user._id, id),
        ]);
      setExam(examData);
      setQuestions(questionsData);
      setMyAnswers(answersData);
      setExamStatus(statusData);
      setGradings(gradingsData);
    } catch (err) {
      setError("Failed to fetch exam details");
    } finally {
      setLoading(false);
    }
  };

  const fetchExamStatus = async () => {
    try {
      const statusData = await getExamStatus(id);
      setExamStatus(statusData);
    } catch (err) {
      console.error("Failed to update exam status");
    }
  };

  const handleFileSelect = (questionId, files) => {
    setSelectedFiles({
      ...selectedFiles,
      [questionId]: Array.from(files || []),
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

  const handleSubmitAnswer = async (questionId) => {
    const files = selectedFiles[questionId] || [];

    if (files.length === 0) {
      alert("Please select at least one file to upload");
      return;
    }

    if (!examStatus?.canUpload) {
      alert("Upload deadline has passed");
      return;
    }

    setUploadingFor(questionId);

    const formData = new FormData();
    formData.append("examId", id);
    formData.append("questionId", questionId);
    files.forEach((file) => {
      formData.append("answerFiles", file);
    });

    try {
      await submitAnswer(formData);
      alert("Answer submitted successfully!");

      // Refresh answers
      const answersData = await getMyAnswers(id);
      setMyAnswers(answersData);

      // Clear selected file
      setSelectedFiles({
        ...selectedFiles,
        [questionId]: [],
      });
    } catch (err) {
      alert(err.response?.data?.message || "Failed to submit answer");
    } finally {
      setUploadingFor(null);
    }
  };

  const isAnswered = (questionId) => {
    return myAnswers.some((answer) => answer.question?._id === questionId);
  };

  const getAnswer = (questionId) => {
    return myAnswers.find((answer) => answer.question?._id === questionId);
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

  const now = new Date();
  const startTime = new Date(exam.startTime);
  const examHasStarted = now >= startTime;

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
          <h2 style={{ color: "#eeeff6" }}>{exam.title}</h2>
          <button
            onClick={() => navigate("/student")}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ marginBottom: "30px", color: "#333" }}>
          <p
            style={{ color: "#b8bbc8", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#e3e4ea" }}>Description:</strong>{" "}
            {exam.description}
          </p>
          <p
            style={{ color: "#cdd1de", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#ecedf0" }}>Duration:</strong>{" "}
            {exam.examDuration} minutes
          </p>
          <p
            style={{ color: "#f0f3ff", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#e8eaf4" }}>Total Questions:</strong>{" "}
            {questions.length} / {exam.totalQuestions || questions.length}
          </p>
          <p
            style={{ color: "#e7e8ef", fontSize: "15px", marginBottom: "10px" }}
          >
            <strong style={{ color: "#e4e6f0" }}>Answered:</strong>{" "}
            {myAnswers.length} / {questions.length}
          </p>
        </div>

        {/* Timers */}
        {examStatus && (
          <div style={{ marginBottom: "30px" }}>
            {!examHasStarted && (
              <Timer
                targetTime={examStatus.startTime}
                label="⏰ Exam Starts In"
                warningThreshold={600000}
              />
            )}

            {examHasStarted && examStatus.status === "ongoing" && (
              <Timer
                targetTime={examStatus.endTime}
                label="⏱️ Exam Time Remaining"
                warningThreshold={300000}
                onExpire={fetchExamStatus}
              />
            )}

            {(examStatus.status === "upload_period" ||
              examStatus.status === "ongoing") && (
              <Timer
                targetTime={examStatus.uploadDeadline}
                label="📤 Upload Deadline"
                warningThreshold={600000}
                onExpire={fetchExamStatus}
              />
            )}

            {examStatus.status === "completed" && (
              <div className="alert alert-info">
                This exam has ended. No more submissions are allowed.
              </div>
            )}
          </div>
        )}

        {/* Questions */}
        <div style={{ borderTop: "2px solid #e0e0e0", paddingTop: "30px" }}>
          <h3 style={{ marginBottom: "20px", color: "#1a1a1a" }}>Questions</h3>

          {!examHasStarted && (
            <div className="alert alert-info">
              The exam has not started yet. Questions will be available once the
              exam begins.
            </div>
          )}

          {examHasStarted && questions.length === 0 && (
            <p style={{ textAlign: "center", color: "#333", padding: "30px" }}>
              No questions available for this exam.
            </p>
          )}

          {examHasStarted &&
            questions.map((question) => {
              const answered = isAnswered(question._id);
              const answer = getAnswer(question._id);
              const canUpload = examStatus?.canUpload;
              const grading = gradings.find(
                (g) => g.answer?._id === answer?._id,
              );
              const answerFileUrls = getAnswerFileUrls(answer);
              const gradingFileUrls = getGradingFileUrls(grading);

              return (
                <div key={question._id} className="question-card">
                  <h4 style={{ color: "#667eea", marginBottom: "15px" }}>
                    Question {question.questionNumber}
                    {answered && (
                      <span style={{ color: "#28a745", marginLeft: "10px" }}>
                        ✓ Answered
                      </span>
                    )}
                    {grading && (
                      <span style={{ color: "#28a745", marginLeft: "10px" }}>
                        ✓ Graded
                      </span>
                    )}
                  </h4>

                  <p
                    style={{
                      fontSize: "16px",
                      marginBottom: "15px",
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
                    <div style={{ marginTop: "10px", marginBottom: "10px" }}>
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

                  <p style={{ color: "#333", marginTop: "10px" }}>
                    <strong style={{ color: "#1a1a1a" }}>Marks:</strong>{" "}
                    {question.marks}
                  </p>

                  {answered && (
                    <div
                      style={{
                        marginTop: "20px",
                        padding: "15px",
                        background: "#d4edda",
                        borderRadius: "8px",
                      }}
                    >
                      <p style={{ color: "#155724" }}>
                        <strong>Your Answer:</strong>
                      </p>
                      <p style={{ color: "#155724", marginTop: "5px" }}>
                        Submitted on{" "}
                        {new Date(answer.submittedAt).toLocaleString()}
                        {answer.isLate && (
                          <span style={{ color: "#f5576c" }}> (Late)</span>
                        )}
                      </p>
                      <div style={{ marginTop: "10px" }}>
                        {answerFileUrls.length > 0 ? (
                          answerFileUrls.map((fileUrl, index) => (
                            <a
                              key={fileUrl}
                              href={fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-primary"
                              style={{
                                marginRight: "8px",
                                marginBottom: "8px",
                              }}
                            >
                              View Uploaded Answer {index + 1}
                            </a>
                          ))
                        ) : (
                          <p style={{ color: "#721c24", marginTop: "10px" }}>
                            Answer file URL is missing
                          </p>
                        )}
                      </div>

                      {grading && (
                        <div
                          style={{
                            marginTop: "15px",
                            borderTop: "1px solid #155724",
                            paddingTop: "15px",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "18px",
                              marginTop: "10px",
                              color: "#155724",
                            }}
                          >
                            <strong>📊 Score:</strong> {grading.score}/
                            {question.marks}
                          </p>
                          {grading.feedback && (
                            <div
                              style={{
                                marginTop: "10px",
                                background: "#fff9e6",
                                padding: "10px",
                                borderRadius: "5px",
                                borderLeft: "3px solid #ff9800",
                              }}
                            >
                              <p style={{ color: "#333" }}>
                                <strong>📝 Feedback:</strong>
                              </p>
                              <p style={{ marginTop: "5px", color: "#333" }}>
                                {grading.feedback}
                              </p>
                            </div>
                          )}
                          <div style={{ marginTop: "10px" }}>
                            {gradingFileUrls.length > 0 ? (
                              gradingFileUrls.map((fileUrl, index) => (
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
                                  View Marked Answer {index + 1}
                                </a>
                              ))
                            ) : (
                              <p
                                style={{ color: "#721c24", marginTop: "10px" }}
                              >
                                Graded file URL is missing
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div
                    className={`upload-area ${!canUpload ? "disabled" : ""}`}
                    style={{ marginTop: "20px" }}
                  >
                    {!canUpload ? (
                      <p style={{ color: "#721c24" }}>
                        🔒 Upload is no longer allowed. The deadline has passed.
                      </p>
                    ) : (
                      <>
                        <div className="file-input-wrapper">
                          <input
                            type="file"
                            id={`file-${question._id}`}
                            onChange={(e) =>
                              handleFileSelect(question._id, e.target.files)
                            }
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                            multiple
                            disabled={uploadingFor === question._id}
                          />
                          <label
                            htmlFor={`file-${question._id}`}
                            className="file-input-label"
                          >
                            📎 Choose Files
                          </label>
                          {selectedFiles[question._id] && (
                            <span className="file-name">
                              {(selectedFiles[question._id] || []).length > 0
                                ? `${(selectedFiles[question._id] || []).length} file(s) selected`
                                : ""}
                            </span>
                          )}
                        </div>

                        {(selectedFiles[question._id] || []).length > 0 && (
                          <div
                            style={{
                              marginTop: "10px",
                              fontSize: "13px",
                              color: "#444",
                            }}
                          >
                            {(selectedFiles[question._id] || []).map((file) => (
                              <div key={`${file.name}-${file.lastModified}`}>
                                - {file.name}
                              </div>
                            ))}
                          </div>
                        )}

                        <button
                          onClick={() => handleSubmitAnswer(question._id)}
                          className="btn btn-success"
                          style={{ marginTop: "15px" }}
                          disabled={
                            (selectedFiles[question._id] || []).length === 0 ||
                            uploadingFor === question._id
                          }
                        >
                          {uploadingFor === question._id
                            ? "Uploading..."
                            : answered
                              ? "📤 Resubmit Answer"
                              : "📤 Submit Answer"}
                        </button>

                        <p
                          style={{
                            marginTop: "10px",
                            fontSize: "14px",
                            color: "#333",
                          }}
                        >
                          Accepted formats: PDF, DOC, DOCX, JPG, PNG, TXT (Max
                          10MB each, up to 10 files)
                        </p>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default TakeExam;
