import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);
  const navigate = useNavigate();

  const token = searchParams.get("token");

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("No reset token provided. Request a new password reset.");
        setValidating(false);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.REACT_APP_API_URL}/auth/validate-reset-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          },
        );

        const data = await response.json();

        if (response.ok && data.valid) {
          setTokenValid(true);
          setUserEmail(data.email);
          setValidating(false);
        } else {
          setError(data.message || "Invalid or expired reset token");
          setValidating(false);
        }
      } catch (err) {
        setError("Network error. Please try again later.");
        setValidating(false);
        console.error("Token validation error:", err);
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/reset-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, password }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to reset password");
      } else {
        setMessage(data.message);
        setResetSuccess(true);
        setPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError("Network error. Please try again later.");
      console.error("Password reset error:", err);
    } finally {
      setLoading(false);
    }
  };

  const containerStyle = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    padding: "20px",
  };

  const cardStyle = {
    backgroundColor: "white",
    padding: "40px",
    borderRadius: "8px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    maxWidth: "500px",
    width: "100%",
  };

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "16px",
    marginTop: "8px",
    boxSizing: "border-box",
  };

  const buttonStyle = {
    width: "100%",
    padding: "12px",
    backgroundColor: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "4px",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "20px",
  };

  if (validating) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ textAlign: "center", padding: "40px 20px" }}>
            <div
              style={{
                display: "inline-block",
                animation: "spin 1s linear infinite",
              }}
            >
              ⏳
            </div>
            <p style={{ color: "#666", marginTop: "15px" }}>
              Validating your reset link...
            </p>
          </div>
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#ffebee",
              borderRadius: "8px",
              marginBottom: "20px",
            }}
          >
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>❌</div>
            <h3 style={{ color: "#d32f2f", marginBottom: "10px" }}>
              Reset Link Invalid
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
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
              Request New Link
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (resetSuccess) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              backgroundColor: "#f0f7ff",
              borderRadius: "8px",
            }}
          >
            <div
              style={{
                fontSize: "50px",
                marginBottom: "15px",
                color: "#4caf50",
              }}
            >
              ✓
            </div>
            <h3 style={{ color: "#333", marginBottom: "10px" }}>
              Password Reset Successful!
            </h3>
            <p style={{ color: "#666", marginBottom: "20px" }}>
              Your password has been changed. You can now log in with your new
              password.
            </p>
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor: "#667eea",
                color: "white",
                border: "none",
                padding: "12px 30px",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "16px",
              }}
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <h2 style={{ marginBottom: "10px", color: "#333" }}>
          Reset Your Password
        </h2>
        <p style={{ color: "#666", marginBottom: "30px" }}>
          Enter your new password for {userEmail}
        </p>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="password"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              required
              disabled={loading}
              style={{
                ...inputStyle,
                backgroundColor: loading ? "#f0f0f0" : "white",
                cursor: loading ? "not-allowed" : "text",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label
              htmlFor="confirmPassword"
              style={{
                display: "block",
                marginBottom: "5px",
                fontWeight: "500",
                color: "#333",
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              required
              disabled={loading}
              style={{
                ...inputStyle,
                backgroundColor: loading ? "#f0f0f0" : "white",
                cursor: loading ? "not-allowed" : "text",
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

          {message && (
            <div
              style={{
                color: "#4caf50",
                padding: "10px",
                backgroundColor: "#f1f8f4",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password || !confirmPassword}
            style={{
              ...buttonStyle,
              opacity: loading || !password || !confirmPassword ? 0.6 : 1,
              cursor:
                loading || !password || !confirmPassword
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        <div style={{ marginTop: "20px", textAlign: "center" }}>
          <p style={{ color: "#666" }}>
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

export default ResetPassword;
