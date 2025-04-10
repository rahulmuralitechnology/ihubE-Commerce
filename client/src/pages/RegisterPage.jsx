import {
  Box,
  Typography,
  TextField,
  Button,
  Link as MuiLink,
  CircularProgress,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { Formik } from "formik";
import * as Yup from "yup";
import { register } from "../api/auth";
import { useAuth } from "../contexts/AuthContext";
import "./RegisterPage.css";

const RegisterPage = () => {
  const { login: authLogin } = useAuth();
  const navigate = useNavigate();

  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string()
      .min(6, "Password must be at least 6 characters")
      .required("Password is required"),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref("password"), null], "Passwords must match")
      .required("Confirm Password is required"),
  });

  const handleSubmit = async (values, { setSubmitting, setErrors }) => {
    try {
      const { confirmPassword, ...userData } = values;
      const response = await register(userData);
      authLogin(response.data.token, response.data.user);
      navigate("/");
    } catch (error) {
      setErrors({ email: "Registration failed. Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className="register-container">
      <Box className="register-card">
        <Typography className="register-title" variant="h3" gutterBottom>
          Create Account
        </Typography>
        <Typography className="register-subtitle" variant="body1" gutterBottom>
          Join our community today
        </Typography>

        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            confirmPassword: "",
          }}
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
            <form onSubmit={handleSubmit} className="register-form">
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={values.name}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
                className="form-field"
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
                label="Email"
                name="email"
                type="email"
                value={values.email}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
                className="form-field"
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
                className="form-field"
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
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={values.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                helperText={touched.confirmPassword && errors.confirmPassword}
                className="form-field"
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
                className="register-button"
              >
                {isSubmitting ? (
                  <CircularProgress size={24} className="button-spinner" />
                ) : (
                  "Register"
                )}
              </Button>
            </form>
          )}
        </Formik>

        <Typography className="login-prompt" variant="body2">
          Already have an account?{" "}
          <MuiLink component={Link} to="/login" className="login-link">
            Login here
          </MuiLink>
        </Typography>
      </Box>
    </Box>
  );
};

export default RegisterPage;