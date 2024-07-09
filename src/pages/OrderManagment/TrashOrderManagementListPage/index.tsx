import React, { useEffect, useState } from "react";

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
} from "@mui/material";

import { Link } from "react-router-dom";
import moment from "moment";
import ArrowCircleUpIcon from "@mui/icons-material/ArrowCircleUp";
import ArrowCircleDownIcon from "@mui/icons-material/ArrowCircleDown";
import axios from "axios";
import { useAuthToken } from "../../../utils/Auth/authUtils";
import PaginationBar from "../../../CommonComponent/Pagination";

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

function TrashOrderManagementListPage() {
  const accessToken = useAuthToken();
  const [list, setList] = useState<Order[]>([]);
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

  // [Handle] Fetch All Orders And Order Items Of Each Order (isDeleted: true)
  useEffect(() => {
    fetchOrders();
  }, [page, rowsPerPage, accessToken]);
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `/order-management/order-trash-list?pageNumber=${
          pagination.page - 1
        }&pageSize=${pagination.rowsPerPage}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("response.data.content >: ", response.data.content);
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


  return (
    <>
      {/* [LIST] List All Orders And Their Order Items (Sub-Records) */}
      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <TableContainer style={{ maxHeight: "350px", overflowY: "auto" }}>
          <Table className="border shadow">
            <TableHead sx={{ backgroundColor: "#000000" }}>
              <TableRow>
                <TableCell align="center" sx={{ color: "#ffffff" }}>
                </TableCell>
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

            {list.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={7}
                    align="center"
                    style={{ fontSize: "14px" }}
                  >
                    (Have no any record founded!)
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {list.map((listItem, index) => (
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
                                      {item.orderItemStatusEnum}
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

export default TrashOrderManagementListPage;
