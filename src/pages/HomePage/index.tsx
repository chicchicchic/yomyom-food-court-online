import React, { useEffect, useState } from "react";
import { makeStyles } from "@mui/styles";
import {
  Grid,
  Card,
  CardMedia,
  CardContent,
  Typography,
  SelectChangeEvent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Snackbar,
  TextField,
} from "@mui/material";
import axios from "axios";
import FilterCategory from "./FilterCategory";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import PaginationBar from "./Pagination";
import EventsSliceBar from "./EventsSliceBar";
import PopupDishDetail from "./PopupDishDetail";
import AddToBasketForm from "./PopupDishDetail/AddToBasketForm";
import { getDecodeToken, useAuthToken } from "../../utils/Auth/authUtils";
import CloseIcon from "@mui/icons-material/Close";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    marginLeft: "auto",
    "@media (min-width: 376px)": {
      padding: "1rem",
    },
  },
  card: {
    width: "100%",
    cursor: "pointer",
    transition: "transform 0.3s ease", // Add transition for smooth effect
    "&:hover": {
      transform: "scale(1.05)", // Scale up when hovered
    },
  },
  media: {
    height: 140,
  },
  mediaWrapper: {
    position: "relative", // Ensure proper positioning of the CardMedia and the discount tag
  },
  discountTag: {
    position: "absolute",
    top: "4px",
    left: "4px",
    backgroundColor: "#00b14f",
    color: "white",
    padding: "5px 10px",
    borderRadius: "5px",
    zIndex: 1, // Ensure the tag is above the image
  },
  filterContainer: {
    position: "fixed",
    top: "9.5rem",
    left: 0,
    width: "100%",
    zIndex: 999,
    // backgroundColor: "#ffffff",
    paddingTop: "0",
  },
});

