import {
  Box,
  Typography,
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
} from "@mui/material";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrders } from "../api/orders";
import { format } from "date-fns";
import "./OrdersPage.css";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getOrders();
        setOrders(response.data);
      } catch (error) {
        setError("Failed to load orders. Please try again later.");
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="error-container">
        <Typography className="error-message">{error}</Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          className="retry-button"
        >
          Retry
        </Button>
      </Box>
    );
  }

  if (orders.length === 0) {
    return (
      <Box className="empty-orders-container">
        <Typography className="empty-orders-title" variant="h5" gutterBottom>
          You have no orders yet
        </Typography>
        <Typography className="empty-orders-subtitle" variant="body1" gutterBottom>
          Start shopping to see your orders here
        </Typography>
        <Button
          variant="contained"
          component={Link}
          to="/"
          className="shop-button"
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  return (
    <Box className="orders-page-container">
      <Typography className="page-title" variant="h4" gutterBottom>
        My Orders
      </Typography>
      
      <TableContainer component={Paper} className="orders-table">
        <Table>
          <TableHead className="table-header">
            <TableRow className="header-row">
              <TableCell className="header-cell">Order ID</TableCell>
              <TableCell className="header-cell">Date</TableCell>
              <TableCell className="header-cell">Items</TableCell>
              <TableCell className="header-cell">Total</TableCell>
              <TableCell className="header-cell">Status</TableCell>
              <TableCell className="header-cell">Payment</TableCell>
              <TableCell className="header-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id} className="order-row">
                <TableCell className="order-cell">
                  {order.id.substring(0, 8)}...
                </TableCell>
                <TableCell className="order-cell">
                  {format(new Date(order.createdAt), "MMM dd, yyyy")}
                </TableCell>
                <TableCell className="order-cell">
                  {order.items.length}
                </TableCell>
                <TableCell className="order-cell">
                  ${order.totalAmount.toFixed(2)}
                </TableCell>
                <TableCell className="order-cell">
                  <Chip
                    label={order.status}
                    className={`status-chip ${order.status.toLowerCase()}`}
                  />
                </TableCell>
                <TableCell className="order-cell">
                  {order.paymentType}
                </TableCell>
                <TableCell className="order-cell">
                  <Button
                    variant="outlined"
                    size="small"
                    component={Link}
                    to={`/orders/${order.id}`}
                    className="view-button"
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

export default OrdersPage;