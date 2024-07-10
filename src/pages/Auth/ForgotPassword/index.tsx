import React, { useState } from "react";
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
  Grid,
} from "@mui/material";
import axios from "axios";
import CloseIcon from "@mui/icons-material/Close";
import emailjs from "@emailjs/browser";
import { apiUrl } from "../../../variable/globalVariable";

interface ForgotPasswordProps {
  open: boolean;
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ open, onClose }) => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // [Handle] Input Change
  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  // [Check] Valid Email (ex: abc@gmail.com,...)
  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // [Handle] Send Reset Password Token To Provided Email
  const handleSendResetToken = async () => {
    try {
      // Validation Forgot Password Form
      if (email === "") {
        setError("Please enter your email !");
        return;
      } else if (!isValidEmail(email)) {
        setError("Please enter a valid email address !");
        return;
      }

      const response = await axios.post(`${apiUrl}/reset-password/forgot-password`, {
        email,
      });
      const { token } = response.data;

      // Send email using EmailJS
      await emailjs.send(
        "service_84eg9sf",
        "template_6oj5p0r",
        { email, token },
        "VjnK1IG6BndQt80Ck"
      );

      setEmailSent(true);
      setError(null);
      setEmail("");
      onClose();
    } catch (error) {
      setError("Failed to send reset token. Please try again.");
    }
  };

  // [Handle] Cancel Request
  const handleCancel = () => {
    setEmail(""); // Clear the email input
    onClose(); // Call the onClose prop to close the dialog
  };

  // [Handle] Close Send Reset Password Token Successfully Snackbar
  const handleCloseSnackbar = () => {
    setEmailSent(false);
  };

  return (
    <div>
      <Dialog open={open} onClose={onClose}>
        <DialogTitle>Forgot Password</DialogTitle>
        <DialogContent>
          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={handleEmailChange}
          />
        </DialogContent>
        <DialogActions>
          <Grid container spacing={2} justifyContent="space-around">
            <Grid item>
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
            </Grid>

            <Grid item>
              <Button
                onClick={handleSendResetToken}
                sx={{
                  backgroundColor: "blue",
                  color: "white",
                  "&:hover": { backgroundColor: "darkblue" },
                }}
              >
                Send Token
              </Button>
            </Grid>
          </Grid>
        </DialogActions>
      </Dialog>

      {/* [SNACKBAR] SEND RESET PASSWORD TOKEN SUCCESSFULLY */}
      <Snackbar
        open={emailSent}
        autoHideDuration={2000}
        onClose={handleCloseSnackbar}
        message="Reset token sent to your email!"
        action={
          <IconButton
            size="small"
            aria-label="close"
            color="inherit"
            onClick={handleCloseSnackbar}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
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

export default ForgotPassword;
