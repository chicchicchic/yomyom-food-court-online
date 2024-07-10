import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Grid, Input, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import * as Yup from "yup";
import { getDecodeToken, useAuthToken } from '../../../utils/Auth/authUtils';
import { addUserSchema } from '../../../validation/User/AddUserValidation';
import { apiUrl } from '../../../variable/globalVariable';

// Define an interface for the form data
interface FormData {
    userName: string;
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone:string;
    dateOfBirth: null;
    userRoleEnum: string;
    createdBy: string;
    updatedBy: string;
}

const AddNewUserForm = ({ onClose }: { onClose: () => void }) => {
    const accessToken = useAuthToken();

    const decodeToken = getDecodeToken();
    let userEmail: string | null = null;
    if (decodeToken) {
        userEmail = decodeToken.sub;
        // console.log("userEmail", userEmail);
    }

    const [listRole, setListRole] = useState<string[]>([]);
    const initialFormData: FormData = {
        userName: "",
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone:"",
        dateOfBirth: null,
        userRoleEnum: 'CUSTOMER',
        createdBy: "",
        updatedBy: ""
    };
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [addUserError, setAddUserError] = useState<string | null>(null);
    const today = new Date().toISOString().split('T')[0];


    // [Handle] Fetching role list
    useEffect(() => {
        fetchRoleList()
    }, []);
    const fetchRoleList = async () => {
        try {
          const response = await axios.get(`${apiUrl}/user/role-list`,
          {
                headers: {
                    'Authorization': `Bearer ${accessToken}` // Set the token in the headers
                }
            }
          );
        //   console.log("List role",response.data)
          setListRole(response.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
              // Handle 404 error here
              setListRole([]);
            } else {
              // Handle other errors
              alert(error);
            }
        }
    };


    // [Handle] Fields change (Text Field, Select Field, File(Image) Field)
    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData({
        ...formData,
        [name]: value === "" && name === "dateOfBirth" ? null : value,
      });
    };
    const handleSelectInputChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };


    // [Handle] Submit adding dish form
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
                dateOfBirth: dateOfBirthISO,
                userRoleEnum: formData.userRoleEnum,
                createdBy: userEmail ? userEmail : "Unknown",
                updatedBy: userEmail ? userEmail : "Unknown"
            };
            console.log("Add User Payload: ", payload);

            await addUserSchema.validate(payload, { abortEarly: false });

            await axios.post(`${apiUrl}/user/create`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Reset form data after successful submission
            setFormData(initialFormData);

            setErrors({});
            setAddUserError(null);

            // Close the popup
            onClose();

            // Reload the app after successful submission
            window.location.reload();
        } catch (error) {
            const validationErrors: Record<string, string> = {}; // Define type for validationErrors

            // Type assertion to tell TypeScript that error is an instance of Yup.ValidationError
            if (error instanceof Yup.ValidationError) {
                error.inner.forEach((err) => {
                    const path = err.path ?? ''; // Use nullish coalescing operator to provide a default value
                    validationErrors[path] = err.message;
                });
                setErrors(validationErrors);
                setAddUserError(null);
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
                setAddUserError("An unexpected error occurred. Please try again.");
              }
            } else {
              setAddUserError("An unexpected error occurred. Please try again.");
            }
          }
    };



    return (
        <Container sx={{padding: 0}}>
            <form >
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Username"
                            type="text"
                            name="userName"
                            value={formData.userName}
                            onChange={handleInputChange}
                            error={!!errors.userName} // Check if error exists for the field
                            helperText={errors.userName ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="(*) Firstname"
                            type="text"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            error={!!errors.firstName} // Check if error exists for the field
                            helperText={errors.firstName ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="(*) Lastname"
                            type="text"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            error={!!errors.lastName} // Check if error exists for the field
                            helperText={errors.lastName ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            error={!!errors.email} // Check if error exists for the field
                            helperText={errors.email ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Password"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            error={!!errors.password} // Check if error exists for the field
                            helperText={errors.password ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Phone"
                            type="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            error={!!errors.phone} // Check if error exists for the field
                            helperText={errors.phone ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Date of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                            InputLabelProps={{
                                shrink: true,
                            }}
                            inputProps={{
                                max: today, // avoid user choose date in present and future
                            }}
                            error={!!errors.dateOfBirth} // Check if error exists for the field
                            helperText={errors.dateOfBirth ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Select
                            fullWidth
                            label="Role Enum"
                            name="userRoleEnum"
                            value={formData.userRoleEnum}
                            onChange={handleSelectInputChange}
                            defaultValue={listRole && listRole.length > 0 ? listRole[0] : ""}
                            error={!!errors.userRoleEnumError} // Check if error exists for the field
                        >
                            {(listRole && listRole.length > 0 && listRole !== null) ?
                                listRole.map((role: string, index: number)=> (
                                    <MenuItem key={index} value={role}>{role}</MenuItem>
                                )
                            ) : (
                                <MenuItem>No role found</MenuItem>
                            )}

                        </Select>
                        {errors.userRoleEnumError && <div style={{ color: "#d32f2f", fontSize: "0.8rem", fontWeight: 600 }}>{errors.userRoleEnumError}</div>}
                    </Grid>

                    <Grid item xs={12}>
                        <Button onClick={handleSubmit} variant="contained" color="success" sx={{ display: "block", margin: "auto" }}>Add</Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default AddNewUserForm;