export const isAuthenticated = () => {
  return localStorage.getItem("token") !== null;
};

export const isAdmin = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user && user.role === "ADMIN";
};
