import { useState, useEffect } from "react";
import {
  Box,
  Button,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
} from "@mui/material";
import { updateOrderStatus, getOrderWithHistory } from "../api/orders";
import { format } from "date-fns";
import "./OrderStatusManager.css";

const statusOptions = [
  { value: "PENDING", label: "Pending" },
  { value: "PROCESSING", label: "Processing" },
  { value: "SHIPPED", label: "Shipped" },
  { value: "DELIVERED", label: "Delivered" },
  { value: "CANCELLED", label: "Cancelled" },
];

const OrderStatusManager = ({ orderId, isAdmin }) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await getOrderWithHistory(orderId);
        setOrder(response.data);
        setSelectedStatus(response.data.status);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId]);

  const handleStatusUpdate = async () => {
    if (!isAdmin || !order) return;

    setUpdating(true);
    setError("");
    try {
      await updateOrderStatus(orderId, selectedStatus);
      const response = await getOrderWithHistory(orderId);
      setOrder(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error" className="error-alert">{error}</Alert>;
  }

  if (!order) {
    return <Typography className="not-found-text">Order not found</Typography>;
  }

  return (
    <Paper elevation={3} className="status-manager-container">
      <Typography variant="h6" className="section-title">
        Order Status
      </Typography>

      <Box className="status-control-container">
        <Chip
          label={order.status}
          className={`status-chip ${order.status.toLowerCase()}`}
          size="medium"
        />

        {isAdmin && (
          <>
            <Select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              size="small"
              className="status-select"
            >
              {statusOptions.map((option) => (
                <MenuItem
                  key={option.value}
                  value={option.value}
                  disabled={option.value === order.status}
                  className="status-option"
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>

            <Button
              variant="contained"
              onClick={handleStatusUpdate}
              disabled={updating || selectedStatus === order.status}
              className="update-button"
            >
              {updating ? (
                <CircularProgress size={24} className="button-spinner" />
              ) : (
                "Update Status"
              )}
            </Button>
          </>
        )}
      </Box>

      <Divider className="section-divider" />

      <Typography variant="h6" className="section-title">
        Status History
      </Typography>
      <List dense className="history-list">
        {order.statusHistory.map((record) => (
          <ListItem key={record.id} className="history-item">
            <ListItemText
              primary={
                <Box className="history-item-header">
                  <Chip
                    label={record.status}
                    className={`status-chip ${record.status.toLowerCase()}`}
                    size="small"
                  />
                  <span className="changed-by">by {record.changedBy.name}</span>
                </Box>
              }
              secondary={format(new Date(record.changedAt), "PPpp")}
              className="history-item-text"
              secondaryTypographyProps={{ className: "history-item-date" }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default OrderStatusManager;