import api from "./api";

export const getCart = () => api.get("/cart");
export const addToCart = (productId, quantity) =>
  api.post("/cart", { productId, quantity });
export const updateCartItem = (id, quantity) =>
  api.put(`/cart/${id}`, { quantity });
export const removeFromCart = (id) => api.delete(`/cart/${id}`);
