import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Grid, Input, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import * as Yup from "yup";
import { getDecodeToken, useAuthToken } from '../../../utils/Auth/authUtils';
import { updateUserSchema } from '../../../validation/User/UpdateUserValidation';
import { apiUrl } from '../../../variable/globalVariable';

// Define an interface for the form data
interface FormData {
    firstName: string;
    lastName: string;
    email: string;
    phone:string;
    dateOfBirth: null;
    roleEnum: string;
    updatedBy: string;
}

const UpdateUserForm = ({ onClose, selectedUserId }: { onClose: () => void; selectedUserId: number | null }) => {
    const accessToken = useAuthToken();

    const decodeToken = getDecodeToken();
    let userEmail: string | null = null;
    if (decodeToken) {
        userEmail = decodeToken.sub;
        // console.log("userEmail", userEmail);
    }

    const [listRole, setListRole] = useState<string[]>([]);
    const initialFormData: FormData = {
        firstName: "",
        lastName: "",
        email: "",
        phone:"",
        dateOfBirth: null,
        roleEnum: 'CUSTOMER',
        updatedBy: "",
    };
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [updateUserError, setUpdateUserError] = useState<string | null>(null);
    const today = new Date().toISOString().split('T')[0];


    // [Handle] Fetching role list
    useEffect(() => {
        fetchRoleList()
        fetchUserDetails()
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
    const fetchUserDetails = async () => {
        try {
            const response = await axios.get(`${apiUrl}/user/${selectedUserId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}` // Set the token in the headers
                }
            }
            );

            const result = response.data;
            // console.log("result", result.dateOfBirth)

            setFormData({
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                phone: result.phone,
                dateOfBirth: result.dateOfBirth ? result.dateOfBirth.split('T')[0] : null,
                roleEnum: result.roleEnum,
                updatedBy: userEmail ?  userEmail : "",
            });
            // console.log("Form Data", formData)
        } catch (error: any) {
            console.error('Error fetching user details:', error);
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
        setFormData({
            ...formData,
            [name]: value
        });
    };


    // [Handle] Submit update user form
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            // Check if formData.dateOfBirth is null
            const dateOfBirth = formData.dateOfBirth ? new Date(formData.dateOfBirth) : null;
            const dateOfBirthISO = dateOfBirth ? dateOfBirth.toISOString() : '';

            // Construct the payload
            const payload = {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                roleEnum: formData.roleEnum,
                updatedBy: formData.updatedBy,
                dateOfBirth: dateOfBirthISO,
            };

            await updateUserSchema.validate(formData, { abortEarly: false });



            // console.log("Update User Payload: ", formData);
            // const formDataToSend = new FormData();
            // formDataToSend.append('firstName', formData.firstName);
            // formDataToSend.append('lastName', formData.lastName);
            // formDataToSend.append('email', formData.email);
            // formDataToSend.append('phone', formData.phone);
            // formDataToSend.append('dateOfBirth', dateOfBirthISO);
            // formDataToSend.append('roleEnum', formData.roleEnum);
            // formDataToSend.append('updatedBy', formData.updatedBy);

            // console.log("Hello")


            await axios.put(`${apiUrl}/user/update/${selectedUserId}`, payload, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Reset form data after successful submission
            setFormData(initialFormData);

            setErrors({});
            setUpdateUserError(null);

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

                console.log(validationErrors)
                setErrors(validationErrors);
                setUpdateUserError(null);
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

                  if (err.includes("Email")) validationErrors.email = err;
                  if (err.includes("Phone")) validationErrors.phone = err;
                });
                setErrors(validationErrors);
              } else {
                setUpdateUserError("An unexpected error occurred. Please try again.");
              }
            } else {
              setUpdateUserError("An unexpected error occurred. Please try again.");
            }
          }
    };


    return (
        <Container sx={{padding: 0}}>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="ID"
                            type="text"
                            name="id"
                            value={selectedUserId}
                            disabled
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
                            type="text"
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
                            name="roleEnum"
                            value={formData.roleEnum}
                            onChange={handleSelectInputChange}
                            defaultValue={listRole && listRole.length > 0 ? listRole[0] : ""}
                            error={!!errors.roleEnumError} // Check if error exists for the field
                        >
                            {(listRole && listRole.length > 0 && listRole !== null) ?
                                listRole.map((role: string, index: number)=> (
                                    <MenuItem key={index} value={role}>{role}</MenuItem>
                                )
                            ) : (
                                <MenuItem>No role found</MenuItem>
                            )}

                        </Select>
                        {errors.roleEnumError && <div style={{ color: "#d32f2f", fontSize: "0.8rem", fontWeight: 600 }}>{errors.roleEnumError}</div>}
                    </Grid>

                    <Grid item xs={12}>
                        <Button
                        type='submit'
                         variant="contained" color="success" sx={{ display: "block", margin: "auto" }}>Save</Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default UpdateUserForm;