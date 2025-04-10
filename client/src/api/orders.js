import api from "./api";

export const placeOrder = (paymentType) => api.post("/orders", { paymentType });
export const getOrders = () => api.get("/orders");
export const getOrder = (id) => api.get(`/orders/${id}`);
export const getOrderWithHistory = (orderId) => {
  return api.get(`/orders/${orderId}/history`);
};

export const updateOrderStatus = (orderId, status) => {
  return api.put(`/admin/orders/${orderId}/status`, { status });
};
