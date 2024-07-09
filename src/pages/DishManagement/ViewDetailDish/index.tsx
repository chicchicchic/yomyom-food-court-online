import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import {
    CircularProgress,
    Container,
    Grid,
    Typography,
    Card,
    CardContent,
    CardMedia,
} from '@mui/material';
import { useAuthToken } from '../../../utils/Auth/authUtils';

interface DishDetail {
    dishId: number;
    name: string;
    originalPrice: number;
    discount: number;
    preparationTime: number;
    mealSet: string;
    image: string; // Assuming the image URL will be provided by the backend
    categoryEnum: string;
    createdAt: string; // Assuming createdAt is a string in ISO format
    createdBy: string;
    updatedBy: string;
    isDeleted: boolean;
}

const ViewDetailDish: React.FC = () => {
    const accessToken = useAuthToken();
    const [dishDetail, setDishDetail] = useState<DishDetail | null>(null);
    const { id } = useParams();

    // [Handle] Fetch Dish Detail By ID
    useEffect(() => {
        fetchDishDetail();
    }, []);
    const fetchDishDetail = async () => {
        try {
            const response = await axios.get<DishDetail>(`/dish/${id}`,
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}` // Set the token in the headers
                }
            }
            ); // Assuming the backend API endpoint is /dish/23
            setDishDetail(response.data);
        } catch (error) {
            console.error('Error fetching dish detail:', error);
        }
    };

    if (!dishDetail) {
        return <CircularProgress />;
    }

    return (
        <Container maxWidth="lg">
            <Typography variant="h4" align="center" gutterBottom>
                {dishDetail.name}
            </Typography>
            <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="300"
                            src={`data:image/jpeg;base64, ${dishDetail.image}`} // Assuming your image is stored as a Base64 string
                            alt={dishDetail.name}
                            style={{ objectFit: 'fill' }} // Types: fill, none, cover, contain, inherit
                        />
                    </Card>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">ID: {dishDetail.dishId}</Typography>
                            <Typography variant="h6" >Original Price:
                            {dishDetail.discount > 0 && (
                                <p style={{textDecoration: 'line-through', display: "inline", marginLeft: "0.4rem"}}>${dishDetail.originalPrice}</p>
                            )}
                            <p style={{display: "inline", marginLeft: "0.4rem"}}>${((100 - dishDetail.discount) / 100) * dishDetail.originalPrice}</p>
                            </Typography>
                            <Typography variant="h6">Discount: -{dishDetail.discount}%</Typography>
                            <Typography variant="h6">Preparation Time: {dishDetail.preparationTime} minutes</Typography>
                            <Typography variant="h6">Meal Set: {dishDetail.mealSet}</Typography>
                            <Typography variant="h6">Category: {dishDetail.categoryEnum}</Typography>
                            <Typography variant="h6">Created At: {dishDetail.createdAt}</Typography>
                            <Typography variant="h6">Created By: {dishDetail.createdBy}</Typography>
                            <Typography variant="h6">Updated By: {dishDetail.updatedBy}</Typography>
                            <Typography variant="h6">Is Deleted: {dishDetail.isDeleted ? 'Yes' : 'No'}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
};

export default ViewDetailDish;
