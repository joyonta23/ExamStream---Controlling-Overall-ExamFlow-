import api from "./api";

// Get all pending users
export const getPendingUsers = async () => {
  const response = await api.get("/auth/pending-users");
  return response.data;
};

// Approve a user
export const approveUser = async (userId) => {
  const response = await api.put(`/auth/approve-user/${userId}`);
  return response.data;
};

// Reject a user
export const rejectUser = async (userId) => {
  const response = await api.delete(`/auth/reject-user/${userId}`);
  return response.data;
};

// Get all users (for admin view)
export const getAllUsers = async () => {
  const response = await api.get("/auth/all-users");
  return response.data;
};
