import React, { useState, useEffect } from "react";
import {
  getPendingUsers,
  approveUser,
  rejectUser,
} from "../services/adminService";
import "./AdminDashboard.css";

const AdminDashboard = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      setError("");
      const users = await getPendingUsers();
      setPendingUsers(users);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch pending users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleApprove = async (userId, userName) => {
    if (!window.confirm(`Approve ${userName}?`)) return;

    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await approveUser(userId);
      setSuccess(`Successfully approved ${userName}`);
      fetchPendingUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to approve user");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId, userName) => {
    if (
      !window.confirm(`Reject and delete ${userName}? This cannot be undone.`)
    )
      return;

    try {
      setActionLoading(userId);
      setError("");
      setSuccess("");
      await rejectUser(userId);
      setSuccess(`Successfully rejected ${userName}`);
      fetchPendingUsers();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reject user");
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-container">
        <div className="admin-header">
          <h1>Admin Dashboard</h1>
          <p>Manage pending user registrations</p>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
            <button onClick={() => setError("")} className="alert-close">
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            {success}
            <button onClick={() => setSuccess("")} className="alert-close">
              ×
            </button>
          </div>
        )}

        <div className="pending-users-card">
          <div className="card-header">
            <h2>Pending Approvals</h2>
            <button
              onClick={fetchPendingUsers}
              className="btn-refresh"
              disabled={loading}
            >
              {loading ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>

          {loading && !pendingUsers.length ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading pending users...</p>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">✓</span>
              <h3>All Caught Up!</h3>
              <p>No pending user registrations at the moment.</p>
            </div>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="user-name">
                          <span className="user-avatar">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                          {user.name}
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>
                        <span className={`role-badge role-${user.role}`}>
                          {user.role === "instructor" ? "👨‍🏫" : "👨‍🎓"} {user.role}
                        </span>
                      </td>
                      <td className="date-cell">
                        {formatDate(user.createdAt)}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleApprove(user._id, user.name)}
                            className="btn-approve"
                            disabled={actionLoading === user._id}
                          >
                            {actionLoading === user._id ? "..." : "✓ Approve"}
                          </button>
                          <button
                            onClick={() => handleReject(user._id, user.name)}
                            className="btn-reject"
                            disabled={actionLoading === user._id}
                          >
                            {actionLoading === user._id ? "..." : "✕ Reject"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
