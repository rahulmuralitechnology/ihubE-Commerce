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
  Alert,
} from "@mui/material";
import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getOrder } from "../api/orders";
import { format } from "date-fns";
import { useAuth } from "../contexts/AuthContext";
import OrderStatusManager from "../components/OrderStatusManager";
import "./OrderDetailPage.css";

const OrderDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await getOrder(id);
        if (response.data) {
          setOrder(response.data);
        } else {
          setError("Order data not found");
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order details");
        console.error("Error fetching order:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id]);

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
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
        <Button
          component={Link}
          to="/orders"
          variant="contained"
          className="back-button"
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  if (!order) {
    return (
      <Box className="not-found-container">
        <Typography variant="h6" className="not-found-text">
          Order not found
        </Typography>
        <Button
          component={Link}
          to="/orders"
          variant="contained"
          className="back-button"
        >
          Back to Orders
        </Button>
      </Box>
    );
  }

  // Safely check user and order.user
  const isAuthorized =
    user && (user.id === order?.userId || user.role === "ADMIN");
  const customerName = order.user?.name || "Unknown Customer";

  if (!isAuthorized) {
    return (
      <Box className="unauthorized-container">
        <Alert severity="error" className="error-alert">
          You are not authorized to view this order
        </Alert>
        <Button
          component={Link}
          to="/orders"
          variant="contained"
          className="back-button"
        >
          Back to Your Orders
        </Button>
      </Box>
    );
  }

  return (
    <Box className="order-detail-container">
      <Box className="order-header">
        <Typography variant="h4" className="order-title">
          Order #{order.id?.substring(0, 8) || "N/A"}
        </Typography>
        <Chip
          label={order.status || "UNKNOWN"}
          className={`status-chip ${order.status?.toLowerCase()}`}
          size="medium"
        />
      </Box>

      <Box className="order-meta">
        <Typography variant="subtitle1" className="meta-item">
          <strong>Order Date:</strong>{" "}
          {order.createdAt
            ? format(new Date(order.createdAt), "MMMM dd, yyyy HH:mm")
            : "N/A"}
        </Typography>
        <Typography variant="subtitle1" className="meta-item">
          <strong>Customer:</strong> {customerName}
        </Typography>
        <Typography variant="subtitle1" className="meta-item">
          <strong>Payment Method:</strong> {order.paymentType || "N/A"}
        </Typography>
        <Typography variant="subtitle1" className="meta-item">
          <strong>Total Amount:</strong> $
          {order.totalAmount?.toFixed(2) || "0.00"}
        </Typography>
      </Box>

      <Typography variant="h5" className="section-title">
        Order Items
      </Typography>
      <TableContainer component={Paper} className="order-items-table">
        <Table>
          <TableHead>
            <TableRow className="table-header-row">
              <TableCell className="table-header-cell">Product</TableCell>
              <TableCell className="table-header-cell">Unit Price</TableCell>
              <TableCell className="table-header-cell">Quantity</TableCell>
              <TableCell className="table-header-cell">Total</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {order.items?.length > 0 ? (
              order.items.map((item) => (
                <TableRow key={item.id} className="table-row">
                  <TableCell className="product-cell">
                    <Box className="product-info">
                      {item.product?.image && (
                        <img
                          src={item.product.image}
                          alt={item.product.name || "Product image"}
                          className="product-image"
                        />
                      )}
                      <Box className="product-details">
                        <Typography className="product-name">
                          {item.product?.name || "Unknown Product"}
                        </Typography>
                        {item.product?.id && (
                          <Typography className="product-sku">
                            SKU: {item.product.id.substring(0, 8)}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell className="price-cell">
                    ${item.price?.toFixed(2) || "0.00"}
                  </TableCell>
                  <TableCell className="quantity-cell">
                    {item.quantity || 0}
                  </TableCell>
                  <TableCell className="total-cell">
                    ${((item.price || 0) * (item.quantity || 0)).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="table-row">
                <TableCell colSpan={4} align="center" className="empty-cell">
                  No items found in this order
                </TableCell>
              </TableRow>
            )}
            <TableRow className="table-row">
              <TableCell colSpan={3} align="right" className="subtotal-label">
                <Typography variant="subtitle1">Subtotal:</Typography>
              </TableCell>
              <TableCell className="subtotal-value">
                <Typography variant="subtitle1">
                  $
                  {order.items
                    ?.reduce(
                      (sum, item) =>
                        sum + (item.price || 0) * (item.quantity || 0),
                      0
                    )
                    .toFixed(2) || "0.00"}
                </Typography>
              </TableCell>
            </TableRow>
            <TableRow className="table-row">
              <TableCell colSpan={3} align="right" className="total-label">
                <Typography variant="subtitle1">Total:</Typography>
              </TableCell>
              <TableCell className="total-value">
                <Typography variant="subtitle1" fontWeight="bold">
                  ${order.totalAmount?.toFixed(2) || "0.00"}
                </Typography>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      {/* Order Status Management Section */}
      {order.id && (
        <OrderStatusManager
          orderId={order.id}
          isAdmin={user?.role === "ADMIN"}
          currentStatus={order.status}
          className="status-manager"
        />
      )}

      <Box className="action-buttons">
        <Button
          variant="contained"
          component={Link}
          to="/orders"
          className="back-button"
        >
          Back to Orders
        </Button>
        {user?.role === "ADMIN" && (
          <Button
            variant="outlined"
            component={Link}
            to="/orders"
            className="view-all-button"
          >
            View All Orders
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default OrderDetailPage;