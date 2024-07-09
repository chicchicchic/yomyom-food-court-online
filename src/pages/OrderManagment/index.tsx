import React, { useEffect, useState } from "react";
import { useAuthToken } from "../../utils/Auth/authUtils";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  SelectChangeEvent,
  Grid,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Container,
  CardMedia,
  Select,
  MenuItem,
  TextField,
} from "@mui/material";
import PaginationBar from "../../CommonComponent/Pagination";
import RecyclingIcon from "@mui/icons-material/Recycling";
import { Link } from "react-router-dom";
import moment from "moment";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import axios from "axios";

interface OrderItem {
  orderItemId: number;

  quantity: number;
  totalPrice: number;
  orderItemStatusEnum: string;
  dishName?: string;
  dishImage?: string;

  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

interface Order {
  orderId: number;

  address: string;
  phone: string;
  totalPayment: number;
  paymentMethod: string;
  deliveryTime: string;
  notes: string;
  orderStatusEnum: string;
  orderItems: OrderItem[];

  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

function OrderManagement() {
  const accessToken = useAuthToken();
  const [list, setList] = useState<Order[]>([]);
  const [orderItemStatusList, setOrderItemStatusList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 5,
    totalPages: 1,
  });
  const { page, rowsPerPage } = pagination;
  const [visibleOrderItems, setVisibleOrderItems] = useState<number | null>(
    null
  );
  const [searchLabel, setSearchLabel] = useState("Search (orderID/address/delivery time/phone/created by)");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // [Handle] Fetch Order Item Status
  // [Handle] Fetch All Orders And Order Items Of Each Order (isDeleted: false)
  useEffect(() => {
    fetchOrderItemStatusList();
    fetchOrders();
  }, [page, rowsPerPage, accessToken]);
  const fetchOrders = async () => {
    setLoading(true);

    try {
      const response = await axios.get(
        `/order-management/order-list?pageNumber=${
          pagination.page - 1
        }&pageSize=${pagination.rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // console.log("response.data.content >: ", response.data.content);
      setList(response.data.content);

      // pagination
      const totalItems = response.data.totalElements;
      // console.log(totalItems)
      const totalPages = Math.ceil(totalItems / pagination.rowsPerPage);
      setPagination({
        ...pagination,
        totalPages: totalPages,
      });
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
  const fetchOrderItemStatusList = async () => {
    try {
      const response = await axios.get(
        "/order-management/order-item-status-list",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // console.log("Order Item Status List: ", response)
      setOrderItemStatusList(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 error here
        setOrderItemStatusList([]);
      } else {
        // Handle other errors
        alert(error);
      }
    }
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
  };

  // [Handle] Handle Show/Hide Order Items (Sub-Records Of Each Order)
  const toggleOrderItems = (orderId: number) => {
    setVisibleOrderItems(visibleOrderItems === orderId ? null : orderId);
  };

  // [Handle] Change Order Item Status
  // [Handle] Auto Change Order Status When All Order Items In The Order Have Status "COMPLETED" of "CANCELLED"
  const handleStatusChange = async (
    event: React.ChangeEvent<{ value: unknown }>,
    orderId: number,
    orderItemId: number
  ) => {
    const newStatus = event.target.value as string;

    try {
      await axios.put(
        `/order-management/update-order-item-status/${orderItemId}`,
        null,
        {
          params: {
            newStatus: newStatus,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      // Update the status in local state
      setList((prevList) =>
        prevList.map((order) => {
          if (order.orderId === orderId) {
            const updatedOrderItems = order.orderItems.map((item) =>
              item.orderItemId === orderItemId
                ? { ...item, orderItemStatusEnum: newStatus }
                : item
            );
            const allItemsCompleteOrCancelled = updatedOrderItems.every(
              (item) =>
                item.orderItemStatusEnum === "CANCELLED" ||
                item.orderItemStatusEnum === "COMPLETED"
            );

            if (allItemsCompleteOrCancelled) {
              updateOrderStatus(orderId);
              return {
                ...order,
                orderItems: updatedOrderItems,
                orderStatusEnum: "COMPLETE",
                deleted: true,
              };
            }

            return {
              ...order,
              orderItems: updatedOrderItems,
            };
          }
          return order;
        })
      );
    } catch (error: any) {
      alert(error);
    }
  };
  const updateOrderStatus = async (orderId: number) => {
    try {
      await axios.put(
        `/order-management/update-order-status/${orderId}`,
        null,
        {
          params: {
            newStatus: "COMPLETED",
            isDeleted: true,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      window.location.reload();
    } catch (error: any) {
      alert(error);
    }
  };

  // [Filter] Filter orders based on search term (orderID/address/delivery time/phone/created by)
  const filteredOrders = list.filter((order: Order) =>
    order.orderId.toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.deliveryTime.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.createdBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
    {/* [BUTTON] Go To Trash */}
    <Grid container justifyContent="flex-end">
        <Grid item>
          <Link to="/order-management/trash-order-list">
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#000000",
                marginBottom: "1rem",
                marginRight: "1rem",
              }}
            >
              <RecyclingIcon sx={{ marginRight: "4px", fontSize: "24px" }} />
              Trash
            </Button>
          </Link>
        </Grid>
      </Grid>

      {/* [SEARCH] Search */}
      <Grid container justifyContent="center">
        <Grid item xs={12} sm={11} md={11} lg={11}>
          <TextField
            label={searchLabel}
            variant="outlined"
            fullWidth
            margin="normal"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setSearchLabel("Search")}
            onBlur={() => setSearchLabel("Search (orderID/address/delivery time/phone/created by)")}
            sx={{marginBottom: "2rem"}}
          />
        </Grid>
      </Grid>


      {/* [LIST] List All Orders And Their Order Items (Sub-Records) */}
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <TableContainer style={{ maxHeight: "350px", overflowY: "auto" }}>
          <Table className="border shadow">
            <TableHead sx={{ backgroundColor: "#000000" }}>
              <TableRow>
                <TableCell align="center" sx={{ color: "#ffffff" }}></TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Order ID
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Status
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Delivery Time
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Address
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Total Payment
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Notes
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Payment Method
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Delivery Phone Number
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Ordered At
                </TableCell>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                  Ordered By
                </TableCell>
              </TableRow>
            </TableHead>

            {filteredOrders.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={10} // because the number of columns in the table is 10
                    align="center"
                    style={{ fontSize: "14px" }}
                  >
                    (Have no any record founded!)
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {filteredOrders.map((listItem, index) => (
                  <>
                    {/* [MAIN-RECORDS] */}
                    <TableRow key={listItem.orderId}>
                      <TableCell align="center" style={{ minWidth: 100 }}>
                        <Button
                          onClick={() => toggleOrderItems(listItem.orderId)}
                        >
                          {visibleOrderItems === listItem.orderId ? (
                            <ArrowCircleUpIcon />
                          ) : (
                            <ArrowCircleDownIcon sx={{ color: "green" }} />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 70 }}
                      >
                        {listItem.orderId}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 100 }}
                      >
                        {listItem.orderStatusEnum}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 200 }}
                      >
                        {listItem.deliveryTime}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 200 }}
                      >
                        {listItem.address}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 200 }}
                      >
                        ${listItem.totalPayment}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 200 }}
                      >
                        {listItem.notes || "-"}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 200 }}
                      >
                        {listItem.paymentMethod}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 100 }}
                      >
                        {listItem.phone}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 300 }}
                      >
                        {moment(listItem.createdAt).format(
                          "MMMM Do YYYY, h:mm:ss a"
                        )}
                      </TableCell>
                      <TableCell
                        align="center"
                        style={{ fontSize: "14px", minWidth: 200 }}
                      >
                        {listItem.createdBy}
                      </TableCell>
                    </TableRow>

                    {/* [SUB-RECORDS] */}
                    {visibleOrderItems === listItem.orderId && (
                      <TableRow>
                        <TableCell colSpan={12}>
                          <Table>
                            <TableHead>
                              <TableRow>
                                <TableCell
                                  align="center"
                                  // colSpan={1}
                                  sx={{ border: "none", padding: 0 }}
                                ></TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  No.
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Status
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Item Name
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Image
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Quantity
                                </TableCell>
                                <TableCell
                                  align="center"
                                  sx={{ fontWeight: 600 }}
                                >
                                  Total Price
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {listItem.orderItems.map(
                                (item: OrderItem, index: number) => (
                                  <TableRow key={item.orderItemId}>
                                    {index === 0 && (
                                      <TableCell
                                        align="center"
                                        rowSpan={listItem.orderItems.length}
                                        sx={{ border: "none" }}
                                      ></TableCell>
                                    )}
                                    <TableCell align="center">
                                      {index + 1}
                                    </TableCell>
                                    <TableCell align="center">
                                      {/* Dropdown for status */}
                                      <Select
                                        value={item.orderItemStatusEnum}
                                        onChange={(event: any) =>
                                          handleStatusChange(
                                            event,
                                            listItem.orderId,
                                            item.orderItemId
                                          )
                                        }
                                        displayEmpty
                                        sx={{ width: "12rem" }}
                                      >
                                        {orderItemStatusList.map(
                                          (status: string, index: number) => (
                                            <MenuItem
                                              key={index}
                                              value={status}
                                            >
                                              {status}
                                            </MenuItem>
                                          )
                                        )}
                                      </Select>
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.dishName}
                                    </TableCell>
                                    <TableCell
                                      align="center"
                                      style={{
                                        fontSize: "14px",
                                        maxWidth: 50,
                                      }}
                                    >
                                      <CardMedia
                                        component="img"
                                        height="100"
                                        width="100"
                                        src={`data:image/jpeg;base64, ${item.dishImage}`}
                                        alt={item.dishName}
                                        style={{ objectFit: "fill" }} // Types: fill, none, cover, contain, inherit
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      {item.quantity}
                                    </TableCell>
                                    <TableCell align="center">
                                      ${item.totalPrice}
                                    </TableCell>

                                    {/* Other cells */}
                                  </TableRow>
                                )
                              )}
                            </TableBody>
                          </Table>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      )}

      {/* [SECTION] Pagination */}
      <PaginationBar
        pagination={pagination}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handlePageChange={handlePageChange}
      />
    </>
  );
}

export default OrderManagement;
