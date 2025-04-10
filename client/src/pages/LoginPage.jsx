import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { login } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import "./LoginPage.css";

const LoginPage = () => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const response = await login(values);
      authLogin(response.data.token, response.data.user);
      navigate(from, { replace: true });
    } catch (error) {
      setErrors({
        email: "Invalid credentials",
        password: "Invalid credentials",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="login-container">
      <Box className="login-card">
        <Typography className="login-title" variant="h4" gutterBottom>
          Welcome Back
        </Typography>
        <Typography className="login-subtitle" variant="body1" gutterBottom>
          Login to your account
        </Typography>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting,
          }) => (
            <form onSubmit={handleSubmit} className="login-form">
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                className="login-input"
                InputProps={{
                  className: "input-field",
                }}
                InputLabelProps={{
                  className: "input-label",
                }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Password"
                name="password"
                type="password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
                className="login-input"
                InputProps={{
                  className: "input-field",
                }}
                InputLabelProps={{
                  className: "input-label",
                }}
              />
              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
                className="login-button"
              >
                {isSubmitting ? (
                  <CircularProgress size={24} className="button-spinner" />
                ) : (
                  "Login"
                )}
              </Button>
            </form>
          )}
        </Formik>

        <Typography className="login-footer" variant="body2">
          Don't have an account?{" "}
          <MuiLink component={Link} to="/register" className="register-link">
            Register here
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default LoginPage;