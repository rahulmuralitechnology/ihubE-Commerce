import {
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Collapse,
} from "@mui/material";
import { Link } from "react-router-dom";
import {
  Home as HomeIcon,
  ShoppingCart as ShoppingCartIcon,
  History as HistoryIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Inventory as InventoryIcon,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import "./Sidebar.css";

const Sidebar = () => {
  const { user } = useAuth();
  const [adminOpen, setAdminOpen] = useState(false);

  const handleAdminClick = () => {
    setAdminOpen(!adminOpen);
  };

  return (
    <Drawer variant="permanent" className="sidebar-drawer">
      <Toolbar className="sidebar-toolbar" />
      <List className="sidebar-list">
        {/* Regular User Links */}
        <ListItem 
          button 
          component={Link} 
          to="/" 
          className="sidebar-item"
        >
          <ListItemIcon className="sidebar-icon">
            <HomeIcon className="icon" />
          </ListItemIcon>
          <ListItemText 
            primary="Home" 
            className="sidebar-text"
            primaryTypographyProps={{ className: "sidebar-text-primary" }}
          />
        </ListItem>

        <ListItem 
          button 
          component={Link} 
          to="/cart" 
          className="sidebar-item"
        >
          <ListItemIcon className="sidebar-icon">
            <ShoppingCartIcon className="icon" />
          </ListItemIcon>
          <ListItemText 
            primary="Cart" 
            className="sidebar-text"
            primaryTypographyProps={{ className: "sidebar-text-primary" }}
          />
        </ListItem>

        <ListItem 
          button 
          component={Link} 
          to="/orders" 
          className="sidebar-item"
        >
          <ListItemIcon className="sidebar-icon">
            <HistoryIcon className="icon" />
          </ListItemIcon>
          <ListItemText 
            primary="My Orders" 
            className="sidebar-text"
            primaryTypographyProps={{ className: "sidebar-text-primary" }}
          />
        </ListItem>

        {/* Admin Section - Only visible to admins */}
        {user?.role === "ADMIN" && (
          <>
            <Divider className="sidebar-divider" />
            <ListItem 
              button 
              onClick={handleAdminClick} 
              className="sidebar-item admin-header"
            >
              <ListItemIcon className="sidebar-icon">
                <AdminPanelSettingsIcon className="icon" />
              </ListItemIcon>
              <ListItemText 
                primary="Admin Panel" 
                className="sidebar-text"
                primaryTypographyProps={{ className: "sidebar-text-primary" }}
              />
              {adminOpen ? (
                <ExpandLess className="expand-icon" />
              ) : (
                <ExpandMore className="expand-icon" />
              )}
            </ListItem>
            <Collapse 
              in={adminOpen} 
              timeout="auto" 
              unmountOnExit
              className="admin-collapse"
            >
              <List 
                component="div" 
                disablePadding
                className="admin-submenu"
              >
                <ListItem 
                  button 
                  component={Link} 
                  to="/admin" 
                  className="sidebar-item admin-subitem"
                >
                  <ListItemIcon className="sidebar-icon">
                    <AdminPanelSettingsIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Dashboard" 
                    className="sidebar-text"
                    primaryTypographyProps={{ className: "sidebar-text-primary" }}
                  />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/admin/products"
                  className="sidebar-item admin-subitem"
                >
                  <ListItemIcon className="sidebar-icon">
                    <InventoryIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Manage Products" 
                    className="sidebar-text"
                    primaryTypographyProps={{ className: "sidebar-text-primary" }}
                  />
                </ListItem>
                <ListItem
                  button
                  component={Link}
                  to="/admin/products/new"
                  className="sidebar-item admin-subitem"
                >
                  <ListItemIcon className="sidebar-icon">
                    <InventoryIcon className="icon" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="Add New Product" 
                    className="sidebar-text"
                    primaryTypographyProps={{ className: "sidebar-text-primary" }}
                  />
                </ListItem>
              </List>
            </Collapse>
          </>
        )}
      </List>
    </Drawer>
  );
};

export default Sidebar;