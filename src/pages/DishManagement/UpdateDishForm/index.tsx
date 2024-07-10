import React, { ChangeEvent, FormEvent, useEffect, useState } from 'react';
import axios from 'axios';
import { Button, Container, Grid, Input, InputLabel, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import * as Yup from "yup";
import { updateDishSchema } from '../../../validation/Dish/UpdateDishValidation';
import { getDecodeToken, useAuthToken } from '../../../utils/Auth/authUtils';
import { apiUrl } from '../../../variable/globalVariable';


// Define an interface for the form data
interface FormData {
    name: string;
    originalPrice: number;
    discount: number;
    preparationTime: number;
    mealSet: string;
    image: File | null;
    categoryEnum: string;
    updatedBy: string;
}

const UpdateDishForm = ({ onClose, selectedDishId }: { onClose: () => void; selectedDishId: number | null }) => {
    const accessToken = useAuthToken();

    const decodeToken = getDecodeToken();
    let userEmail: string | null = null;
    if (decodeToken) {
        userEmail = decodeToken.sub;
        // console.log("userEmail", userEmail);
    }

    const [listCategory, setListCategory] = useState<string[]>([]);
    const initialFormData: FormData = {
        name: '',
        originalPrice: 0.0,
        discount: 0.0,
        preparationTime: 0,
        mealSet: '',
        image: null,
        categoryEnum: 'APPETIZERS',
        updatedBy: "",

    };
    const [formData, setFormData] = useState<FormData>(initialFormData);
    const [errors, setErrors] = useState<Record<string, string>>({});


    // [Handle] Fetching category list
    useEffect(() => {
        fetchCategoryList()
        fetchDishDetails();
    }, []);
    const fetchCategoryList = async () => {
        try {
          const response = await axios.get(`${apiUrl}/dish/category-list`,
          {
            headers: {
                'Authorization': `Bearer ${accessToken}` // Set the token in the headers
            }
        }
          );
        //   console.log("List category",response.data)
          setListCategory(response.data);
        } catch (error: any) {
            if (error.response && error.response.status === 404) {
              // Handle 404 error here
              setListCategory([]);
            } else {
              // Handle other errors
              alert(error);
            }
        }
    };
    const fetchDishDetails = async () => {
        try {
            const response = await axios.get(`${apiUrl}/dish/${selectedDishId}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}` // Set the token in the headers
                }
            }
            ); // Fetch dish details by ID
            const { data } = response;
            setFormData({
                name: data.name,
                originalPrice: data.originalPrice,
                discount: data.discount,
                preparationTime: data.preparationTime,
                mealSet: data.mealSet,
                categoryEnum: data.categoryEnum,
                image: null, // Set image to null as it's not fetched here
                updatedBy: userEmail ?  userEmail : "Unknown",
            });
        } catch (error: any) {
            console.error('Error fetching dish details:', error);
        }
    };


    // [Handle] Fields change (Text Field, Select Field, File(Image) Field)
      const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
      const handleSelectInputChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
      };
      const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files ? e.target.files[0] : null;
        setFormData({ ...formData, image: file });
      };


    // [Handle] Submit update dish form
    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        try {
            await updateDishSchema.validate(formData, {abortEarly: false});

            const formDataToSend = new FormData();
            formDataToSend.append('name', formData.name);
            formDataToSend.append('originalPrice', formData.originalPrice.toString());
            formDataToSend.append('discount', formData.discount.toString());
            formDataToSend.append('preparationTime', formData.preparationTime.toString());
            formDataToSend.append('mealSet', formData.mealSet);

            // Check if image is not null before appending
            if (formData.image !== null) {
                formDataToSend.append('image', formData.image);
            }

            formDataToSend.append('categoryEnum', formData.categoryEnum);
            formDataToSend.append('updatedBy', userEmail ?  userEmail : "Unknown");

            await axios.put(`${apiUrl}/dish/update/${selectedDishId}`,
            formDataToSend,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Access-Control-Allow-Origin': '*',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            // Reset form data after successful submission
            setFormData(initialFormData);

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
            }

            setErrors(validationErrors);
          }
    };



    return (
        <Container sx={{padding: 2}}>
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="ID"
                            type="text"
                            name="id"
                            value={selectedDishId}
                            disabled
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Name"
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            error={!!errors.name} // Check if error exists for the field
                            helperText={errors.name ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="(*) Original Price ($)"
                            type="number"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleInputChange}
                            inputProps={{ min: "0", step: "1.00" }}
                            error={!!errors.originalPrice} // Check if error exists for the field
                            helperText={errors.originalPrice ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            fullWidth
                            label="Discount (%)"
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            inputProps={{ min: "0", step: "1.00" }}
                            error={!!errors.discount} // Check if error exists for the field
                            helperText={errors.discount ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Preparation Time (minutes)"
                            type="number"
                            name="preparationTime"
                            value={formData.preparationTime}
                            onChange={handleInputChange}
                            inputProps={{ min: "0", step: "1.00" }}
                            error={!!errors.preparationTime} // Check if error exists for the field
                            helperText={errors.preparationTime ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            label="(*) Meal Set"
                            type="text"
                            name="mealSet"
                            value={formData.mealSet}
                            onChange={handleInputChange}
                            error={!!errors.mealSet} // Check if error exists for the field
                            helperText={errors.mealSet ?? ''} // Display error message if it exists
                        />
                    </Grid>
                    <Grid item xs={12}>
                      <InputLabel
                        htmlFor="image-upload"
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center', // Horizontally center the content
                          width: '100%' // Ensure the input label takes up the full width
                      }}>
                        <Input
                          type="file"
                          onChange={handleImageChange}
                          disableUnderline // Remove default underline
                          sx={{ display: 'none' }} // Hide the input visually
                          id="image-upload" // Add an id for the label

                        />
                        <Button
                          variant="contained"
                          component="span"
                          startIcon={<CloudUploadIcon />}
                        >
                          Upload Image (*)
                        </Button>
                      </InputLabel>
                      {errors.image && <div style={{color: "#d32f2f", fontSize: "0.8rem", fontWeight: 600, display: 'flex', justifyContent: 'center'}}>{errors.image}</div>}
                    </Grid>
                    <Grid item xs={12}>
                        <Select
                            fullWidth
                            label="Category Enum"
                            name="categoryEnum"
                            value={formData.categoryEnum}
                            onChange={handleSelectInputChange}
                            defaultValue={listCategory && listCategory.length > 0 ? listCategory[0] : ""}
                            error={!!errors.categoryError} // Check if error exists for the field
                        >
                            {(listCategory && listCategory.length > 0 && listCategory !== null) ?
                                listCategory.map((category: string, index: number)=> (
                                    <MenuItem key={index} value={category}>{category.replace(/_/g, ' ')}</MenuItem>
                                )
                            ) : (
                                <MenuItem>No category found</MenuItem>
                            )}

                        </Select>
                        {errors.categoryError && <div style={{ color: "#d32f2f", fontSize: "0.8rem", fontWeight: 600 }}>{errors.categoryError}</div>}
                    </Grid>
                    <Grid item xs={12}>
                        <Button type="submit" variant="contained" color="success" sx={{ display: "block", margin: "auto" }}>
                            Save
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Container>
    );
};

export default UpdateDishForm;