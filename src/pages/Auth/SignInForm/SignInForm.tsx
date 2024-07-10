import React, { ChangeEvent, useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  Snackbar,
  IconButton,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import { useDispatch } from "react-redux";
import * as Yup from "yup";
import { signInSchema } from "../../../validation/Auth/SignInValidation";
import { setToken } from "../../../reducers/Slice/authSlice";
import CloseIcon from "@mui/icons-material/Close";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import ForgotPassword from "../ForgotPassword";
import { apiUrl } from "../../../variable/globalVariable";

// Define Interface for Props
interface SignInFormProps {
  open: boolean;
  onClose: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ open, onClose }) => {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [authError, setAuthError] = useState<string | null>(null);
  const [openLoginSuccessSnackBar, setOpenLoginSuccessSnackBar] =
    React.useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [openForgotPasswordDialog, setOpenForgotPasswordDialog] = useState(false);


  // [Handle] Text fields change
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // [Close] Close popup sigin form
  const handleCancel = () => {
    // Clear form data when cancel is clicked
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
    setAuthError(null);
    onClose();
  };

  // [Handle] Hide/Display Password
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // [Handle] Submit sigin form
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      // Construct the payload
      const payload = {
        email: formData.email,
        password: formData.password,
      };
      // console.log("Signin Payload: ", payload);

      await signInSchema.validate(payload, { abortEarly: false });

      const response = await axios.post(
        `${apiUrl}/auth/authenticate`,
        payload // Data to be sent in the request body
      );

      // If the authentication is successful, you can handle the response here
      console.log("Authentication successful: ", response.data);
      const { token, refreshToken } = response.data;

      // Dispatch both token and refreshToken
      dispatch(setToken({ token, refreshToken }));

      // Clear the form data and close the dialog
      setFormData({ email: "", password: "" });

      setErrors({});
      setAuthError(null);

      onClose();
      handleOpenLoginSuccessSnackBar();
    } catch (error) {
      const validationErrors: Record<string, string> = {}; // Define type for validationErrors

      // Type assertion to tell TypeScript that error is an instance of Yup.ValidationError
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((err) => {
          const path = err.path ?? ""; // Use nullish coalescing operator to provide a default value
          validationErrors[path] = err.message;
        });
        setErrors(validationErrors);
        setAuthError(null);
      } else if (axios.isAxiosError(error) && error.response) {
        // Combining Both: axios.isAxiosError(error) && error.response
        // Purpose: To ensure that the error is specifically an Axios error and that it includes a response from the server.
        // Explanation: This combined check confirms two things:
        // Axios Error: The error is related to an Axios request.
        // Server Response: The server responded with some status code, indicating that the request reached the server, but there was an issue (like invalid credentials, server error, etc.)

        setAuthError(
          "Password or Username is invalid. If you are not yet a member, register first!"
        );
        setErrors({});
      } else {
        setAuthError("An unexpected error occurred. Please try again.");
        setErrors({});
      }
    }
  };

  // [Handle] Open and close Login Successfully SnackBar
  const handleOpenLoginSuccessSnackBar = () => {
    setOpenLoginSuccessSnackBar(true);
  };
  const handleCloseLoginSuccessSnackBar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenLoginSuccessSnackBar(false);
  };
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseLoginSuccessSnackBar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // [Handle] Open/Close Forgot Password Dialog
  const handleOpenForgotPasswordDialog = () => {
    setOpenForgotPasswordDialog(true);
  };
  const handleCloseForgotPasswordDialog = () => {
    setOpenForgotPasswordDialog(false);
  };


  return (
    <div>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle sx={{ textAlign: "center" }}>Sign In</DialogTitle>
        <DialogContent>
          {authError && (
            <Typography color="error" variant="body2">
              {authError}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            name="email" // Is the "name" in "e.target"
            id="email"
            value={formData.email} // Is the "value" in "e.target"
            onChange={handleChange}
            error={!!errors.email} // Check if error exists for the field
            helperText={errors.email ?? ""} // Display error message if it exists
          />
          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? "text" : "password"} // Toggle password visibility
            fullWidth
            name="password"
            id="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password} // Check if error exists for the field
            helperText={errors.password ?? ""} // Display error message if it exists
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    aria-label="toggle password visibility"
                    onClick={handleTogglePasswordVisibility}
                  >
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <div style={{ marginTop: "0.6rem" }}>
            <Button
              onClick={handleOpenForgotPasswordDialog}
              color="primary"
              sx={{ textTransform: 'none' }} // Tell it not uppercase text (FORGOT => Forgot)
            >
              Forgot password?
            </Button>
          </div>
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleCancel}
            sx={{
              border: "1px solid black",
              color: "#3f3a36",
              "&:hover": { backgroundColor: "#ccc" },
            }}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            sx={{
              backgroundColor: "blue",
              color: "white",
              "&:hover": { backgroundColor: "darkblue" },
            }}
          >
            Sign In
          </Button>
        </DialogActions>
      </Dialog>

      {/* [POPUP] FORGOT PASSWORD DIALOG */}
      <ForgotPassword
        open={openForgotPasswordDialog}
        onClose={handleCloseForgotPasswordDialog}
      />

      {/* [SNACKBAR] LOGIN SUCCESSFULLY */}
      <Snackbar
        open={openLoginSuccessSnackBar}
        autoHideDuration={6000} // 6000 = 6s
        onClose={handleCloseLoginSuccessSnackBar}
        message="You logged in successfully !"
        action={action}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "green",
            color: "white",
          },
        }}
      />
    </div>
  );
};

export default SignInForm;
