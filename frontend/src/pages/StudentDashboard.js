import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getExams } from "../services/examService";
import "./DashboardTrend.css";

const StudentDashboard = () => {
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

  const getStatusClass = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.uploadDeadline);

    if (now < startTime) return "status-upcoming";
    if (now >= startTime && now < endTime) return "status-ongoing";
    return "status-completed";
  };

  const getStatusText = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);
    const endTime = new Date(exam.uploadDeadline);

    if (now < startTime) return "Not Started";
    if (now >= startTime && now < endTime) return "Active";
    return "Closed";
  };

  const getTimeInfo = (exam) => {
    const now = new Date();
    const startTime = new Date(exam.startTime);

    if (now < startTime) {
      const timeUntil = startTime - now;
      const hours = Math.floor(timeUntil / (1000 * 60 * 60));
      const minutes = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
      return `Starts in ${hours}h ${minutes}m`;
    }
    return "Available Now";
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="trend-dashboard-shell">
      <div className="trend-dashboard-grid-bg" />
      <div className="trend-dashboard-panel">
        <div className="trend-dashboard-header">
          <h2 className="trend-dashboard-title">Student Dashboard</h2>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {exams.length === 0 ? (
          <div className="trend-empty-state">
            <p className="trend-empty-title">
              No exams available at the moment.
            </p>
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
                  <p>⏰ {getTimeInfo(exam)}</p>
                </div>

                <Link
                  to={`/student/exam/${exam._id}`}
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: "20px" }}
                >
                  View Exam
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
