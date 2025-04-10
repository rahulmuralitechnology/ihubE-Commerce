import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Badge,
} from "@mui/material";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useState } from "react";
import { isAuthenticated } from "../utils/auth";
import "./Header.css";

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState(null);
  const navigate = useNavigate();

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate("/login");
  };

  // Calculate total items in cart
  const cartItemCount = isAuthenticated()
    ? cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0
    : JSON.parse(localStorage.getItem("guestCart"))?.items?.length || 0;

  return (
    <AppBar position="fixed" className="header-appbar">
      <Toolbar className="header-toolbar">
        <Typography variant="h6" component="div" className="header-logo">
          <Link to="/" className="logo-link">
            ShopGenZ
          </Link>
        </Typography>

        {isAuthenticated() ? (
          <div className="auth-section">
            <IconButton color="inherit" component={Link} to="/cart" className="cart-icon">
              <Badge
                badgeContent={cartItemCount}
                color="error"
                overlap="circular"
                max={99}
                className="cart-badge"
              >
                <ShoppingCartIcon className="cart-icon-svg" />
              </Badge>
            </IconButton>
            <Button color="inherit" onClick={handleMenuOpen} className="user-menu-button">
              <Avatar
                className="user-avatar"
                src={user?.avatar || "/default-avatar.jpg"}
              />
              <span className="user-name">{user?.name}</span>
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              className="user-dropdown-menu"
              PaperProps={{
                className: "menu-paper",
              }}
            >
              <MenuItem
                onClick={() => {
                  navigate("/profile");
                  handleMenuClose();
                }}
                className="menu-item"
              >
                Profile
              </MenuItem>
              <MenuItem
                onClick={() => {
                  navigate("/orders");
                  handleMenuClose();
                }}
                className="menu-item"
              >
                My Orders
              </MenuItem>
              {user?.role === "ADMIN" && (
                <MenuItem
                  onClick={() => {
                    navigate("/admin");
                    handleMenuClose();
                  }}
                  className="menu-item"
                >
                  Admin Panel
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout} className="menu-item logout-item">
                Logout
              </MenuItem>
            </Menu>
          </div>
        ) : (
          <div className="guest-section">
            <Button color="inherit" component={Link} to="/login" className="auth-button">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register" className="auth-button register-button">
              Register
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;