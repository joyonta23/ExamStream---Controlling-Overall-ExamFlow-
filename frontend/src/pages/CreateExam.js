import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createExam } from "../services/examService";
import "./DashboardTrend.css";

const CreateExam = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startTime: "",
    examDuration: "",
    uploadDeadline: "",
    totalQuestions: 1,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const start = new Date(formData.startTime);
    const deadline = new Date(formData.uploadDeadline);
    if (deadline <= start) {
      setError("Upload deadline must be after start time");
      return;
    }

    setLoading(true);

    try {
      const exam = await createExam(formData);
      navigate(`/instructor/exam/${exam._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="trend-dashboard-shell">
      <div className="trend-dashboard-grid-bg" />
      <div
        className="trend-dashboard-panel"
        style={{ maxWidth: "750px", margin: "30px auto" }}
      >
        <h2 style={{ color: "#eeeff4", marginBottom: "30px" }}>
          Create New Exam
        </h2>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label style={{ color: "#ffffff" }}>Exam Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="e.g., Mathematics Mid-Term Exam"
            />
          </div>

          <div className="form-group">
            <label style={{ color: "#ffffff" }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Brief description of the exam"
            />
          </div>

          <div className="form-group">
            <label style={{ color: "#ffffff" }}>Start Time *</label>
            <input
              type="datetime-local"
              name="startTime"
              value={formData.startTime}
              onChange={handleChange}
              required
            />
            <small style={{ color: "#f7eaea" }}>
              When should the exam begin?
            </small>
          </div>

          <div className="form-group">
            <label style={{ color: "#ffffff" }}>
              Exam Duration (minutes) *
            </label>
            <input
              type="number"
              name="examDuration"
              value={formData.examDuration}
              onChange={handleChange}
              required
              min="1"
              placeholder="e.g., 60"
            />
            <small style={{ color: "#f3ecec" }}>
              How long students have to complete the exam
            </small>
          </div>

          <div className="form-group">
            <label style={{ color: "#ffffff" }}>Upload Deadline *</label>
            <input
              type="datetime-local"
              name="uploadDeadline"
              value={formData.uploadDeadline}
              onChange={handleChange}
              required
            />
            <small style={{ color: "#f8ebeb" }}>
              Final deadline for students to upload answers (usually after exam
              duration)
            </small>
          </div>

          <div className="form-group">
            <label style={{ color: "#ffffff" }}>Total Questions *</label>
            <input
              type="number"
              name="totalQuestions"
              value={formData.totalQuestions}
              onChange={handleChange}
              required
              min="1"
            />
            <small style={{ color: "#e7e1e1" }}>
              Maximum number of questions planned for this exam
            </small>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ flex: 1 }}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Exam"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/instructor")}
              className="btn btn-secondary"
              style={{ flex: 1 }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExam;
