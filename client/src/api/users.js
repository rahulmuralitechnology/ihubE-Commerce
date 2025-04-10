import api from "./api";

export const updateUser = (userId, userData) => {
  return api.put(`/users/${userId}`, userData);
};

export const changePassword = (userId, passwordData) => {
  return api.put(`/users/${userId}/password`, passwordData);
};
