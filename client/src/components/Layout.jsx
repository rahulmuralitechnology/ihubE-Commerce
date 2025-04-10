import { Box, CssBaseline, Toolbar } from "@mui/material";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";
import { useAuth } from "../contexts/AuthContext";
import "./Layout.css";

const Layout = () => {
  const { user } = useAuth();

  return (
    <Box className="layout-container">
      <CssBaseline />
      <Header />
      {user && <Sidebar />}
      <Box component="main" className="main-content">
        <Toolbar className="main-toolbar" />
        <Box className="content-container">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;