interface Dish {
  dishId: number;
  name: string;
  categoryEnum: string;
  discount: number;
  mealSet: string;
  image: string;
  originalPrice: number;
  preparationTime: number;

  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

const HomePage: React.FC = () => {
  const classes = useStyles();
  const accessToken = useAuthToken();
  const decodeToken = getDecodeToken();
  let userEmail: string | null = null;
  if (decodeToken) {
    userEmail = decodeToken.sub;
    // console.log("userEmail", userEmail);
  }

  const [list, setList] = useState<Dish[]>([]);

  const [fullList, setFullList] = useState<Dish[]>([]);

  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 8,
    totalPages: 1,
  });
  const [selectedCategory, setSelectedCategory] = useState("MAIN_COURSES");
  const { page, rowsPerPage } = pagination;

  // Dialog state
  const [open, setOpen] = useState(false);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const [quantity, setQuantity] = useState(0);
  const [userId, setUserId] = useState<number | null>(null);

  // Adding Successfully Snackbar
  const [openAddSuccessSnackBar, setOpenAddSuccessSnackBar] =
    React.useState(false);

  const [searchLabel, setSearchLabel] = useState("Search (name)");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // // Reference to the List Dishes section element
  // const listDishesRef = React.createRef<HTMLDivElement>();

  // [Handle] Fetching Dish List
  useEffect(() => {
    loadList();
    if (userEmail !== null || userEmail === "") {
      getUserIdByEmail(userEmail);
    }
  }, [page, rowsPerPage, selectedCategory, userEmail]);
  const loadList = async () => {
    // Prevent concurrent API calls
    if (loading) return;
    setLoading(true); // Set loading state to true

    try {
      const result = await axios.get(
        `/dish/dishes-by-category?categoryName=${selectedCategory}&pageNumber=${
          pagination.page - 1
        }&pageSize=${pagination.rowsPerPage}`
      );
      // console.log(result)
      setList(result.data.content);

      // For Search Bar
      setFullList(result.data.content);

      // pagination
      const totalItems = result.data.totalElements;
      // console.log("Total Item: ",totalItems);
      const totalPages = Math.ceil(totalItems / pagination.rowsPerPage);
      setPagination({
        ...pagination,
        totalPages: totalPages,
      });

      // Scroll to List Dishes section after fetching data for new category
      // if (listDishesRef.current) {
      //   listDishesRef.current.scrollIntoView({ behavior: "smooth" });
      // }
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
  const getUserIdByEmail = async (email: string) => {
    try {
      const response = await axios.get(`/user/find-by-email`, {
        params: { email },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("User Details Home:", response.data);
      if (response.data) {
        // console.log("IDDDDDDDDD la: ", response.data.userId)
        setUserId(response.data.userId);
      }
    } catch (error) {
      console.error("Error fetching User detail by email:", error);
    }
  };

  // [Handle] Change Category
  const handleChangeSelectedCategory = (category: string) => {
    setPagination({
      ...pagination,
      page: 1,
    });
    setSelectedCategory(category);
  };

  // [Handle] Pagination
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPagination({
      ...pagination,
      page: value,
    });
  };
  const handleRowsPerPageChange = (
    event: SelectChangeEvent<number>,
    child: React.ReactNode
  ) => {
    setPagination({
      ...pagination,
      page: 1,
      rowsPerPage: event.target.value as number,
    });
    setSearchTerm("");
  };

  // [Handle] Open and close Add Basket Dialog
  const handleOpenDialog = (dish: Dish) => {
    setSelectedDish(dish);
    setQuantity(0);
    setOpen(true);
  };
  const handleCloseDialog = () => {
    setSelectedDish(null);
    setQuantity(0);
    setOpen(false);
  };

  // [Handle] Open and close Add Successfully SnackBar
  const handleOpenAddSuccessSnackBar = () => {
    setOpenAddSuccessSnackBar(true);
  };
  const handleCloseAddSuccessSnackBar = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }
    setOpenAddSuccessSnackBar(false);
  };
  const action = (
    <React.Fragment>
      <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={handleCloseAddSuccessSnackBar}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </React.Fragment>
  );

  // [Handle] Add Item And Quantity To Basket Form
  const handleIncrease = () => setQuantity(quantity + 1);
  const handleDecrease = () => {
    if (quantity > 0) {
      setQuantity(quantity - 1);
    }
  };

  // [Handle] Add Item To Basket
  const handleAddToBasket = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    event.preventDefault();

    try {
      if (!selectedDish) {
        throw new Error("No dish selected");
      }

      if (!userId) {
        throw new Error("User ID not found");
      }

      const basketItemDTO = {
        dishId: selectedDish.dishId,
        quantity: quantity,
        createdBy: userEmail,
        updatedBy: userEmail,
      };

      const basketDTO = {
        userId: userId,
        createdBy: userEmail,
        updatedBy: userEmail,
        basketItemList: [basketItemDTO], // Combine basketItemDTO into basketDTO
      };

      await axios.post("/basket/add-item", basketDTO, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json", // Set the content type to JSON
        },
      });

      // When adding successfully
      handleCloseDialog();
      window.location.reload();
      handleOpenAddSuccessSnackBar();
    } catch (error) {
      console.error("Error adding item to basket:", error);
      alert("Failed to add item to basket. Please try again later.");
    }
  };

  // [Handle] Search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    // Helper function to remove diacritical marks and normalize the string
    const normalizeString = (str: string) => {
      return str
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    };

    const normalizedSearchTerm = normalizeString(searchTerm);

    if (normalizedSearchTerm === "") {
      loadList();
    }

    const filteredDishes = fullList.filter((item: Dish) => {
      return normalizeString(item.name).includes(normalizedSearchTerm);
    });
    setList(filteredDishes);

    // Pagination base on the length of the "filteredDishes"
    const totalItems = filteredDishes.length;
    const totalPages = Math.ceil(totalItems / pagination.rowsPerPage);
    setPagination({
      ...pagination,
      totalPages: totalPages,
    });
  };


  return (
    <div className={classes.root}>
      {/* FILTER CATEGORY */}
      <div className={classes.filterContainer}>
        <FilterCategory
          handleChangeSelectedCategory={handleChangeSelectedCategory}
        />
      </div>

      {/* INTRO EVENTS SLICE BAR */}
      <EventsSliceBar />

      {/* [SEARCH] Search */}
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={11} md={11} lg={11}>
          <TextField
            label={searchLabel}
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            // onChange={(e) => setSearchTerm(e.target.value)}
            onChange={handleSearch}
            onFocus={() => setSearchLabel("Search")}
            onBlur={() => setSearchLabel("Search (name)")}
          />
        </Grid>
      </Grid>

      {/* LIST OF DISHES */}
      <div
      // ref={listDishesRef}
      >
        {loading ? (
          <h2 style={{ marginTop: "3rem" }}>Loading...</h2>
        ) : list.length <= 0 ? (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginTop: "5rem",
            }}
          >
            <ErrorOutlineIcon
              fontSize="large"
              style={{ marginRight: "10px" }}
            />
            <h3>Have no any dishes in this category</h3>
          </div>
        ) : (
          <Grid container spacing={2} sx={{ marginTop: "0.5rem" }}>
            {list.map((item) => (
              // xs:12(mobile): 1 item/row; sm:6(tablet): 2 items/row; md:4(destop-medium): 3 item/row; lg:3(destop-large): 4 items/row;
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.dishId}>
                <Card
                  className={classes.card}
                  onClick={() => handleOpenDialog(item)} // Open dialog on click
                >
                  <div className={classes.mediaWrapper}>
                    {item.discount > 0 && (
                      <div className={classes.discountTag}>
                        {`-${item.discount}%`}
                      </div>
                    )}

                    <CardMedia
                      className={classes.media}
                      image={`data:image/jpeg;base64, ${item.image}`}
                      title={item.name}
                    />
                  </div>

                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {item.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="textSecondary"
                      component="p"
                    >
                      Price:{" "}
                      <b>
                        {item.discount > 0 && (
                          <>
                            <del style={{ marginRight: "0.5rem" }}>
                              {`$${item.originalPrice}`}
                            </del>
                          </>
                        )}
                        <span>
                          {`$${(
                            item.originalPrice *
                            (1 - item.discount / 100)
                          ).toFixed(2)}`}
                        </span>
                      </b>
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}
      </div>

      {/* PAGINATION */}
      {list.length > 0 && (
        <PaginationBar
          pagination={pagination}
          handleRowsPerPageChange={handleRowsPerPageChange}
          handlePageChange={handlePageChange}
        />
      )}

      {/* [DIALOG] FOR DISH DETAILS */}
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
              <hr
                style={{
                  width: "100%",
                  height: "1px",
                  backgroundColor: "#e7e9eb",
                  border: "none",
                }}
              />

              <Grid item>
                <AddToBasketForm
                  quantity={quantity}
                  handleIncrease={handleIncrease}
                  handleDecrease={handleDecrease}
                  handleAddToBasket={handleAddToBasket}
                  dishPrice={
                    selectedDish.originalPrice *
                    (1 - selectedDish.discount / 100) *
                    quantity
                  }
                />
              </Grid>

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

      {/* [SNACKBAR] ADD TO BASKET SUCCESSFULLY */}
      <Snackbar
        open={openAddSuccessSnackBar}
        autoHideDuration={6000} // 6000 = 6s
        onClose={handleCloseAddSuccessSnackBar}
        message="You added the dish to basket successfully !"
        action={action}
        sx={{
          "& .MuiSnackbarContent-root": {
            backgroundColor: "green",
            color: "white",
          },
        }}
      />

      {/* ADD MORE */}
    </div>
  );
};

export default HomePage;
