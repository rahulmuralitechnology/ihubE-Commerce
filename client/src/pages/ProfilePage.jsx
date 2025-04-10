import { Box, Typography, Avatar, Button, Chip } from "@mui/material";
import { useAuth } from "../contexts/AuthContext";
import { Link } from "react-router-dom";
import "./ProfilePage.css";

const ProfilePage = () => {
  const { user, logout } = useAuth();

  return (
    <Box className="profile-page-container">
      <Typography variant="h2" className="profile-title">
        My Profile
      </Typography>
      
      <Box className="profile-header">
        <Avatar
          className="profile-avatar"
          src={user?.avatar}
          alt={user?.name}
        >
          {user?.name?.charAt(0)}
        </Avatar>
        <Box className="profile-name-container">
          <Typography variant="h4" className="profile-name">
            {user?.name}
          </Typography>
          <Chip
            label={user?.role}
            className={`role-chip ${user?.role?.toLowerCase()}`}
          />
        </Box>
      </Box>

      <Box className="profile-details">
        <Box className="detail-item">
          <Typography className="detail-label">Email:</Typography>
          <Typography className="detail-value">{user?.email}</Typography>
        </Box>
        
        <Box className="detail-item">
          <Typography className="detail-label">Member Since:</Typography>
          <Typography className="detail-value">
            {new Date(user?.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </Typography>
        </Box>
      </Box>

      <Box className="action-buttons">
        <Button
          component={Link}
          to="/profile/edit"
          variant="contained"
          className="edit-button"
        >
          Edit Profile
        </Button>

        <Button
          variant="contained"
          onClick={logout}
          className="logout-button"
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
};

export default ProfilePage;