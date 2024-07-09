import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Divider,
  Grid,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import InfoIcon from "@mui/icons-material/Info";
import ProductionQuantityLimitsIcon from "@mui/icons-material/ProductionQuantityLimits";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import { makeStyles } from "@mui/styles";
import axios from "axios";
import { getDecodeToken, useAuthToken } from "../../utils/Auth/authUtils";
import { Link, useNavigate } from "react-router-dom";
import PopupDishDetail from "./PopupDishDetail";

const useStyles = makeStyles(() => ({
  listBasketItem: {
    display: "block",
    margin: 0,
    "@media (min-width: 376px)": {
      display: "inline",
    },
  },
  loadingIcon: {
    animation: "$spin 1s linear infinite",
  },
  "@keyframes spin": {
    "0%": {
      transform: "rotate(0deg)",
    },
    "100%": {
      transform: "rotate(360deg)",
    },
  },
}));

interface Dish {
  dishId: number;
  name: string;
  originalPrice: number;
  discount: number;
  image: string;
  mealSet: string;
  preparationTime: number;
  categoryEnum: string;

  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

interface BasketItem {
  dish: Dish;
  quantity: number;
}

const Basket: React.FC = () => {
  const accessToken = useAuthToken();
  const decodeToken = getDecodeToken();
  let userEmail: string | null = null;
  if (decodeToken) {
    userEmail = decodeToken.sub;
    // console.log("userDecoded", decode);
  }

  const classes = useStyles();
  const [list, setList] = useState<BasketItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const navigate = useNavigate();

  // [Handle] Fetch UserID From User's Email
  // [Handle] Get Basket Item List
  useEffect(() => {
    if (userEmail !== null || userEmail === "") {
      fetchDetailByEmail(userEmail);
    }
    if (userId !== null) {
      loadList();
    }
  }, [userId]);
  const fetchDetailByEmail = async (email: string) => {
    try {
      const response = await axios.get(`/user/find-by-email`, {
        params: { email },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("User Details Basket:", response.data);
      if (response.data) {
        console.log("IDDDDDDDDD la: ", response.data.userId);
        setUserId(response.data.userId);
      }
    } catch (error) {
      console.error("Error fetching User detail by email:", error);
    }
  };
  const loadList = async () => {
    // Prevent concurrent API calls
    if (loading) return;
    setLoading(true); // Set loading state to true

    try {
      const result = await axios.get(`/basket/basket-item-list/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Set the token in the headers
        },
      });
      console.log("Basket List: ", result.data);
      setList(result.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 error here
        setList([]);
      } else {
        // Handle other errors
        alert(error);
      }
    } finally {
      setLoading(false);
    }
  };

  // [Handle] Change Quantity
  const handleIncrease = (dishId: number, currentQuantity: number) => {
    const newQuantity = currentQuantity + 1;
    updateQuantity(dishId, newQuantity);
  };
  const handleDecrease = (dishId: number, currentQuantity: number) => {
    const newQuantity = currentQuantity - 1;
    if (newQuantity <= 0) {
      deleteItemFromBasket(dishId);
    } else {
      updateQuantity(dishId, newQuantity);
    }
  };
  const updateQuantity = async (dishId: number, newQuantity: number) => {
    try {
      const response = await axios.put(
        `/basket/update-item-quantity/${dishId}`,
        {
          quantity: newQuantity,
          userId: userId,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      // console.log("Updated Quantity:", response.data);
      setList(
        list.map((item) =>
          item.dish.dishId === dishId
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      alert(`Error updating quantity: ${(error as Error).message}`);
    }
  };

  // [Handle] Remove Item From Basket
  const deleteItemFromBasket = async (dishId: number) => {
    try {
      await axios.delete(`/basket/remove-item/${dishId}`, {
        params: { userId },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setList(list.filter((item) => item.dish.dishId !== dishId));
      window.location.reload();
    } catch (error) {
      console.error("Error deleting item from basket:", error);
      alert(`Error deleting item: ${(error as Error).message}`);
    }
  };

  // [Handle] Open and close dialog
  const handleOpenDialog = (dish: Dish) => {
    setSelectedDish(dish);
    setOpen(true);
  };
  const handleCloseDialog = () => {
    setSelectedDish(null);
    setOpen(false);
  };

  // [Handle] Go To Place Order Page
  const handleProceedToPlaceOrder = () => {
    navigate('/place-order',
      {
        state: { list }
      }
    );
  };

  return (
    <Container maxWidth="lg">
      {/* [BUTTON] Add More Button */}
      <Link to="/" style={{ display: "flex", justifyContent: "flex-end" }}>
        <AddCircleIcon sx={{ color: "green", fontSize: "3.5rem" }} />
      </Link>

      {/* [LIST] Basket List */}
      <Box>
        {loading ? (
          <CircularProgress
            size={50}
            sx={{ marginLeft: "50%", color: "green" }}
          />
        ) : list.length === 0 ? (
          <Typography
            variant="h5"
            sx={{
              display: "flex",
              justifyContent: "center"
            }}>
              <ProductionQuantityLimitsIcon
                fontSize="large"
                sx={{ marginRight: "1rem" }}
              />
              The basket is empty !
          </Typography>
        ) : (
          <div>
            <List sx={{ mt: 2 }}>
              {list.map((item) => (
                <div key={item.dish.dishId}>
                  <ListItem alignItems="flex-start">
                    <Grid container spacing={2} alignItems="center">
                      {/* Dish Detail */}
                      <Grid item>
                        <Avatar
                          src={`data:image/jpeg;base64, ${item.dish.image}`}
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 1,
                          }}
                        />
                      </Grid>

                      <Grid item xs={6} lg={6}>
                        <Typography
                          component="span"
                          variant="h6"
                          color="textPrimary"
                          sx={{ fontWeight: "bold" }}
                        >
                          {item.dish.name}
                        </Typography>

                        <br />

                        <Typography
                          component="span"
                          variant="h6"
                          color="textPrimary"
                          sx={{ marginRight: "1rem" }}
                          className={classes.listBasketItem}
                        >
                          Price:{" "}
                          <b>
                            {item.dish.discount > 0 && (
                              <>
                                <del style={{ marginRight: "0.5rem" }}>
                                  {`$${item.dish.originalPrice}`}
                                </del>
                              </>
                            )}
                            <span>
                              {`$${(
                                item.dish.originalPrice *
                                (1 - item.dish.discount / 100)
                              ).toFixed(2)}`}
                            </span>
                          </b>
                        </Typography>

                        <Typography
                          component="span"
                          variant="h6"
                          color="textPrimary"
                          sx={{ marginRight: "1rem" }}
                          className={classes.listBasketItem}
                        >
                          Quantity:{" "}
                          <p
                            style={{
                              display: "inline",
                              fontWeight: "bold",
                            }}
                          >
                            {item.quantity}
                          </p>
                        </Typography>

                        <Typography
                          component="span"
                          variant="h5"
                          color="textPrimary"
                          className={classes.listBasketItem}
                        >
                          Total:{" "}
                          <p
                            style={{
                              display: "inline",
                              fontWeight: "bold",
                            }}
                          >
                            {`$${(
                              item.dish.originalPrice *
                              (1 - item.dish.discount / 100) *
                              item.quantity
                            ).toFixed(2)}`}
                          </p>
                        </Typography>

                        <br />

                        {/* Change Quantity Section */}
                        <div style={{ display: "flex" }}>
                          <IconButton
                            sx={{
                              color: item.quantity <= 0 ? "#e7e9eb" : "red",
                              paddingLeft: 0,
                            }}
                            disabled={item.quantity <= 0}
                            onClick={() =>
                              handleDecrease(item.dish.dishId, item.quantity)
                            }
                          >
                            <RemoveCircleOutlineIcon fontSize="large" />
                          </IconButton>

                          <Typography
                            variant="h6"
                            sx={{ display: "flex", alignItems: "center" }}
                          >
                            {item.quantity}
                          </Typography>

                          <IconButton
                            sx={{ color: "rgb(25, 118, 210)" }}
                            onClick={() =>
                              handleIncrease(item.dish.dishId, item.quantity)
                            }
                          >
                            <AddCircleIcon fontSize="large" />
                          </IconButton>
                        </div>
                      </Grid>

                      {/* Actions Section */}
                      <Grid
                        item
                        container
                        xs={12}
                        sm={4}
                        justifyContent="flex-end"
                        spacing={1}
                      >
                        <Grid item>
                          <Tooltip title="Detail Item" placement="top">
                            <IconButton
                              edge="end"
                              aria-label="details"
                              onClick={() => handleOpenDialog(item.dish)}
                            >
                              <InfoIcon
                                fontSize="large"
                                sx={{ color: "#6e7783" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Grid>

                        <Grid item>
                          <Tooltip title="Remove Item" placement="top">
                            <IconButton
                              edge="end"
                              aria-label="delete"
                              onClick={() =>
                                deleteItemFromBasket(item.dish.dishId)
                              }
                            >
                              <CancelIcon
                                fontSize="large"
                                sx={{ color: "red" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Grid>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider component="li" />
                </div>
              ))}
            </List>

            <Button
              variant="contained"
              color="primary"
              onClick={handleProceedToPlaceOrder}
              disabled={!list || list.length === 0} // Disable the button if list is empty
            >
              Proceed to Place Order
            </Button>
          </div>
        )}
      </Box>

      {/* [POPUP] View Dish Detail */}
      {selectedDish && (
        <Dialog open={open} onClose={handleCloseDialog}>
          <DialogTitle>{selectedDish.name}</DialogTitle>
          <DialogContent>
            <PopupDishDetail
              onClose={handleCloseDialog}
              selectedDishId={selectedDish.dishId}
            />
          </DialogContent>
          <DialogActions>
            <Grid
              container
              spacing={2}
              alignItems="center"
              justifyContent="center"
            >
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={handleCloseDialog}
                  color="primary"
                >
                  Close
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      )}
    </Container>
  );
};

export default Basket;
