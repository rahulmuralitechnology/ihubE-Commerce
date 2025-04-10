import api from "./api";

export const getUsers = () => api.get("/admin/users");
export const getAdminOrders = () => api.get("/admin/orders");
