import {
  Grid,
  Box,
  Typography,
  ToggleButtonGroup,
  ToggleButton,
  Pagination,
  CircularProgress,
} from "@mui/material";
import ViewListIcon from "@mui/icons-material/ViewList";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ProductCard from "./ProductCard";
import { useState } from "react";
import "./ProductList.css";

const ProductList = ({ products, loading }) => {
  const [viewMode, setViewMode] = useState("grid");
  const [page, setPage] = useState(1);
  const itemsPerPage = 12;

  const handleViewModeChange = (event, newViewMode) => {
    if (newViewMode !== null) {
      setViewMode(newViewMode);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <Box className="loading-container">
        <CircularProgress className="loading-spinner" />
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Typography className="empty-message">
        No products found. Try adjusting your search criteria.
      </Typography>
    );
  }

  // Pagination logic
  const startIndex = (page - 1) * itemsPerPage;
  const paginatedProducts = products.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  return (
    <Box className="product-list-container">
      <Box className="list-controls">
        <Typography className="product-count">
          Showing {startIndex + 1}-
          {Math.min(startIndex + itemsPerPage, products.length)} of{" "}
          {products.length} products
        </Typography>

        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={handleViewModeChange}
          aria-label="view mode"
          className="view-toggle"
        >
          <ToggleButton value="grid" aria-label="grid view" className="toggle-button">
            <ViewModuleIcon className="toggle-icon" />
          </ToggleButton>
          <ToggleButton value="list" aria-label="list view" className="toggle-button">
            <ViewListIcon className="toggle-icon" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {viewMode === "grid" ? (
        <Grid container spacing={3} className="grid-view">
          {paginatedProducts.map((product) => (
            <Grid item key={product.id} xs={12} sm={6} md={4} lg={3}>
              <ProductCard product={product} viewMode={viewMode} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box className="list-view">
          {paginatedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              viewMode={viewMode}
            />
          ))}
        </Box>
      )}

      {products.length > itemsPerPage && (
        <Box className="pagination-container">
          <Pagination
            count={Math.ceil(products.length / itemsPerPage)}
            page={page}
            onChange={handlePageChange}
            color="primary"
            className="pagination"
          />
        </Box>
      )}
    </Box>
  );
};

export default ProductList;