import React, { useEffect } from "react";
import { Container, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton, Paper, Divider, Button, Grid } from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { Link } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { RootState } from "../../app/store";
// import { removeItemFromCart, updateQuantity } from "../../reducers/cartSlice";
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import { makeStyles } from "@mui/styles";

const useStyles: any = makeStyles(() => ({
  productImage: {
    width: "100px",
    height: "100px",
    "@media (max-width: 375px)": {
      width: "60px",
      height: "60px"
    },
  }
}));

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

function ShoppingCart() {
//   const cartItemList = useSelector((state: RootState) => state.cart.cartList);
//   const dispatch = useDispatch();
//   console.log("cartItemList>>>>", cartItemList);
  const classes = useStyles();


  const calculateTotalPrice = (price: number, quantity: number): string => {
    const totalPrice = price * quantity;
    return totalPrice.toFixed(2);
  };

  const handleQuantityChange = (productId: number, increment: boolean) => {
    // dispatch(updateQuantity({ productId, increment }));
  };

  const handleDeleteItemFromCart = (cartItem: CartItem) => {
    // dispatch(removeItemFromCart(cartItem));
  };

//    Dummy data for products in the shopping cart
  const cartItemList: any[] = [
    {
      productId: 1,
      name: "Product 1",
      price: 10,
      quantity: 2,
      image: "https://via.placeholder.com/150",
    },
    {
      productId: 2,
      name: "Product 2",
      price: 20,
      quantity: 1,
      image: "https://via.placeholder.com/150",
    },
    {
      productId: 3,
      name: "Product 3",
      price: 30,
      quantity: 3,
      image: "https://via.placeholder.com/150",
    },
  ];

  return (
    <Container maxWidth="lg">
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textAlign: "center", fontSize: 30, fontWeight: 600 }}
      >
        Your Shopping Cart
      </Typography>

      <Paper elevation={3}>
        <List>
          {cartItemList && cartItemList.length > 0 ? (
            cartItemList.map((cartItem: CartItem) => (
              <React.Fragment key={cartItem.productId}>
                <ListItem>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item>
                      <img
                        src="https://imageio.forbes.com/specials-images/imageserve/5fd00ea644cd62376ce2b6c1/In-this-photo-illustration-a-13inch-Macbook-pro-seen---/960x0.jpg?height=474&width=711&fit=bounds"
                        alt={cartItem.name}
                        className={classes.productImage}
                      />
                    </Grid>

                    <Grid item xs>
                      <h2 style={{ fontWeight: 600 }}>{cartItem.name}</h2>
                      <h3>
                      Price:{" "}
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                            display: "inline",
                          }}
                        >
                          ${cartItem.price}
                        </p>
                        {" "}
                        Quantity:{" "}
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                            display: "inline",
                          }}
                        >
                          {cartItem.quantity}
                        </p>
                        {" "}
                         Total:{" "}
                        <p
                          style={{
                            fontSize: "20px",
                            fontWeight: 600,
                            display: "inline",
                          }}
                        >
                          $
                          {calculateTotalPrice(
                            cartItem.price,
                            cartItem.quantity
                          )}
                        </p>
                      </h3>

                      <Button
                        variant="contained"
                        color="error"
                        sx={{ marginRight: "8px"}}
                        onClick={() =>
                          handleQuantityChange(cartItem.productId, false)
                        }
                      >
                        <RemoveCircleOutlineIcon
                          fontSize="medium"
                        />
                      </Button>

                      <Button
                        variant="contained"
                        onClick={() =>
                          handleQuantityChange(cartItem.productId, true)
                        }
                      >
                        <AddCircleOutlineIcon
                          fontSize="medium"
                        />
                      </Button>
                    </Grid>

                    <Grid item>
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() =>
                            handleDeleteItemFromCart(cartItem)
                          }
                        >
                          <DeleteIcon color="error" fontSize="large" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </Grid>
                  </Grid>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))
          ) : (
            <ListItem>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs>
                  <Typography variant="h4">Have no any products in your cart</Typography>
                </Grid>
              </Grid>
            </ListItem>
          )}
        </List>
      </Paper>

      {cartItemList && cartItemList.length > 0 ? (
        <div style={{ textAlign: "right", marginTop: "2rem" }}>
          <Link to="/payment">
            <Button
              variant="contained"
              color="primary"
              sx={{ fontSize: "14px" }}
            >
              Checkout
            </Button>
          </Link>
        </div>
      ) : (
        <div style={{ textAlign: "right", marginTop: "2rem" }}>
          <Link to="#" style={{ textDecoration: "none" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ fontSize: "14px", pointerEvents: "none", opacity: 0.5 }}
              disabled
            >
              Checkout
            </Button>
          </Link>
        </div>
      )}
    </Container>
  );
}

export default ShoppingCart;
