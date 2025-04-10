import { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Avatar,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { updateUser } from "../api/users";
import "./EditProfilePage.css";

const EditProfilePage = () => {
  const { user, setUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    // Password confirmation check
    if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    try {
      const updatedData = {
        name: formData.name,
        email: formData.email,
        ...(formData.newPassword && { password: formData.newPassword }),
      };

      const updatedUser = await updateUser(user.id, updatedData);
      setUser(updatedUser);
      setSuccess("Profile updated successfully!");
      // Reset password fields
      setFormData(prev => ({ ...prev, newPassword: "", confirmPassword: "" }));
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={3} className="edit-profile-container">
      <Typography className="edit-profile-title" variant="h4" gutterBottom>
        Edit Profile
      </Typography>

      <Box className="avatar-container">
        <Avatar className="profile-avatar" src={user?.avatar}>
          {user?.name?.charAt(0)}
        </Avatar>
      </Box>

      {error && (
        <Alert severity="error" className="error-alert">
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" className="success-alert">
          {success}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} className="profile-form">
        <TextField
          fullWidth
          margin="normal"
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="form-field"
        />

        <TextField
          fullWidth
          margin="normal"
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="form-field"
        />

        <TextField
          fullWidth
          margin="normal"
          label="New Password"
          name="newPassword"
          type="password"
          value={formData.newPassword}
          onChange={handleChange}
          placeholder="Leave blank to keep current"
          className="form-field"
        />

        <TextField
          fullWidth
          margin="normal"
          label="Confirm New Password"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          className="form-field"
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={isSubmitting}
          className="save-button"
        >
          {isSubmitting ? (
            <CircularProgress size={24} className="submit-spinner" />
          ) : (
            "Save Changes"
          )}
        </Button>
      </Box>
    </Paper>
  );
};

export default EditProfilePage;