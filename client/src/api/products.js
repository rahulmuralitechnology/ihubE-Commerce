import api from "./api";

export const getProducts = (params = {}) => {
  return api.get("/products", { params });
};
export const getProduct = (id) => api.get(`/products/${id}`);
export const createProduct = (productData) =>
  api.post("/admin/products", productData);
export const updateProduct = (id, productData) =>
  api.put(`/admin/products/${id}`, productData);
export const deleteProduct = (id) => api.delete(`/admin/products/${id}`);
export const createMultipleProducts = (products) => {
  return api.post("/admin/products/bulk", products);
};
