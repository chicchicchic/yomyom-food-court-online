import React, { useEffect, useRef, useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Paper,
  TextField,
  Button,
  List,
  ListItem,
  Avatar,
  Divider,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Snackbar,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { Link, useLocation, useNavigate } from "react-router-dom";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import LocalAtmIcon from "@mui/icons-material/LocalAtm";
import axios from "axios";
import { getDecodeToken, useAuthToken } from "../../utils/Auth/authUtils";
import CloseIcon from "@mui/icons-material/Close";
import { useDispatch } from "react-redux";
import { setCartItemCount } from "../../reducers/Slice/cartSlice";
import jsPDF from "jspdf";
import { apiUrl } from "../../variable/globalVariable";

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

interface PlaceOrderItem {
  dish: Dish;
  quantity: number;
}

interface UserDetail {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
}

interface OrderItemDTO {
  dishId: number;
  quantity: number;
  totalPrice: number;

  createdBy: string;
  updatedBy: string;
}

interface OrderDTO {
  userId: number;
  address: string;
  phone: string;
  totalPayment: number;
  paymentMethod: string;
  deliveryTime: string;
  notes: string;
  orderItems: OrderItemDTO[];

  createdBy: string;
  updatedBy: string;
}

const PlaceOrder: React.FC = () => {
  const accessToken = useAuthToken();

  const decodeToken = getDecodeToken();
  let userEmail: string | null = null;
  if (decodeToken) {
    userEmail = decodeToken.sub;
    // console.log("userDecoded", decodeToken);
  }

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { list } = location.state || {};

  const [customerInfo, setCustomerInfo] = useState<UserDetail>({
    userId: 0,
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Cash on delivery");
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState("");
  const [openPlaceOrderSuccessSnackBar, setOpenPlaceOrderSuccessSnackBar] =
    React.useState(false);
  const addressRef = useRef<HTMLInputElement>(null);
  const phoneRef = useRef<HTMLInputElement>(null); // Add a ref for phone input if needed
  const timeSlotRef = useRef<HTMLSelectElement>(null);

  const [openConfirmationDialog, setOpenConfirmationDialog] = useState(false);

  const [fileFormat, setFileFormat] = useState<string>("pdf");
  const handleFileFormatChange = (event: SelectChangeEvent<string>) => {
    setFileFormat(event.target.value);
  };

  // [Handle] Fetch User's Detail From User Email;
  // [Handle] Generate Time Slots For Dropdown In Field "Delivery Time"
  useEffect(() => {
    // console.log("LIST PAY", list);
    if (userEmail !== null || userEmail === "") {
      fetchDetailByEmail(userEmail);
    }
    generateTimeSlots();
  }, []);
  const fetchDetailByEmail = async (email: string) => {
    try {
      const response = await axios.get(`${apiUrl}/user/find-by-email`, {
        params: { email },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      console.log("User Details Basket:", response.data);
      if (response.data) {
        setCustomerInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching User detail by email:", error);
    }
  };
  const generateTimeSlots = () => {
    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const slots = [];
    let defaultSlot = "";

    // [REMEMBER] set start hour to 6, end hour to 22
    for (let hour = 2; hour < 24; hour++) {
      const startHour = hour;
      const endHour = hour + 1;
      const timeSlot = `${startHour}:00 - ${endHour}:00`;

      if (startHour >= currentHour) {
        slots.push(timeSlot);

        if (startHour === currentHour && currentMinute < 60) {
          defaultSlot = timeSlot;
        } else if (startHour > currentHour && defaultSlot === "") {
          defaultSlot = timeSlot;
        }
      }
    }

    setTimeSlots(slots);
    setSelectedTimeSlot(defaultSlot || slots[0]);
  };

  // [Handle] Change Phone Number (if any)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value; // Get the current value entered in the input field

    // Check if the value is empty or consists only of digits (numbers)
    if (!value || /^\d*$/.test(value)) {
      setPhone(value); // Update the state variable 'phone' with the entered value
    } else {
      // If the entered value is not empty and contains non-digit characters
      setPhone(customerInfo.phone || ""); // Set 'phone' to the customer's existing phone number or an empty string if unavailable
    }
  };

  // [Calculate] Calculate Total Price Of Each Dish
  const calculateTotalPrice = (price: string, quantity: number) => {
    return +price * quantity;
  };

  // [Calculate] Calculate Total Order Price
  const totalOrderPrice = list?.reduce((acc: number, curr: PlaceOrderItem) => {
    return (
      acc +
      calculateTotalPrice(
        (curr.dish.originalPrice * (1 - curr.dish.discount / 100)).toFixed(2),
        curr.quantity
      )
    );
  }, 0);

  // [Handle] Open and close Place Order Successfully SnackBar
  const handleOpenPlaceOrderSuccessSnackBar = () => {
    setOpenPlaceOrderSuccessSnackBar(true);
  };
  const handleClosePlaceOrderSuccessSnackBar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenPlaceOrderSuccessSnackBar(false);
  };
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleClosePlaceOrderSuccessSnackBar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // [Handle] Submit Place Order Form
  const handlePlaceOrderClick = () => {
    if (!address) {
      if (addressRef.current) {
        addressRef.current.focus();
      }
    } else if (!phone && !customerInfo.phone) {
      if (phoneRef.current) {
        phoneRef.current.focus();
      }
    } else if (!selectedTimeSlot) {
      if (timeSlotRef.current) {
        timeSlotRef.current.focus();
      }
    } else {
      handlePlaceOrder();
    }
  };
  // [Handle] Remove Item From Basket
  const deleteAllItemsFromBasket = async (userId: number) => {
    try {
      await axios.delete(`${apiUrl}/basket/clear-all-items-from-basket/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // alert("All Items In Basket Of UserId: " + userId + " removed without any errors !")
    } catch (error) {
      console.error("Error removing items from basket:", error);
      alert(`Error removing items from basket: ${(error as Error).message}`);
    }
  };
  const handlePlaceOrder = async () => {
    try {
      const orderItems: OrderItemDTO[] = list.map((item: PlaceOrderItem) => ({
        dishId: item.dish.dishId,
        quantity: item.quantity,
        totalPrice: calculateTotalPrice(
          (item.dish.originalPrice * (1 - item.dish.discount / 100)).toFixed(2),
          item.quantity
        ),
        createdBy: customerInfo.email,
        updatedBy: customerInfo.email,
      }));

      const orderDTO: OrderDTO = {
        userId: customerInfo.userId,
        address: address,
        phone: phone || customerInfo.phone,
        totalPayment: totalOrderPrice,
        paymentMethod: paymentMethod,
        deliveryTime: selectedTimeSlot,
        notes: notes,
        orderItems: orderItems,
        createdBy: customerInfo.email,
        updatedBy: customerInfo.email,
      };

      const response = await axios.post(`${apiUrl}/order/create`, orderDTO, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // console.log("Order placed successfully:", response.data);
      setOpenConfirmationDialog(true); // Confirm Do you want Export Bill ? (PDF, TXT)
    } catch (error) {
      // Handle error (e.g., show error message)
      alert("Error placing order !");
    }
  };
  const handleConfirmExport = (exportBill: boolean) => {
    setOpenConfirmationDialog(false); // Customer choose Yes/No => Close the popup first

    if (exportBill) {
      exportBillHandler();
    }

    if (paymentMethod === "Cash on delivery") {
      // Handle successful response (e.g., show confirmation message)
      handleOpenPlaceOrderSuccessSnackBar();

      setTimeout(() => {
        // Clear the basket
        deleteAllItemsFromBasket(customerInfo.userId);
        dispatch(setCartItemCount(0)); // Dispatch action to set count in Redux

        // Navigate the next page
        navigate("/order-tracking", {
          state: {
            userId: customerInfo.userId,
            userFirstName: customerInfo.firstName,
            userEmail: customerInfo.email,
            shippingAddress: address,
            shippingPhone: phone || customerInfo.phone,
          },
        });
      }, 2000); // Delay navigation by 2 seconds
    } else if (paymentMethod === "Credit Card") {
      // Handle successful response (e.g., show confirmation message)
      handleOpenPlaceOrderSuccessSnackBar();

      setTimeout(() => {
        // Clear the basket
        deleteAllItemsFromBasket(customerInfo.userId);
        dispatch(setCartItemCount(0)); // Dispatch action to set count in Redux

        navigate("/go-to-payment-credit-card"); // Navigate to success page or handle success state
      }, 2000); // Delay navigation by 3 seconds
    }
  };
  const exportBillHandler = () => {
    console.log("Exporting bill.......");
    const currentDate = new Date();
    const formattedDate = currentDate.toLocaleString(); // Format the date as needed
    const totalPayment = totalOrderPrice || 0;

    let formattedBillContent = `
                                    Yomyom Food Court
                            123 Ngo Duc Ke, District 1, HCMC
                                     tel: 02822539177
                                  ${formattedDate}
      =========================================================================
      =========================================================================
                           QTY                 PRICE                VALUE
    `;

    list.forEach((item: PlaceOrderItem, index: number) => {
      // Adjust the spacing and alignment based on your requirements
      formattedBillContent += `
        ${index + 1}.${item.dish.name.padEnd(20)} \n
        ${"".padEnd(20)}${item.quantity.toString().padEnd(20)}$${(item.dish.originalPrice *(1 - item.dish.discount / 100)).toString().padEnd(20)}$${calculateTotalPrice((item.dish.originalPrice * (1 - item.dish.discount / 100)).toFixed(2),item.quantity)} \n
      `;
    });

    formattedBillContent += `
      =========================================================================
                                                     Total:          $${totalPayment.toString()}
    `;

    if (fileFormat === "txt") {
      exportAsTxt(formattedBillContent);
    } else if (fileFormat === "pdf") {
      exportAsPdf(formattedBillContent);
    }
  };
  const exportAsTxt = (billContent: string) => {
    const blob = new Blob([billContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "bill.txt";
    link.click();
    URL.revokeObjectURL(url);
  };
  const exportAsPdf = (billContent: string) => {
    const doc = new jsPDF();
    doc.text(billContent, 10, 10);
    doc.save("bill.pdf");
  };


  return (
    <>
      {!userEmail || !list || list.length === 0 ? (
        <React.Fragment>
          <Typography variant="h5">
            No payment information available!
          </Typography>
        </React.Fragment>
      ) : (
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            gutterBottom
            sx={{ textAlign: "center", fontSize: 30, fontWeight: 600 }}
          >
            Payment
          </Typography>

          {/* [INFO + FORM] USER INFO, PLACE ORDER FORM */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Typography variant="body1">
                  Name: {customerInfo.firstName || "Default Name"} - ID:{" "}
                  {customerInfo.userId || "unknown"}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Typography variant="body1">
                  Total Items: {list.length}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={
                    customerInfo.firstName || customerInfo.lastName
                      ? customerInfo.firstName + " " + customerInfo.lastName
                      : "Default Fullname"
                  }
                  disabled
                />
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={customerInfo.email || "Default Email"}
                  disabled
                />
              </Grid>

              {/* Field address */}
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  fullWidth
                  type="text"
                  variant="outlined"
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      What is your shipping address ?
                      <Typography
                        component="p"
                        sx={{ color: "red", marginLeft: "0.2rem" }}
                      >
                        (*)
                      </Typography>
                    </div>
                  }
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  inputRef={addressRef}
                />
              </Grid>

              {/* Field phone */}
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  fullWidth
                  type="number"
                  variant="outlined"
                  label={
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      Can deliver contact you with "{customerInfo.phone}" ?
                      <Typography
                        component="p"
                        sx={{ color: "red", marginLeft: "0.2rem" }}
                      >
                        (*)
                      </Typography>
                    </div>
                  }
                  value={phone}
                  placeholder="Enter new phone number (if any)"
                  onChange={handlePhoneChange}
                  inputRef={phoneRef}
                />
              </Grid>

              {/* Field Delivery Date */}
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={"Delivery Date: Today"}
                  disabled
                />
              </Grid>

              {/* Field Delivery Time */}
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <FormControl fullWidth>
                  <FormLabel
                    sx={{
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Delivery Time:
                    <Typography
                      component="p"
                      sx={{ color: "red", marginLeft: "0.2rem" }}
                    >
                      (*)
                    </Typography>
                  </FormLabel>
                  <select
                    id="deliveryTime"
                    value={selectedTimeSlot}
                    onChange={(e) => setSelectedTimeSlot(e.target.value)}
                    style={{
                      padding: "0.4rem",
                    }}
                    ref={timeSlotRef}
                  >
                    {timeSlots.map((slot, index) => (
                      <option key={index} value={slot}>
                        {slot}
                      </option>
                    ))}
                  </select>
                </FormControl>
              </Grid>

              {/* Field note */}
              <Grid item xs={12} sm={12} md={12} lg={12}>
                <TextField
                  fullWidth
                  variant="outlined"
                  label="Do you have any notes for us ?"
                  multiline
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Grid>
            </Grid>
          </Paper>

          {/* [LIST] LIST OF ORDER ITEM */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontSize: "16px" }}>
              Order Items
            </Typography>
            <List>
              {list.map((item: PlaceOrderItem, index: number) => (
                <div>
                  <ListItem key={index}>
                    <Grid container spacing={2}>
                      <Grid item xs={4} sm={3} md={2}>
                        <Avatar
                          src={`data:image/jpeg;base64, ${item.dish.image}`}
                          sx={{
                            width: 100,
                            height: 100,
                            borderRadius: 1,
                            "@media (max-width: 375px)": {
                              // display: "inline",
                              width: 80,
                              height: 80,
                            },
                          }}
                        />
                      </Grid>

                      <Grid item xs={8} sm={9} md={10}>
                        <Grid container>
                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography variant="h6">
                              {item.dish.name}
                            </Typography>
                            <Typography variant="body1">
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
                          </Grid>

                          <Grid item xs={12} sm={6} md={6} lg={6}>
                            <Typography variant="body1">
                              Quantity: <b>{item.quantity}</b>
                            </Typography>
                            <Typography variant="body1">
                              Total Price:{" "}
                              <b>
                                $
                                {calculateTotalPrice(
                                  (
                                    item.dish.originalPrice *
                                    (1 - item.dish.discount / 100)
                                  ).toFixed(2),
                                  item.quantity
                                )}
                              </b>
                            </Typography>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </ListItem>
                  <Divider component="li" />
                </div>
              ))}
            </List>
          </Paper>

          {/* [RADIO BUTTON] PAYMENT METHOD SECTION */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            {/* Code here */}
            <FormControl component="fieldset">
              <Typography variant="h6" gutterBottom sx={{ fontSize: "16px" }}>
                Payment Method
              </Typography>
              <RadioGroup
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
              >
                <FormControlLabel
                  value="Cash on delivery"
                  control={<Radio />}
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <MonetizationOnIcon style={{ marginRight: 8 }} />
                      Cash on delivery
                    </div>
                  }
                />
                <FormControlLabel
                  value="Credit Card"
                  control={<Radio />}
                  label={
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <LocalAtmIcon style={{ marginRight: 8 }} />
                      Credit Cart
                    </div>
                  }
                />
              </RadioGroup>
            </FormControl>
          </Paper>

          {/* [REVIEW] PAYMENT INFO */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            {/* ROW */}
            <Grid container justifyContent="space-between">
              <Grid item xs={9} sm={10} md={11} lg={11}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                  }}
                >
                  Merchandise Subtotal:
                </Typography>
              </Grid>

              <Grid item xs={3} sm={2} md={1} lg={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                  }}
                >
                  <b>${totalOrderPrice}</b>
                </Typography>
              </Grid>
            </Grid>

            {/* ROW */}
            <Grid container justifyContent="space-between">
              <Grid item xs={9} sm={10} md={11} lg={11}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                  }}
                >
                  Shipping Subtotal:
                </Typography>
              </Grid>

              <Grid item xs={3} sm={2} md={1} lg={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                  }}
                >
                  <b>Free</b>
                </Typography>
              </Grid>
            </Grid>

            {/* ROW */}
            <Grid container justifyContent="space-between">
              <Grid item xs={9} sm={10} md={11} lg={11}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                  }}
                >
                  Total Payment:
                </Typography>
              </Grid>

              <Grid item xs={3} sm={2} md={1} lg={1}>
                <Typography
                  variant="h6"
                  sx={{
                    fontSize: "20px",
                    color: "red",
                  }}
                >
                  <b>${totalOrderPrice}</b>
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* [BUTTON] PLACE ORDER */}
          <div style={{ textAlign: "right", marginTop: "2rem" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                fontSize: "14px",
                backgroundColor:
                  !address ||
                  (!phone && !customerInfo.phone) ||
                  !selectedTimeSlot
                    ? "gray"
                    : "primary.main",
                cursor:
                  !address ||
                  (!phone && !customerInfo.phone) ||
                  !selectedTimeSlot
                    ? "not-allowed"
                    : "pointer",
              }}
              onClick={handlePlaceOrderClick}
              // disabled={
              //   !address || (!phone && !customerInfo.phone) || !selectedTimeSlot
              // }
            >
              Place Order
            </Button>
          </div>
        </Container>
      )}

      {/* [SNACKBAR] PLACE ORDER SUCCESSFULLY */}
      <Snackbar
        open={openPlaceOrderSuccessSnackBar}
        autoHideDuration={6000} // 6000 = 6s
        onClose={handleClosePlaceOrderSuccessSnackBar}
        message="Order placed successfully !"
        action={action}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "green",
            color: "white",
          },
        }}
      />

      {/* [POPUP] Do You Want To Export Your Bill (PDF/ TXT) */}
      <Dialog
        open={openConfirmationDialog}
        onClose={() => setOpenConfirmationDialog(false)}
        aria-labelledby="confirmation-dialog-title"
        aria-describedby="confirmation-dialog-description"
      >
        <DialogTitle id="confirmation-dialog-title">
          {"Order Confirmation"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="confirmation-dialog-description">
            Your order has been placed successfully. Do you want to export the
            bill?
          </DialogContentText>
          <FormControl fullWidth>
            <InputLabel id="file-format-label">File Format</InputLabel>
            <Select
              labelId="file-format-label"
              value={fileFormat}
              onChange={handleFileFormatChange}
            >
              <MenuItem value="pdf">PDF</MenuItem>
              <MenuItem value="txt">TXT</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => handleConfirmExport(false)}
            color="primary"
          >
            No
          </Button>
          <Button
            onClick={() => handleConfirmExport(true)}
            color="primary"
            autoFocus
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default PlaceOrder;
