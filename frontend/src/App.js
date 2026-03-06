import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import InstructorDashboard from "./pages/InstructorDashboard";
import CreateExam from "./pages/CreateExam";
import ExamDetails from "./pages/ExamDetails";
import StudentDashboard from "./pages/StudentDashboard";
import TakeExam from "./pages/TakeExam";
import AdminDashboard from "./pages/AdminDashboard";
import { isAuthenticated, getCurrentUser } from "./services/authService";

function App() {
  return (
    <Router
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Instructor Routes */}
          <Route
            path="/instructor"
            element={
              <ProtectedRoute requireRole="instructor">
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/create-exam"
            element={
              <ProtectedRoute requireRole="instructor">
                <CreateExam />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor/exam/:id"
            element={
              <ProtectedRoute requireRole="instructor">
                <ExamDetails />
              </ProtectedRoute>
            }
          />

          {/* Student Routes */}
          <Route
            path="/student"
            element={
              <ProtectedRoute requireRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/exam/:id"
            element={
              <ProtectedRoute requireRole="student">
                <TakeExam />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireRole="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Catch all - redirect based on role */}
          <Route
            path="*"
            element={
              isAuthenticated() ? (
                getCurrentUser()?.role === "instructor" ? (
                  <Navigate to="/instructor" />
                ) : getCurrentUser()?.role === "admin" ? (
                  <Navigate to="/admin" />
                ) : (
                  <Navigate to="/student" />
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
