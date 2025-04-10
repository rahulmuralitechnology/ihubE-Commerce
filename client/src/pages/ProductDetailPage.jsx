import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Grid,
  Chip,
  Divider,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { getProduct } from "../api/products";
import { useCart } from "../contexts/CartContext";
import { addToCart, getCart } from "../api/cart";
import { isAuthenticated } from "../utils/auth";
import "./ProductDetailPage.css";

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cart, updateCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getProduct(id);
        setProduct(response.data);
      } catch (err) {
        setError("Product not found");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      navigate("/login", { state: { from: `/products/${id}` } });
      return;
    }

    try {
      setSuccess("");
      await addToCart(product.id, quantity);
      const response = await getCart();
      updateCart(response.data);
      setSuccess(`${product.name} added to cart!`);
    } catch (error) {
      setError("Failed to add to cart. Please try again.");
      console.error("Error adding to cart:", error);
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
    return (
      <Box className="error-container">
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
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

  if (!product) {
    return (
      <Box className="not-found-container">
        <Typography variant="h5" className="not-found-text">
          Product not found
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

  const discountPercentage = product.discountPrice
    ? Math.round(
        ((product.originalPrice - product.sellingPrice) / product.originalPrice) *
          100
      )
    : 0;

  return (
    <Box className="product-detail-container">
      <Grid container spacing={4} className="product-grid">
        <Grid item xs={12} md={6} className="product-image-container">
          <Box className="image-wrapper">
            <img
              src={product.image}
              alt={product.name}
              className="product-image"
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6} className="product-info-container">
          <Typography variant="h3" className="product-title">
            {product.name}
          </Typography>

          <Box className="price-container">
            {product.discountPrice && (
              <Typography variant="h5" className="original-price">
                ${product.originalPrice}
              </Typography>
            )}
            <Typography variant="h3" className="current-price">
              ${product.sellingPrice}
            </Typography>
            {discountPercentage > 0 && (
              <Chip
                label={`${discountPercentage}% OFF`}
                className="discount-chip"
              />
            )}
          </Box>

          <Typography variant="body1" className="product-description">
            {product.description}
          </Typography>

          <Divider className="divider" />

          <Box className="availability-container">
            <Typography variant="subtitle1" className="availability-label">
              Availability:
            </Typography>
            <Typography
              variant="body1"
              className={`availability-value ${
                product.quantity > 0 ? "in-stock" : "out-of-stock"
              }`}
            >
              {product.quantity > 0 ? "In Stock" : "Out of Stock"}
            </Typography>
          </Box>

          <Box className="quantity-container">
            <Typography variant="subtitle1" className="quantity-label">
              Quantity:
            </Typography>
            <TextField
              type="number"
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, parseInt(e.target.value) || 1))
              }
              inputProps={{ min: 1, max: product.quantity }}
              className="quantity-input"
            />
          </Box>

          {success && (
            <Alert severity="success" className="success-alert">
              {success}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleAddToCart}
            disabled={product.quantity <= 0}
            className="add-to-cart-button"
          >
            {product.quantity > 0 ? "Add to Cart" : "Out of Stock"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ProductDetailPage;