import React, { useState } from "react";
import {
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, useParams } from "react-router-dom";
import { apiUrl } from "../../../variable/globalVariable";

const ResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // [Handle] Hide/Display Password
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // [Handle] Input Change
  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(event.target.value);
  };

  // [Handle] Submit Reset Password Form
  const handleResetPassword = async () => {
    try {
      // Validation Reset Password Form
      if (password === "") {
        setError("Please enter your new password !");
        return;
      }

      await axios.post(`${apiUrl}/reset-password/reset-password`, {
        token,
        newPassword: password,
      });

      setError(null);
      setPassword("");
      navigate("/reset-password-successfully");
    } catch (error) {
      setError("Failed to reset password. Please try again.");
    }
  };


  return (
    <div style={{ maxWidth: "400px", margin: "auto", marginTop: "20px" }}>
      {/* [FORM] RESET PASSWORD */}
      <Typography variant="h6" gutterBottom>
        Reset Password
      </Typography>
      {error && (
        <Typography color="error" variant="body2" paragraph>
          {error}
        </Typography>
      )}
      <TextField
        margin="dense"
        label="New Password"
        type={showPassword ? "text" : "password"} // Toggle password visibility
        fullWidth
        name="password"
        id="password"
        value={password}
        onChange={handlePasswordChange}
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
      <Button
        variant="contained"
        color="primary"
        style={{ marginTop: "20px" }}
        onClick={handleResetPassword}
      >
        Reset Password
      </Button>

    </div>
  );
};

export default ResetPassword;
