import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getExams, deleteExam } from "../services/examService";
import "./DashboardTrend.css";

const InstructorDashboard = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const data = await getExams();
      setExams(data);
    } catch (err) {
      setError("Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this exam?")) {
      try {
        await deleteExam(id);
        setExams(exams.filter((exam) => exam._id !== id));
      } catch (err) {
        alert("Failed to delete exam");
      }
    }
  };

  const getStatusClass = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime.getTime() + exam.examDuration * 60000);

    if (now < startTime) return "status-upcoming";
    if (now >= startTime && now < endTime) return "status-ongoing";
    return "status-completed";
  };

  const getStatusText = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(startTime.getTime() + exam.examDuration * 60000);

    if (now < startTime) return "Upcoming";
    if (now >= startTime && now < endTime) return "Ongoing";
    return "Completed";
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="trend-dashboard-shell">
      <div className="trend-dashboard-grid-bg" />
      <div className="trend-dashboard-panel">
        <div className="trend-dashboard-header">
          <h2 className="trend-dashboard-title">Instructor Dashboard</h2>
          <Link
            to="/instructor/create-exam"
            className="btn btn-primary trend-cta-btn"
          >
            + Create New Exam
          </Link>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {exams.length === 0 ? (
          <div className="trend-empty-state">
            <p className="trend-empty-title">No exams created yet.</p>
            <p>Click "Create New Exam" to get started!</p>
          </div>
        ) : (
          <div className="trend-dashboard-cards">
            {exams.map((exam) => (
              <div key={exam._id} className="trend-exam-card">
                <h3 className="trend-exam-title">{exam.title}</h3>
                <p className="trend-exam-desc">{exam.description}</p>

                <div className={`status-badge ${getStatusClass(exam)}`}>
                  {getStatusText(exam)}
                </div>

                <div className="trend-exam-meta">
                  <p>📅 Start: {new Date(exam.startTime).toLocaleString()}</p>
                  <p>⏱️ Duration: {exam.examDuration} minutes</p>
                  <p>
                    📝 Questions: {exam.questions?.length || 0} /{" "}
                    {exam.totalQuestions || exam.questions?.length || 0}
                  </p>
                </div>

                <div className="trend-exam-actions">
                  <Link
                    to={`/instructor/exam/${exam._id}`}
                    className="btn btn-primary"
                  >
                    View Details
                  </Link>
                  <button
                    onClick={() => handleDelete(exam._id)}
                    className="btn btn-danger"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
