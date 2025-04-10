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
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { Edit, Delete } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { getProducts, deleteProduct } from "../api/products";
import { useAuth } from "../contexts/AuthContext";
import "./AdminProductList.css";

const AdminProductList = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        setError("Failed to fetch products");
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleDelete = async () => {
    try {
      await deleteProduct(deleteId);
      setProducts(products.filter((p) => p.id !== deleteId));
    } catch (error) {
      setError("Failed to delete product");
      console.error("Error deleting product:", error);
    } finally {
      setOpenDialog(false);
      setDeleteId(null);
    }
  };

  if (user?.role !== "ADMIN") {
    return (
      <Box className="admin-access-denied">
        <Typography className="access-denied-text">
          Admin access required
        </Typography>
      </Box>
    );
  }

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
        <Typography className="error-text">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box className="admin-product-list-container">
      <Box className="header-section">
        <Typography className="page-title" variant="h4">
          Product Management
        </Typography>
        <Button
          className="add-product-button"
          variant="contained"
          onClick={() => navigate("/admin/products/new")}
        >
          Add New Product
        </Button>
      </Box>

      <TableContainer component={Paper} className="product-table-container">
        <Table className="product-table">
          <TableHead className="table-header">
            <TableRow className="header-row">
              <TableCell className="header-cell">Name</TableCell>
              <TableCell className="header-cell">Price</TableCell>
              <TableCell className="header-cell">Stock</TableCell>
              <TableCell className="header-cell">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody className="table-body">
            {products.length > 0 ? (
              products.map((product) => (
                <TableRow key={product.id} className="product-row">
                  <TableCell className="product-cell">{product.name}</TableCell>
                  <TableCell className="product-cell">
                    <span className="current-price">
                      ${product.discountPrice || product.originalPrice}
                    </span>
                    {product.discountPrice && (
                      <span className="original-price">
                        ${product.originalPrice}
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="product-cell">
                    {product.quantity}
                  </TableCell>
                  <TableCell className="product-cell actions-cell">
                    <IconButton
                      className="edit-button"
                      onClick={() =>
                        navigate(`/admin/products/edit/${product.id}`)
                      }
                    >
                      <Edit className="edit-icon" />
                    </IconButton>
                    <IconButton
                      className="delete-button"
                      onClick={() => {
                        setDeleteId(product.id);
                        setOpenDialog(true);
                      }}
                    >
                      <Delete className="delete-icon" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow className="empty-row">
                <TableCell colSpan={4} className="empty-message">
                  No products found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        className="delete-dialog"
        PaperProps={{ className: "dialog-paper" }}
      >
        <DialogTitle className="dialog-title">Delete Product</DialogTitle>
        <DialogContent className="dialog-content">
          <DialogContentText className="dialog-text">
            Are you sure you want to delete this product? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions className="dialog-actions">
          <Button
            onClick={() => setOpenDialog(false)}
            className="cancel-button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            className="confirm-delete-button"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminProductList;