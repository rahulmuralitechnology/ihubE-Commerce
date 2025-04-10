import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  CircularProgress,
  Alert
} from "@mui/material";
import { Link } from "react-router-dom";
import { getOrders } from "../api/admin";
import { useAuth } from "../contexts/AuthContext";
import "./AdminOrdersPage.css";

const AdminOrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await getOrders();
        setOrders(response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (user?.role !== "ADMIN") {
    return (
      <Box className="access-denied">
        <CircularProgress className="access-denied-icon" />
        <Typography className="access-denied-text">
          Admin access required
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box className="loading-spinner">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert className="error-alert" severity="error">
        {error}
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Box className="empty-state">
        <CircularProgress className="empty-state-icon" />
        <Typography className="empty-state-text">
          No orders found
        </Typography>
      </Box>
    );
  }

  return (
    <Box className="admin-orders-container">
      <Typography className="admin-orders-title" variant="h4" gutterBottom>
        Order Management
      </Typography>

      <TableContainer className="admin-orders-table" component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="order-row">
                <TableCell className="order-id-cell">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell className="customer-cell">
                  {order.user.name}
                </TableCell>
                <TableCell>
                  {new Date(order.createdAt).toLocaleDateString()}
                </TableCell>
                <TableCell>${order.totalAmount.toFixed(2)}</TableCell>
                <TableCell>
                  <Chip
                    className={`status-chip ${order.status}`}
                    label={order.status}
                  />
                </TableCell>
                <TableCell>
                  <Button
                    className="view-order-btn"
                    component={Link}
                    to={`/orders/${order.id}`}
                    variant="outlined"
                    size="small"
                  >
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default AdminOrdersPage;