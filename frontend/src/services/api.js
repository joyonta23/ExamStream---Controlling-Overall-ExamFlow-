import axios from "axios";

const DEFAULT_PROD_API_URL = "https://examsstream-backend.onrender.com/api";

const normalizeApiUrl = (rawUrl) => {
  if (!rawUrl || typeof rawUrl !== "string") {
    return "";
  }

  const trimmed = rawUrl.trim();
  if (!trimmed) {
    return "";
  }

  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;

  try {
    const parsed = new URL(withProtocol);
    const cleanPath = parsed.pathname.replace(/\/+$/, "");
    const hasApiPath = /\/api(\/|$)/.test(cleanPath);
    parsed.pathname = hasApiPath
      ? cleanPath || "/"
      : `${cleanPath || ""}/api`.replace(/\/+/g, "/");
    return parsed.toString().replace(/\/+$/, "");
  } catch {
    return "";
  }
};

const resolveApiUrl = () => {
  const envUrl = normalizeApiUrl(process.env.REACT_APP_API_URL);
  if (envUrl) {
    return envUrl;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:5000/api";
    }
  }

  return DEFAULT_PROD_API_URL;
};

const API_URL = resolveApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Handle unauthorized responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

export default api;
