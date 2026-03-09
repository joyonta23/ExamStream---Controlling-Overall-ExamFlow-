import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import "./Login.css";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to process request");
      } else {
        setMessage(data.message);
        setSubmitted(true);
        setEmail("");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      console.error("Forgot password error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2>Forgot Your Password?</h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          No worries! We'll send you a link to reset it.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                style={{
                  backgroundColor: loading ? "#f0f0f0" : "white",
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  color: "#d32f2f",
                  padding: "10px",
                  backgroundColor: "#ffebee",
                  borderRadius: "4px",
                  marginBottom: "15px",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email}
              style={{
                opacity: loading || !email ? 0.6 : 1,
                cursor: loading || !email ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div
            style={{
              backgroundColor: "#f0f7ff",
              border: "1px solid #667eea",
              borderRadius: "8px",
              padding: "20px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "40px",
                marginBottom: "10px",
                color: "#4caf50",
              }}
            >
              ✓
            </div>
            <h3 style={{ color: "#333", marginBottom: "10px" }}>
              Check Your Email
            </h3>
            <p style={{ color: "#666", marginBottom: "15px" }}>
              We've sent a password reset link to <strong>{email}</strong>
            </p>
            <p
              style={{ color: "#999", fontSize: "14px", marginBottom: "20px" }}
            >
              The link expires in 10 minutes. Check your spam folder if you
              don't see it.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Back to Login
            </button>
          </div>
        )}

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "#666" }}>
            Remember your password?{" "}
            <Link
              to="/login"
              style={{
                color: "#667eea",
                textDecoration: "none",
                fontWeight: "bold",
              }}
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
