import { Navigate } from "react-router-dom";
import Layout from "../components/Layout";
import HomePage from "../pages/HomePage";
import ProductDetailPage from "../pages/ProductDetailPage";
import CartPage from "../pages/CartPage";
import OrdersPage from "../pages/OrdersPage";
import OrderDetailPage from "../pages/OrderDetailPage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import AdminPage from "../pages/AdminPage";
import ProfilePage from "../pages/ProfilePage";
import EditProfilePage from "../pages/EditProfilePage";
import AdminProductList from "../pages/AdminProductList";
import AdminProductForm from "../pages/AdminProductForm";
import { isAuthenticated, isAdmin } from "../utils/auth";

export const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" />;
};

export const AdminRoute = ({ children }) => {
  return isAuthenticated() && isAdmin() ? children : <Navigate to="/" />;
};

export const appRoutes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "products/:id", element: <ProductDetailPage /> },
      { path: "cart", element: <CartPage /> },
      {
        path: "orders",
        element: (
          <PrivateRoute>
            <OrdersPage />
          </PrivateRoute>
        ),
      },
      {
        path: "orders/:id",
        element: (
          <PrivateRoute>
            <OrderDetailPage />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <PrivateRoute>
            <ProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "/profile/edit",
        element: (
          <PrivateRoute>
            <EditProfilePage />
          </PrivateRoute>
        ),
      },
      {
        path: "admin",
        element: (
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        ),
      },
      {
        path: "/admin/products",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <AdminProductList />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "/admin/products/new",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      {
        path: "/admin/products/edit/:id",
        element: (
          <PrivateRoute>
            <AdminRoute>
              <AdminProductForm />
            </AdminRoute>
          </PrivateRoute>
        ),
      },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
    ],
  },
];