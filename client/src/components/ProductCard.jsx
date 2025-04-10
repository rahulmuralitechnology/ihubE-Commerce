import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { addToCart, getCart } from "../api/cart";
import { useState } from "react";
import { isAuthenticated } from "../utils/auth";
import "./ProductCard.css";

const ProductCard = ({ product, viewMode = "grid" }) => {
  const { cart, updateCart } = useCart();
  const [loading, setLoading] = useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      // For guest users, update local storage
      const guestCart = {
        items: [
          ...(cart?.items || []),
          {
            id: `guest-item-${Date.now()}`,
            product,
            productId: product.id,
            quantity: 1,
          },
        ],
      };
      updateCart(guestCart);
      return;
    }

    setLoading(true);
    try {
      await addToCart(product.id, 1);
      const response = await getCart();
      updateCart(response.data);
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setLoading(false);
    }
  };

  if (viewMode === "list") {
    return (
      <Card className="product-card list-view">
        <CardMedia
          component="img"
          className="product-image list-image"
          image={product.image}
          alt={product.name}
        />
        <CardContent className="product-content">
          <Typography
            variant="h6"
            component={Link}
            to={`/products/${product.id}`}
            className="product-name"
          >
            {product.name}
          </Typography>
          <Typography variant="body2" className="product-description">
            {product.description}
          </Typography>
          <Box className="price-container">
            {product.discountPrice && (
              <Typography variant="body1" className="original-price">
                ${product.originalPrice}
              </Typography>
            )}
            <Typography variant="h6" className="selling-price">
              ${product.sellingPrice}
            </Typography>
            {product.discountPrice && (
              <Chip
                label={`${Math.round(
                  ((product.originalPrice - product.sellingPrice) /
                    product.originalPrice) *
                    100
                )}% OFF`}
                className="discount-chip"
                size="small"
              />
            )}
          </Box>
        </CardContent>
        <CardActions className="card-actions">
          <Button
            variant="contained"
            color="primary"
            onClick={handleAddToCart}
            disabled={loading}
            className="add-to-cart-button"
          >
            {loading ? (
              <CircularProgress size={24} className="button-spinner" />
            ) : (
              "Add to Cart"
            )}
          </Button>
        </CardActions>
      </Card>
    );
  }

  return (
    <Card className="product-card grid-view">
      <CardMedia
        component="img"
        className="product-image"
        image={product.image}
        alt={product.name}
      />
      <CardContent className="product-content">
        <Typography
          gutterBottom
          variant="h6"
          component={Link}
          to={`/products/${product.id}`}
          className="product-name"
        >
          {product.name}
        </Typography>
        <Typography variant="body2" className="product-description">
          {product.description.length > 100
            ? `${product.description.substring(0, 100)}...`
            : product.description}
        </Typography>
        <Box className="price-container">
          {product.discountPrice && (
            <Typography variant="body1" className="original-price">
              ${product.originalPrice}
            </Typography>
          )}
          <Typography variant="h6" className="selling-price">
            ${product.sellingPrice}
          </Typography>
          {product.discountPrice && (
            <Chip
              label={`${Math.round(
                ((product.originalPrice - product.sellingPrice) /
                  product.originalPrice) *
                  100
              )}% OFF`}
              className="discount-chip"
              size="small"
            />
          )}
        </Box>
      </CardContent>
      <CardActions className="card-actions">
        <Button
          size="small"
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleAddToCart}
          disabled={loading}
          className="add-to-cart-button"
        >
          {loading ? (
            <CircularProgress size={24} className="button-spinner" />
          ) : (
            "Add to Cart"
          )}
        </Button>
      </CardActions>
    </Card>
  );
};

export default ProductCard;