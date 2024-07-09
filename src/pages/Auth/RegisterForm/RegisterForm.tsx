import React, { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
  IconButton,
  InputAdornment,
} from "@mui/material";
import axios from "axios";
import * as Yup from 'yup';
import { registerSchema } from "../../../validation/Auth/RegisterValidation";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";


// Define Interface for Props
interface RegisterFormProps {
    open:boolean;
    onClose:() => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({open, onClose}) => {
  const [formData, setFormData] = useState({
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone:"",
    dateOfBirth: null
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [registerError, setRegisterError] = useState<string | null>(null);
  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split('T')[0];
  const [showPassword, setShowPassword] = useState<boolean>(false);


  // [Handle] Text fields change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value === "" && name === "dateOfBirth" ? null : value,
    });
  };

  // [Close] Close popup register form
  const handleCancel = () => {
    // Clear form data when cancel is clicked
    setFormData({
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone:"",
        dateOfBirth: null
    });
    setErrors({});
    setRegisterError(null);
    onClose();
  };

  // [Handle] Hide/Display Password
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // [Handle] Submit register form
  const handleSubmit = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    try {
      // Check if formData.dateOfBirth is null
      const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null;
      const dateOfBirthISO = dateOfBirth ? dateOfBirth.toISOString() : '';

      // Construct the payload
      const payload = {
        userName: formData.userName,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        dateOfBirth: dateOfBirthISO
      };
      // console.log("Register Payload: ", payload);

      await registerSchema.validate(payload, { abortEarly: false });

      await axios.post(
        "/auth/register",
        payload
      );
      await alert("You registered successfully!")

      setFormData({
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone:"",
        dateOfBirth: null
      })

      setErrors({});
      setRegisterError(null);

      onClose();
    } catch (error) {
      const validationErrors: Record<string, string> = {}; // Define type for validationErrors

      // Type assertion to tell TypeScript that error is an instance of Yup.ValidationError
      if (error instanceof Yup.ValidationError) {
          error.inner.forEach((err) => {
              const path = err.path ?? ''; // Use nullish coalescing operator to provide a default value
              validationErrors[path] = err.message;
          });
          setErrors(validationErrors);
          setRegisterError(null);
      } else if (axios.isAxiosError(error) && error.response) {
        // Combining Both: axios.isAxiosError(error) && error.response
        // Purpose: To ensure that the error is specifically an Axios error and that it includes a response from the server.
        // Explanation: This combined check confirms two things:
        // Axios Error: The error is related to an Axios request.
        // Server Response: The server responded with some status code, indicating that the request reached the server, but there was an issue (like invalid credentials, server error, etc.)

        const { data } = error.response;
        if (data.errors) {
          data.errors.forEach((err: string) => {
            // console.log(err)
            console.log(validationErrors)

            if (err.includes("Username")) validationErrors.userName = err;
            if (err.includes("Email")) validationErrors.email = err;
            if (err.includes("Phone")) validationErrors.phone = err;
          });
          setErrors(validationErrors);
        } else {
          setRegisterError("An unexpected error occurred. Please try again.");
        }
      } else {
        setRegisterError("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div>
      <Dialog open={open} onClose={handleCancel}>
        <DialogTitle>Register</DialogTitle>
        <DialogContent>
          {registerError && (
            <Typography color="error" variant="body2">
              {registerError}
            </Typography>
          )}
          <TextField
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            name="userName"
            value={formData.userName}
            onChange={handleChange}
            error={!!errors.userName} // Check if error exists for the field
            helperText={errors.userName ?? ''} // Display error message if it exists
          />
          <TextField
            autoFocus
            margin="dense"
            label="First Name"
            type="text"
            fullWidth
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            error={!!errors.firstName} // Check if error exists for the field
            helperText={errors.firstName ?? ''} // Display error message if it exists
          />
          <TextField
            margin="dense"
            label="Last Name"
            type="text"
            fullWidth
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            error={!!errors.lastName} // Check if error exists for the field
            helperText={errors.lastName ?? ''} // Display error message if it exists
          />
          <TextField
            margin="dense"
            label="Email"
            type="email"
            fullWidth
            name="email"
            value={formData.email}
            onChange={handleChange}
            error={!!errors.email} // Check if error exists for the field
            helperText={errors.email ?? ''} // Display error message if it exists
          />
          <TextField
            margin="dense"
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            name="password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password} // Check if error exists for the field
            helperText={errors.password ?? ''} // Display error message if it exists
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
          <TextField
            margin="dense"
            label="Phone"
            type="phone"
            fullWidth
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            error={!!errors.phone} // Check if error exists for the field
            helperText={errors.phone ?? ''} // Display error message if it exists
          />
          <TextField
            margin="dense"
            label="Date of Birth"
            type="date"
            fullWidth
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleChange}
            InputLabelProps={{
              shrink: true,
            }}
            inputProps={{
              max: today, // avoid user choose date in present and future
            }}
            error={!!errors.dateOfBirth} // Check if error exists for the field
            helperText={errors.dateOfBirth ?? ''} // Display error message if it exists
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSubmit}>Register</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default RegisterForm;
