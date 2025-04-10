import {
  Box,
  Typography,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getUsers, getAdminOrders } from "../api/admin";
import { useAuth } from "../contexts/AuthContext";
import "./AdminPage.css";

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        if (tabValue === 0) {
          const response = await getUsers();
          setUsers(response.data);
        } else {
          const response = await getAdminOrders();
          setOrders(response.data);
        }
      } catch (error) {
        setError(error.message || "Failed to fetch data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tabValue]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  if (user?.role !== "ADMIN") {
    return (
      <Box className="admin-access-denied">
        <Alert severity="error" className="admin-alert">
          Admin access required
        </Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="admin-loading">
        <CircularProgress className="admin-spinner" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="admin-error">
        <Alert severity="error" className="admin-alert">
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box className="admin-container">
      <Typography className="admin-title" variant="h4" gutterBottom>
        Admin Panel
      </Typography>
      
      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        className="admin-tabs"
        variant="fullWidth"
      >
        <Tab label="Users" className="admin-tab" />
        <Tab label="Orders" className="admin-tab" />
      </Tabs>

      {tabValue === 0 ? (
        <TableContainer component={Paper} className="admin-table-container">
          <Table className="admin-table">
            <TableHead className="admin-table-head">
              <TableRow className="admin-table-row">
                <TableCell className="admin-table-header">Name</TableCell>
                <TableCell className="admin-table-header">Email</TableCell>
                <TableCell className="admin-table-header">Role</TableCell>
                <TableCell className="admin-table-header">Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="admin-table-body">
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.id} className="admin-table-row">
                    <TableCell className="admin-table-cell">
                      {user.name || "N/A"}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      {user.email}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      <Chip
                        className={`admin-chip ${user.role.toLowerCase()}`}
                        label={user.role}
                        size="small"
                      />
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="admin-table-row">
                  <TableCell colSpan={4} align="center" className="admin-table-cell empty-message">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <TableContainer component={Paper} className="admin-table-container">
          <Table className="admin-table">
            <TableHead className="admin-table-head">
              <TableRow className="admin-table-row">
                <TableCell className="admin-table-header">Order ID</TableCell>
                <TableCell className="admin-table-header">Customer</TableCell>
                <TableCell className="admin-table-header">Date</TableCell>
                <TableCell className="admin-table-header">Items</TableCell>
                <TableCell className="admin-table-header">Total</TableCell>
                <TableCell className="admin-table-header">Status</TableCell>
                <TableCell className="admin-table-header">Payment</TableCell>
                <TableCell className="admin-table-header">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody className="admin-table-body">
              {orders.length > 0 ? (
                orders.map((order) => (
                  <TableRow key={order.id} className="admin-table-row">
                    <TableCell className="admin-table-cell">
                      {order.id?.substring(0, 8) || "N/A"}...
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      {order.user?.name || "Unknown"}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      {order.items?.length || 0}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      ${order.totalAmount?.toFixed(2) || "0.00"}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      <Chip
                        className={`admin-chip ${order.status?.toLowerCase() || 'unknown'}`}
                        label={order.status || "UNKNOWN"}
                        size="small"
                      />
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      {order.paymentType || "N/A"}
                    </TableCell>
                    <TableCell className="admin-table-cell">
                      <Button
                        className="admin-view-button"
                        variant="outlined"
                        size="small"
                        component={Link}
                        to={`/orders/${order.id}`}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow className="admin-table-row">
                  <TableCell colSpan={8} align="center" className="admin-table-cell empty-message">
                    No orders found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default AdminPage;