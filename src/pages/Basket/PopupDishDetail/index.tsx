import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {DialogContentText, Typography } from '@mui/material';


interface PopupDishDetailProps {
  onClose: () => void;
  selectedDishId: number | null;
}

interface Dish {
    dishId: number;
    name: string;
    image: string;
    originalPrice: number;
    discount: number;
    preparationTime: number;
    mealSet: string;
    categoryEnum: string;
}

const PopupDishDetail: React.FC<PopupDishDetailProps> = ({ onClose, selectedDishId }) => {
  const [dish, setDish] = useState<Dish | null>(null);


  // [Handle] Fetching Dish Details
  useEffect(() => {
    if (selectedDishId !== null) {
      fetchDishDetails();
    }
  }, [selectedDishId]);
  const fetchDishDetails = async () => {
    try {
      const response = await axios.get(`/dish/${selectedDishId}`);
      setDish(response.data);
    } catch (error: any) {
      console.error('Error fetching dish details:', error);
    }
  };


  return (
    <DialogContentText>
      {dish && (
        <>
          <img
            src={`data:image/jpeg;base64, ${dish.image}`}
            alt={dish.name}
            style={{ width: "100%", marginBottom: "1rem" }}
          />

          <Typography variant="body1">
            <b>Price:</b>{' '}
            {dish.discount > 0 && (
              <>
                <del style={{ marginRight: "0.5rem" }}>{`$${dish.originalPrice}`}</del>
              </>
            )}
            <span>{`$${(dish.originalPrice * (1 - dish.discount / 100)).toFixed(2)}`}</span>
          </Typography>

          {dish.discount > 0 && (
            <Typography variant="body1">
              <b>Discount:</b> {`- ${dish.discount}%`}
            </Typography>
          )}

          <Typography variant="body1">
            <b>Preparation Time:</b> {dish.preparationTime} minutes
          </Typography>

          <Typography variant="body1">
            <b>Meal Set:</b> {dish.mealSet}
          </Typography>
        </>
      )}
    </DialogContentText>
  );
};

export default PopupDishDetail;
