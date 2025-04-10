import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Box, Typography, CircularProgress } from "@mui/material";
import ProductList from "../components/ProductList";
import SearchBox from "../components/SearchBox";
import { getProducts } from "../api/products";
import "./HomePage.css";

const HomePage = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        // Convert URLSearchParams to object
        const params = Object.fromEntries(searchParams.entries());
        const response = await getProducts(params);

        setProducts(response.data);
      } catch (error) {
        setError("Failed to load products. Please try again.");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]);

  return (
    <Box className="home-page-container">
      <Box className="search-box-container">
        <SearchBox />
      </Box>

      {error && (
        <Typography className="error-message">
          {error}
        </Typography>
      )}

      {loading ? (
        <Box className="loading-container">
          <CircularProgress className="loading-spinner" />
        </Box>
      ) : (
        <ProductList 
          products={products} 
          loading={loading} 
          className="product-list"
        />
      )}
    </Box>
  );
};

export default HomePage;