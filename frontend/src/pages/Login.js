import React, { useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { login, googleLogin } from "../services/authService";
import { useGoogleLogin } from "@react-oauth/google";

const Login = () => {
  const [searchParams] = useSearchParams();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const roleContext = searchParams.get("role");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const user = await login(formData);

      if (user.role === "instructor") {
        navigate("/instructor");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Login failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const roleDisplay = {
    instructor: {
      title: "Instructor Login",
      icon: "👨‍🏫",
      subtitle: "Access your dashboard and manage exams",
    },
    student: {
      title: "Student Login",
      icon: "👨‍🎓",
      subtitle: "Take exams and view your grades",
    },
    default: {
      title: "Login to ExamStream",
      icon: "🔐",
      subtitle: "Sign in to your account",
    },
  };

  const currentRole = roleDisplay[roleContext] || roleDisplay.default;

  const hasGoogleOAuthClient = Boolean(process.env.REACT_APP_GOOGLE_CLIENT_ID);

  const handleGoogleSuccess = async (tokenResponse) => {
    setError("");
    setLoading(true);

    try {
      const user = await googleLogin(
        tokenResponse.access_token,
        roleContext || "student",
      );

      if (user.role === "instructor") {
        navigate("/instructor");
      } else if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/student");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        "Google sign-in failed. Please try again.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google sign-in was cancelled or failed.");
  };

  const googleSignIn = useGoogleLogin({
    flow: "implicit",
    onSuccess: handleGoogleSuccess,
    onError: handleGoogleError,
  });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-left">
          <div className="auth-logo">
            <span className="auth-logo-icon">📘</span>
            <span className="auth-logo-name">ExamStream</span>
          </div>

          <div className="auth-tagline">
            <h1>{currentRole.title}</h1>
            <p>{currentRole.subtitle}</p>
          </div>

          <div className="auth-tabs">
            <Link to="/register" className="auth-tab">
              Sign Up
            </Link>
            <span className="auth-tab active">Sign In</span>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label>Email</label>
              <div className="auth-input-wrap">
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="Input your email"
                />
              </div>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <div className="auth-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Input your password"
                />
                <button
                  type="button"
                  className="auth-eye"
                  onClick={() => setShowPassword((value) => !value)}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="auth-btn-primary"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="auth-divider">or continue with</div>

            <div className="auth-social-row">
              <button
                type="button"
                className="auth-btn-social"
                disabled={loading || !hasGoogleOAuthClient}
                onClick={() => {
                  if (hasGoogleOAuthClient) {
                    googleSignIn();
                  }
                }}
                title={
                  hasGoogleOAuthClient
                    ? "Continue with Google"
                    : "Google sign-in is not configured"
                }
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  style={{ marginRight: "8px" }}
                >
                  <path
                    d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9.003 18c2.43 0 4.467-.806 5.956-2.18L12.05 13.56c-.806.54-1.836.86-3.047.86-2.344 0-4.328-1.584-5.036-3.711H.96v2.332C2.44 15.983 5.485 18 9.003 18z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9.001c0 1.452.348 2.827.957 4.041l3.007-2.332z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9.003 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.464.891 11.428 0 9.003 0 5.485 0 2.44 2.017.96 4.958L3.967 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
                    fill="#EA4335"
                  />
                </svg>
                {hasGoogleOAuthClient ? "Google" : "Google (Unavailable)"}
              </button>
            </div>

            <p className="auth-switch">
              Don't have an account? <Link to="/register">Sign Up</Link>
            </p>
            {roleContext && (
              <p className="auth-switch">
                <Link to="/">← Back to home</Link>
              </p>
            )}
          </form>
        </div>

        <div className="auth-right auth-right-exam">
          <div className="auth-right-overlay">
            <h2>Practice. Perform. Progress.</h2>
            <p>
              Manage exams, submit answers, and track feedback in one clean and
              secure platform.
            </p>
            <div className="auth-badges">
              <span>⏱ Timed</span>
              <span>☁ Cloud</span>
              <span>✅ Graded</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
