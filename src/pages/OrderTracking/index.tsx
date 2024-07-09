import {
  Box,
  Button,
  Container,
  Grid,
  Paper,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import PhoneAndroidIcon from "@mui/icons-material/PhoneAndroid";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArticleIcon from "@mui/icons-material/Article";
import PlaylistAddCheckCircleIcon from "@mui/icons-material/PlaylistAddCheckCircle";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import axios from "axios";
import { useAuthToken } from "../../utils/Auth/authUtils";

interface ShippingInformation {
  userId: number;
  userFirstName: string;
  userEmail: string;
  shippingAddress: string;
  shippingPhone: string;
}

interface OrderItemStatus {
  orderItemId: number;
  orderItemStatusEnum: string;
}

enum OrderStatus {
  ORDERED = "ORDERED",
  COURIER = "COURIER",
  DELIVERING = "DELIVERING",
  COMPLETED = "COMPLETED",
}

const OrderTracking: React.FC = () => {
  const accessToken = useAuthToken();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { ...rest } = location.state || {};

  const [shippingInfo, setShippingInfo] = useState<ShippingInformation>({
    userId: 0,
    userFirstName: "",
    userEmail: "",
    shippingAddress: "",
    shippingPhone: "",
  });

  const [listOrderItem, setListOrderItem] = useState<OrderItemStatus[]>([]);

  // [Handle] Get List Order Item
  // [Handle] Set Shipping Info Which Provided From Previous Page
  useEffect(() => {
    if (rest && rest.userId) {
      setShippingInfo(rest);
      fetchListOrderItem(rest.userId);
    }
  }, []);
  const fetchListOrderItem = async (userId: number) => {
    try {
      const response = await axios.get(`/order/get-order-items-by-user-id`, {
        params: {
          status: "ACTIVE",
          userId: userId,
        },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      //   console.log("List Order Item:", response.data);

      setListOrderItem(response.data);
    } catch (error) {
      console.error("Error Fetching List Order Item:", error);
    }
  };

  // [Count] Count By Order Item Status
  const getOrderItemCount = (status: string) => {
    return listOrderItem.filter((item) => item.orderItemStatusEnum === status)
      .length;
  };

  // [Handle] Click On Each Status Icon
  const handleStatusClick = (status: OrderStatus) => {
    navigate("/detail-order-tracking", {
      state: {
        userId: shippingInfo.userId,
        orderStatus: status,
      },
    });
  };

  return (
    <>
      {shippingInfo.userId === 0 ? (
        <React.Fragment>
          <Typography variant="h5">
            No order tracking information available!
          </Typography>
        </React.Fragment>
      ) : (
        <Container maxWidth="lg">
          {/* [SECTION] ORDER TRACKING */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            {/* GO TO ORDER HISTORY (Detail Order Tracking with status: COMPLETED)  */}
            {shippingInfo.shippingAddress && shippingInfo.shippingPhone && (
              <Grid
                container
                spacing={3}
                alignItems="center"
                justifyContent="flex-end"
              >
                <Button
                  sx={{
                    marginBottom: isMobile ? "1rem" : "0.8rem",
                    fontWeight: 700,
                    minWidth: isMobile ? "auto" : "120px",
                    fontSize: isMobile ? "13px" : "14px",
                  }}
                  onClick={() => handleStatusClick(OrderStatus.COMPLETED)}
                >
                  Order History &gt;
                </Button>
              </Grid>
            )}

            {/* ORDER TRACKING PROGRESS */}
            <Grid container spacing={3} alignItems="center">
              {/* Order Status 1 */}
              <Grid item xs={3} md={3} lg={3}>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item sx={{ position: "relative" }}>
                    <ArticleIcon
                      fontSize="large"
                      color={
                        getOrderItemCount(OrderStatus.ORDERED) > 0
                          ? "primary"
                          : "inherit"
                      }
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleStatusClick(OrderStatus.ORDERED)}
                    />
                    <Box
                      sx={{
                        display:
                          getOrderItemCount(OrderStatus.ORDERED) > 0
                            ? "flex"
                            : "none",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: "rgb(124, 3, 3)",
                        color: "white",
                        position: "absolute",
                        top: -8,
                        left: -8,
                      }}
                    >
                      {getOrderItemCount(OrderStatus.ORDERED)}
                    </Box>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          getOrderItemCount(OrderStatus.ORDERED) > 0
                            ? "#1976d2"
                            : "inherit",
                        cursor: "pointer",
                      }}
                      onClick={() => handleStatusClick(OrderStatus.ORDERED)}
                    >
                      Ordered
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Order Status 2 */}
              <Grid item xs={3} md={3} lg={3}>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item sx={{ position: "relative" }}>
                    <PlaylistAddCheckCircleIcon
                      fontSize="large"
                      color={
                        getOrderItemCount(OrderStatus.COURIER) > 0
                          ? "primary"
                          : "inherit"
                      }
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleStatusClick(OrderStatus.COURIER)}
                    />
                    <Box
                      sx={{
                        display:
                          getOrderItemCount(OrderStatus.COURIER) > 0
                            ? "flex"
                            : "none",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: "rgb(124, 3, 3)",
                        color: "white",
                        position: "absolute",
                        top: -8,
                        left: -8,
                      }}
                    >
                      {getOrderItemCount(OrderStatus.COURIER)}
                    </Box>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          getOrderItemCount(OrderStatus.COURIER) > 0
                            ? "#1976d2"
                            : "inherit",
                        cursor: "pointer",
                      }}
                      onClick={() => handleStatusClick(OrderStatus.COURIER)}
                    >
                      Courier
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Order Status 3 */}
              <Grid item xs={3} md={3} lg={3}>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item sx={{ position: "relative" }}>
                    <LocalShippingIcon
                      fontSize="large"
                      color={
                        getOrderItemCount(OrderStatus.DELIVERING) > 0
                          ? "primary"
                          : "inherit"
                      }
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleStatusClick(OrderStatus.DELIVERING)}
                    />
                    <Box
                      sx={{
                        display:
                          getOrderItemCount(OrderStatus.DELIVERING) > 0
                            ? "flex"
                            : "none",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: "rgb(124, 3, 3)",
                        color: "white",
                        position: "absolute",
                        top: -8,
                        left: -8,
                      }}
                    >
                      {getOrderItemCount(OrderStatus.DELIVERING)}
                    </Box>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          getOrderItemCount(OrderStatus.DELIVERING) > 0
                            ? "#1976d2"
                            : "inherit",
                        cursor: "pointer",
                      }}
                      onClick={() => handleStatusClick(OrderStatus.DELIVERING)}
                    >
                      Delivering
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>

              {/* Order Status 4 */}
              <Grid item xs={3} md={3} lg={3}>
                <Grid container justifyContent="center" alignItems="center">
                  <Grid item sx={{ position: "relative" }}>
                    <CheckCircleIcon
                      fontSize="large"
                      color={
                        getOrderItemCount(OrderStatus.COMPLETED) > 0
                          ? "primary"
                          : "inherit"
                      }
                      sx={{ cursor: "pointer" }}
                      onClick={() => handleStatusClick(OrderStatus.COMPLETED)}
                    />
                    <Box
                      sx={{
                        display:
                          getOrderItemCount(OrderStatus.COMPLETED) > 0
                            ? "flex"
                            : "none",
                        justifyContent: "center",
                        alignItems: "center",
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        backgroundColor: "rgb(124, 3, 3)",
                        color: "white",
                        position: "absolute",
                        top: -8,
                        left: -8,
                      }}
                    >
                      {getOrderItemCount(OrderStatus.COMPLETED)}
                    </Box>
                  </Grid>
                  <Grid item>
                    <Typography
                      variant="body2"
                      sx={{
                        color:
                          getOrderItemCount(OrderStatus.COMPLETED) > 0
                            ? "#1976d2"
                            : "inherit",
                        cursor: "pointer",
                      }}
                      onClick={() => handleStatusClick(OrderStatus.COMPLETED)}
                    >
                      Completed
                    </Typography>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Paper>

          {/* [SECTION] REVIEW PAYMENT INFO */}
          {shippingInfo.shippingAddress && shippingInfo.shippingPhone && (
            <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
              {/* ROW */}
              <Grid container justifyContent="space-between">
                <Grid item xs={12} sm={2} md={1} lg={1}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "20px",
                      lineBreak: "anywhere",
                    }}
                  >
                    <b>{shippingInfo.userFirstName}</b>
                  </Typography>
                </Grid>
              </Grid>

              {/* ROW */}
              <Grid container justifyContent="space-between">
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "20px",
                      display: "flex",
                      alignItems: "center",
                      lineBreak: "anywhere",
                    }}
                  >
                    <PhoneAndroidIcon />
                    {shippingInfo.shippingPhone}
                  </Typography>
                </Grid>
              </Grid>

              {/* ROW */}
              <Grid container justifyContent="space-between">
                <Grid item xs={12} sm={12} md={12} lg={12}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontSize: "20px",
                      display: "flex",
                      alignItems: "center",
                      lineBreak: "anywhere",
                    }}
                  >
                    <LocationOnIcon />
                    {shippingInfo.shippingAddress}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          )}
        </Container>
      )}
    </>
  );
};

export default OrderTracking;
