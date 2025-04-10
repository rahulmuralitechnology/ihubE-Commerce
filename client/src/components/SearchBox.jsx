import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Button,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import "./SearchBox.css";

const SearchBox = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || ""
  );
  const [priceRange, setPriceRange] = useState({
    min: searchParams.get("minPrice") || "",
    max: searchParams.get("maxPrice") || "",
  });

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchTerm) params.set("search", searchTerm);
    if (priceRange.min) params.set("minPrice", priceRange.min);
    if (priceRange.max) params.set("maxPrice", priceRange.max);

    navigate(`/?${params.toString()}`);
  };

  const handleClear = () => {
    setSearchTerm("");
    setPriceRange({ min: "", max: "" });
    navigate("/");
  };

  return (
    <Box component="form" onSubmit={handleSearch} className="search-box-container">
      <Box className="search-controls">
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start" className="search-icon">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <IconButton 
                onClick={() => setSearchTerm("")} 
                className="clear-search-button"
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            ),
          }}
        />

        <TextField
          label="Min Price"
          type="number"
          value={priceRange.min}
          onChange={(e) =>
            setPriceRange({ ...priceRange, min: e.target.value })
          }
          InputProps={{ inputProps: { min: 0 } }}
          className="price-input min-price"
        />

        <TextField
          label="Max Price"
          type="number"
          value={priceRange.max}
          onChange={(e) =>
            setPriceRange({ ...priceRange, max: e.target.value })
          }
          InputProps={{ inputProps: { min: 0 } }}
          className="price-input max-price"
        />

        <Button 
          type="submit" 
          variant="contained" 
          className="search-button"
        >
          Search
        </Button>

        {(searchTerm || priceRange.min || priceRange.max) && (
          <Button 
            variant="outlined" 
            onClick={handleClear}
            className="clear-button"
          >
            Clear
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SearchBox;