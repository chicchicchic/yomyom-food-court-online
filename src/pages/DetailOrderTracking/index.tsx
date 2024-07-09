import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuthToken } from "../../utils/Auth/authUtils";
import FilterStatus from "./FilterStatus";
import PaginationBar from "./Pagination";
import {
  Card,
  CardContent,
  CardMedia,
  Grid,
  SelectChangeEvent,
  Typography,
} from "@mui/material";
import { makeStyles } from "@mui/styles";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import axios from "axios";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
    marginLeft: "auto",
    "@media (min-width: 376px)": {
      padding: "1rem",
    },
  },
  filterContainer: {
    position: "fixed",
    top: "9.5rem",
    left: 0,
    width: "100%",
    zIndex: 999,
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

function DetailOrderTracking() {
  const classes = useStyles();
  const location = useLocation();
  const { userId, orderStatus } = location.state || {};
  const accessToken = useAuthToken();

  const [list, setList] = useState<Dish[]>([]); // State for list of dishes
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 8,
    totalPages: 1,
  });
  const [selectedStatus, setSelectedStatus] = useState(orderStatus || "COMPLETED");
  const { page, rowsPerPage } = pagination;

  // [Handle] Fetching Dish List
  useEffect(() => {
    loadList()
  }, [page, rowsPerPage, selectedStatus]);
  const loadList = async () => {
    // Prevent concurrent API calls
    if (loading) return;
    setLoading(true); // Set loading state to true

    try {
      const params = {
        userId: userId,
        status: selectedStatus ? selectedStatus : orderStatus,
        pageNumber: pagination.page - 1,
        pageSize: pagination.rowsPerPage
      }

      const result = await axios.get(
        `/order/detail-order-tracking`,
        {
            params,
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        }
      );
      console.log(result)
      setList(result.data.content);

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


  // [Handle] pagination changes
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number
  ) => {
    setPagination({
      ...pagination,
      page: value,
    });
  };

  // [Handle] rows per page change
  const handleRowsPerPageChange = (
    event: SelectChangeEvent<number>,
    child: React.ReactNode
  ) => {
    setPagination({
      ...pagination,
      page: 1,
      rowsPerPage: event.target.value as number,
    });
  };

  // [Handle] change of selected status
  const handleChangeSelectedStatus = (status: string) => {
    setPagination({
      ...pagination,
      page: 1,
    });
    setSelectedStatus(status);
  };

  return (
    <div className={classes.root}>
      {/* FILTER STATUS TYPE */}
      <div className={classes.filterContainer}>
        <FilterStatus
            handleChangeSelectedStatus={handleChangeSelectedStatus}
            selectedStatusDefault={orderStatus}
        />
      </div>

      {/* LIST OF ITEMS */}
      <div>
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
            <ErrorOutlineIcon fontSize="large" style={{ marginRight: "10px" }} />
            <h3>Have no any items in this status</h3>
          </div>
        ) : (
          <Grid container spacing={2}>
            {list.map((item) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={item.dishId}>
                <Card>
                  <CardMedia
                    component="img"
                    height="140"
                    image={`data:image/jpeg;base64, ${item.image}`}
                    alt={item.name}
                  />
                  <CardContent>
                    <Typography gutterBottom variant="h5" component="h2">
                      {item.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" component="p">
                      Price:{" "}
                      <b>
                        {item.discount > 0 && (
                          <>
                            <del style={{ marginRight: "0.5rem" }}>{`$${item.originalPrice}`}</del>
                          </>
                        )}
                        <span>{`$${(item.originalPrice * (1 - item.discount / 100)).toFixed(2)}`}</span>
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

      {/* ADD MORE */}
    </div>
  );
}

export default DetailOrderTracking;
