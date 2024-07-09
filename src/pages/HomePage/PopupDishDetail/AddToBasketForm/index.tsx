import React from "react";
import { Button, Grid, IconButton, Typography } from "@mui/material";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import ErrorIcon from "@mui/icons-material/Error";
import { checkTokenIsExpired, useAuthToken } from "../../../../utils/Auth/authUtils";

interface AddToBasketFormProps {
  quantity: number;
  handleIncrease: () => void;
  handleDecrease: () => void;
  handleAddToBasket: (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => void;
  dishPrice: number;
}

const AddToBasketForm: React.FC<AddToBasketFormProps> = ({
  quantity,
  handleIncrease,
  handleDecrease,
  handleAddToBasket,
  dishPrice,
}) => {
  const expiredToken = checkTokenIsExpired();
  // console.log("expiredToken: ", expiredToken)

  return (
    <Grid
      container
      spacing={2}
      alignItems="center" // To center the content vertically
      justifyContent="center" // To center the content horizontally
    >
      <Grid item>
        <IconButton
          sx={{ color: quantity <= 0 ? "#e7e9eb" : "red", paddingLeft: 0 }}
          disabled={expiredToken && quantity <= 0}
          onClick={handleDecrease}
        >
          <RemoveCircleOutlineIcon fontSize="large" />
        </IconButton>
      </Grid>

      <Grid item>
        <Typography variant="h6">{quantity}</Typography>
      </Grid>

      <Grid item>
        <IconButton
          sx={{ color: "rgb(25, 118, 210)" }}
          disabled={expiredToken}
          onClick={handleIncrease}
        >
          <AddCircleIcon fontSize="large" />
        </IconButton>
      </Grid>

      <Grid item>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#00b14f",
            padding: "0.5rem 2rem", // Adjust padding as needed
            overflow: "hidden", // Hide overflow content if it exceeds the width
            "@media (min-width: 376px)": {
              padding: "0.5rem 5rem",
            },
          }}
          disabled={quantity <= 0}
          onClick={handleAddToBasket}
        >
          <Typography
            variant="body1"
            component="span"
            style={{
              marginRight: "1rem",
              whiteSpace: "nowrap", // Prevent content from wrapping on mobile screens
            }}
          >
            Add to Basket: ${dishPrice.toFixed(2)}
          </Typography>
        </Button>

        {(!expiredToken && quantity <= 0) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                display: "flex",
                alignItems: "center",
                color: "red"
              }}>
              <ErrorIcon style={{ marginRight: "8px" }} />
              You must choose quantity
            </p>
          </div>
        )}

        {(expiredToken) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <p
              style={{
                display: "flex",
                alignItems: "center",
                color: "red"
              }}>
              <ErrorIcon style={{ marginRight: "8px" }} />
              You must login to use this action
            </p>
          </div>
        )
      }
      </Grid>
    </Grid>
  );
};

export default AddToBasketForm;
