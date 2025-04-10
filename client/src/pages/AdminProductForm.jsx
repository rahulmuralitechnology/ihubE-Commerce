import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  InputAdornment,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createProduct, createMultipleProducts } from "../api/products";
import { useAuth } from "../contexts/AuthContext";
import "./AdminProductForm.css";

const AdminProductForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    originalPrice: 0,
    discountPrice: 0,
    quantity: 1,
    uom: "piece",
    hsnCode: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [jsonProducts, setJsonProducts] = useState([]);
  const [fileName, setFileName] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name.includes("Price") || name === "quantity"
          ? parseFloat(value) || 0
          : value,
    }));
  };

  const handleJsonUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setError("");
    setSuccess("");

    if (file.type !== "application/json") {
      setError("Please upload a valid JSON file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        const products = Array.isArray(parsed) ? parsed : [parsed];

        // Validate JSON structure
        const validatedProducts = products.map((product) => ({
          name: product["Product Name"] || product.name || "",
          description:
            product["Product Description"] || product.description || "",
          image: product["Product Image"] || product.image || "",
          originalPrice: parseFloat(
            product["Original Price"] || product.originalPrice || 0
          ),
          discountPrice: parseFloat(
            product["Discount Price"] || product.discountPrice || 0
          ),
          sellingPrice: parseFloat(
            product["Selling Price"] ||
              product.sellingPrice ||
              product.discountPrice ||
              product.originalPrice
          ),
          quantity: parseInt(product.Quantity || product.quantity || 1),
          uom: product.UOM || product.uom || "piece",
          hsnCode: product["HSN Code"] || product.hsnCode || "",
        }));

        setJsonProducts(validatedProducts);
        setSuccess(`${validatedProducts.length} product(s) loaded from JSON`);
      } catch (err) {
        setError("Invalid JSON format: " + err.message);
        setJsonProducts([]);
      }
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      if (jsonProducts.length > 0) {
        await createMultipleProducts(jsonProducts);
        setSuccess(`Successfully created ${jsonProducts.length} product(s)`);
      } else {
        // Calculate selling price if not provided
        const productToCreate = {
          ...formData,
          sellingPrice: formData.discountPrice || formData.originalPrice,
        };
        await createProduct(productToCreate);
        setSuccess("Product created successfully!");
      }

      // Reset form
      setFormData({
        name: "",
        description: "",
        image: "",
        originalPrice: 0,
        discountPrice: 0,
        quantity: 1,
        uom: "piece",
        hsnCode: "",
      });
      setJsonProducts([]);
      setFileName("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product(s)");
    } finally {
      setIsSubmitting(false);
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

  return (
    <Paper elevation={3} className="admin-product-form-container">
      <Typography className="admin-product-form-title" variant="h4" gutterBottom>
        {jsonProducts.length > 0 ? "Review Products" : "Add New Product"}
      </Typography>

      {error && (
        <Alert severity="error" className="admin-form-alert error">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="admin-form-alert success">
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} className="admin-product-form">
        {jsonProducts.length > 0 ? (
          <>
            <Typography className="uploaded-file-info" variant="subtitle1" gutterBottom>
              Uploaded File: {fileName} ({jsonProducts.length} products)
            </Typography>
            <TableContainer
              component={Paper}
              className="product-review-table"
            >
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell className="table-header">Name</TableCell>
                    <TableCell className="table-header">Image</TableCell>
                    <TableCell className="table-header">Original Price</TableCell>
                    <TableCell className="table-header">Discount Price</TableCell>
                    <TableCell className="table-header">Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jsonProducts.map((product, index) => (
                    <TableRow key={index} className="table-row">
                      <TableCell className="table-cell">{product.name}</TableCell>
                      <TableCell className="table-cell">
                        {product.image && (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="product-image-preview"
                          />
                        )}
                      </TableCell>
                      <TableCell className="table-cell">
                        ${product.originalPrice.toFixed(2)}
                      </TableCell>
                      <TableCell className="table-cell">
                        {product.discountPrice > 0
                          ? `$${product.discountPrice.toFixed(2)}`
                          : "-"}
                      </TableCell>
                      <TableCell className="table-cell">{product.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Grid container spacing={2} className="form-grid">
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Product Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="form-field"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                multiline
                rows={4}
                value={formData.description}
                onChange={handleChange}
                required
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Original Price"
                name="originalPrice"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  inputProps: { min: 0, step: 0.01 },
                }}
                value={formData.originalPrice}
                onChange={handleChange}
                required
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Discount Price"
                name="discountPrice"
                type="number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">$</InputAdornment>
                  ),
                  inputProps: { min: 0, step: 0.01 },
                }}
                value={formData.discountPrice}
                onChange={handleChange}
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Quantity"
                name="quantity"
                type="number"
                inputProps={{ min: 1 }}
                value={formData.quantity}
                onChange={handleChange}
                required
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Unit of Measure"
                name="uom"
                value={formData.uom}
                onChange={handleChange}
                required
                className="form-field"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="HSN Code"
                name="hsnCode"
                value={formData.hsnCode}
                onChange={handleChange}
                className="form-field"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Image URL"
                name="image"
                value={formData.image}
                onChange={handleChange}
                required
                className="form-field"
              />
            </Grid>
          </Grid>
        )}

        <Box className="form-actions">
          <Button variant="outlined" component="label" className="upload-button">
            {jsonProducts.length > 0 ? "Change JSON File" : "Upload JSON File"}
            <input
              type="file"
              hidden
              accept=".json"
              onChange={handleJsonUpload}
            />
          </Button>

          {jsonProducts.length > 0 && (
            <Button
              variant="outlined"
              color="error"
              onClick={() => {
                setJsonProducts([]);
                setFileName("");
              }}
              className="clear-button"
            >
              Clear Products
            </Button>
          )}
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
          disabled={
            isSubmitting || (jsonProducts.length === 0 && !formData.name)
          }
          className="submit-button"
        >
          {isSubmitting ? (
            <CircularProgress size={24} className="submit-spinner" />
          ) : jsonProducts.length > 0 ? (
            `Create ${jsonProducts.length} Product(s)`
          ) : (
            "Create Product"
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default AdminProductForm;