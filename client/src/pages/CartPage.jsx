import { useState, useEffect } from "react";
import { Box, Typography, Button, Paper, Grid, Divider } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import CartItem from "../components/CartItem";
import { useCart } from "../contexts/CartContext";
import { placeOrder } from "../api/orders";
import { useAuth } from "../contexts/AuthContext";
import { isAuthenticated } from "../utils/auth";
import { getCart } from "../api/cart";
import "./CartPage.css";

const CartPage = () => {
  const { cart, updateCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: "/cart" } });
      return;
    }

    setLoading(true);
    try {
      await placeOrder("CASH");
      const response = await getCart();
      updateCart(response.data);
      navigate("/orders");
    } catch (error) {
      console.error("Error placing order:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <Box className="empty-cart-container">
        <Typography className="empty-cart-title" variant="h5" gutterBottom>
          Your cart is empty
        </Typography>
        <Button
          className="continue-shopping-button"
          variant="contained"
          component={Link}
          to="/"
        >
          Continue Shopping
        </Button>
      </Box>
    );
  }

  const totalAmount = cart.items.reduce(
    (total, item) => total + item.product.sellingPrice * item.quantity,
    0
  );

  return (
    <Box className="cart-page-container">
      <Typography className="cart-title" variant="h4" gutterBottom>
        Shopping Cart
      </Typography>
      <Grid container spacing={3} className="cart-grid">
        <Grid item xs={12} md={8} className="cart-items-container">
          {cart.items.map((item) => (
            <CartItem key={item.id} item={item} />
          ))}
        </Grid>
        <Grid item xs={12} md={4} className="order-summary-container">
          <Paper elevation={3} className="order-summary-paper">
            <Typography className="order-summary-title" variant="h6" gutterBottom>
              Order Summary
            </Typography>
            <Divider className="summary-divider" />
            <Box className="order-items-list">
              {cart.items.map((item) => (
                <Box
                  key={item.id}
                  className="order-item-row"
                >
                  <Typography className="item-name" variant="body2">
                    {item.product.name} (x{item.quantity})
                  </Typography>
                  <Typography className="item-price" variant="body2">
                    ${(item.product.sellingPrice * item.quantity).toFixed(2)}
                  </Typography>
                </Box>
              ))}
            </Box>
            <Divider className="summary-divider" />
            <Box className="total-row">
              <Typography className="total-label" variant="h6">
                Total
              </Typography>
              <Typography className="total-amount" variant="h6">
                ${totalAmount.toFixed(2)}
              </Typography>
            </Box>
            <Button
              className="checkout-button"
              variant="contained"
              color="primary"
              fullWidth
              onClick={handlePlaceOrder}
              disabled={loading}
            >
              {loading ? (
                <span className="button-loading">Processing...</span>
              ) : (
                "Proceed to Checkout"
              )}
            </Button>
            {!isAuthenticated() && (
              <Typography className="login-prompt" variant="body2">
                You need to <Link to="/login" className="login-link">login</Link> to place an order.
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default CartPage;