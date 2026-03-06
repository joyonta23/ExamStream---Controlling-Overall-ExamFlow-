import React, { Navigate } from "react-router-dom";
import { isAuthenticated, getCurrentUser } from "../services/authService";

const ProtectedRoute = ({ children, requireRole }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }

  if (requireRole) {
    const user = getCurrentUser();
    if (user.role !== requireRole) {
      return <Navigate to="/" />;
    }
  }

  return children;
};

export default ProtectedRoute;
