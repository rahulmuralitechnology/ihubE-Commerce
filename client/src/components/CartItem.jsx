import { Box, Typography, IconButton, TextField, Divider, CircularProgress } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useCart } from "../contexts/CartContext";
import { updateCartItem, removeFromCart, getCart } from "../api/cart";
import { useState } from "react";
import { isAuthenticated } from "../utils/auth";
import "./CartItem.css";

const CartItem = ({ item }) => {
  const { cart, updateCart } = useCart();
  const [quantity, setQuantity] = useState(item.quantity);
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = async (newQuantity) => {
    const qty = Math.max(1, Math.min(99, newQuantity));
    setQuantity(qty);

    if (qty === item.quantity) return;

    if (!isAuthenticated()) {
      // For guest users, update local storage
      const updatedItems = cart.items.map((cartItem) =>
        cartItem.id === item.id ? { ...cartItem, quantity: qty } : cartItem
      );
      updateCart({ ...cart, items: updatedItems });
      return;
    }

    setLoading(true);
    try {
      await updateCartItem(item.id, qty);
      const response = await getCart();
      updateCart(response.data);
    } catch (error) {
      console.error("Error updating cart item:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async () => {
    if (!isAuthenticated()) {
      // For guest users, update local storage
      const updatedItems = cart.items.filter(
        (cartItem) => cartItem.id !== item.id
      );
      updateCart({ ...cart, items: updatedItems });
      return;
    }

    setLoading(true);
    try {
      await removeFromCart(item.id);
      const response = await getCart();
      updateCart(response.data);
    } catch (error) {
      console.error("Error removing cart item:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box className="cart-item-container">
      <Box className="cart-item-content">
        <Box className="product-image-container">
          <img
            src={item.product.image}
            alt={item.product.name}
            className="product-image"
          />
        </Box>
        <Box className="product-details">
          <Typography variant="h6" className="product-name">
            {item.product.name}
          </Typography>
          <Typography variant="body2" className="product-description">
            {item.product.description.substring(0, 100)}...
          </Typography>
          <Box className="price-quantity-container">
            <Typography variant="body1" className="product-price">
              ${item.product.sellingPrice}
            </Typography>
            <Box className="quantity-controls">
              {loading ? (
                <CircularProgress size={24} className="loading-spinner" />
              ) : (
                <>
                  <TextField
                    size="small"
                    type="number"
                    value={quantity}
                    onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
                    inputProps={{ min: 1, max: 99 }}
                    className="quantity-input"
                    disabled={loading}
                  />
                  <IconButton 
                    onClick={handleRemoveItem} 
                    disabled={loading}
                    className="delete-button"
                  >
                    <DeleteIcon className="delete-icon" />
                  </IconButton>
                </>
              )}
            </Box>
          </Box>
          <Typography variant="body1" className="item-total">
            Total: ${(item.product.sellingPrice * item.quantity).toFixed(2)}
          </Typography>
        </Box>
      </Box>
      <Divider className="divider" />
    </Box>
  );
};

export default CartItem;