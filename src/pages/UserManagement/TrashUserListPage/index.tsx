import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import moment from "moment";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  SelectChangeEvent,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  Container,
  CardMedia,
} from "@mui/material";
import PaginationBar from "../../../CommonComponent/Pagination";
import WarningIcon from '@mui/icons-material/Warning';
import RestoreIcon from '@mui/icons-material/Restore';
import { useAuthToken } from "../../../utils/Auth/authUtils";
import { apiUrl } from "../../../variable/globalVariable";


// Define an interface representing the structure of the data returned from the API
interface User {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: null;
    roleEnum: string;
    createdAt: string;
    createdBy: string;
    updatedBy: string;
    isDeleted: boolean;
}

function TrashUserListPage() {
  const accessToken = useAuthToken();
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [itemIdToDelete, setItemIdToDelete] = useState<number | null>(null);
  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    rowsPerPage: 5,
    totalPages: 1,
  });
  const { id } = useParams();
  const { page, rowsPerPage } = pagination;


  // [Handle] Fetching Trash List
  useEffect(() => {
    loadList();
  }, [page, rowsPerPage]);

  const loadList = async () => {
    // Prevent concurrent API calls
    if (loading) return;
    setLoading(true); // Set loading state to true

    try {
      const result = await axios.get(
        `${apiUrl}/user/trash?pageNumber=${pagination.page - 1}&pageSize=${pagination.rowsPerPage}`,
        {
          headers: {
              'Authorization': `Bearer ${accessToken}` // Set the token in the headers
          }
        }
      );
      console.log(result)
      setList(result.data.content);

      // pagination
      const totalItems = result.data.totalElements;
      console.log(totalItems)
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
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPagination({
      ...pagination,
      page: value,
    });
  };
  const handleRowsPerPageChange = (event: SelectChangeEvent<number>, child: React.ReactNode) => {
    setPagination({
      ...pagination,
      page: 1,
      rowsPerPage: event.target.value as number,
    });
  };

  // [Handle] Restore
  const restoreItem = async (id: number) => {
    try {
      await axios.put(`${apiUrl}/user/restore/${id}`,
      {},
      {
        headers: {
            'Authorization': `Bearer ${accessToken}` // Set the token in the headers
        }
    }
      );
      loadList();
    } catch (error) {
        console.error("Error when restore:", error);
    }
  };

  // [Display + Handle] Permanently-Delete
  const deleteItem = async (id: number) => {
    await axios.delete(`${apiUrl}/user/permanently-delete/${id}`,
    {
      headers: {
          'Authorization': `Bearer ${accessToken}` // Set the token in the headers
      }
  }
    );
    loadList();
    setShowDeletePopup(false);
  };
  const handleDeleteClick = (itemId: number) => {
    setItemIdToDelete(itemId);
    setShowDeletePopup(true);
  };
  const handleDeleteConfirm = () => {
    itemIdToDelete && deleteItem(itemIdToDelete);
  };
  const handleDeleteCancel = () => {
    setShowDeletePopup(false);
  };


  return (
    <Container sx={{minWidth: "100%"}}>

      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <TableContainer style={{ maxHeight: "350px", overflowY: "auto"}}>
          <Table className="border shadow">
            <TableHead sx={{ backgroundColor: '#000000' }}>
              <TableRow>
                <TableCell align="center" sx={{ color: '#ffffff' }}>ID</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Name</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Role</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Email</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Phone</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Date Of Birth</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Create At</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Create By</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Update By</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}></TableCell>
              </TableRow>
            </TableHead>


            {list.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={7} align="center" style={{ fontSize: "14px" }}>
                    (Have no any record founded!)
                  </TableCell>
                </TableRow>
              </TableBody>
            ) : (
              <TableBody>
                {list.map((listItem, index) => (
                  <TableRow key={listItem.userId}>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 30 }}>{listItem.userId}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 200 }}>{`${listItem.firstName} ${listItem.lastName}`}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 30 }}>{listItem.roleEnum}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 30 }}>{listItem.email}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 30 }}>{listItem.phone}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 300 }}>{moment(listItem.dateOfBirth).format('MMMM Do YYYY, h:mm:ss a') }</TableCell>

                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 300 }}>
                      {moment(listItem.createdAt).format('MMMM Do YYYY, h:mm:ss a') }
                      </TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.createdBy}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.updatedBy}</TableCell>
                    <TableCell align="center" style={{ minWidth: 430 }}>
                      <Button
                          variant="outlined"
                          color="info"
                          sx={{ mx: 2 }}
                          onClick={() => restoreItem(listItem.userId)}
                      >
                          <RestoreIcon sx={{ marginRight: "4px", fontSize: "24px" }} />
                          Restore
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        onClick={() => handleDeleteClick(listItem.userId)}
                        sx={{ mx: 2 }}
                      >
                        <WarningIcon sx={{ marginRight: "4px", fontSize: "24px" }} />
                        Permanently Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            )}
          </Table>
        </TableContainer>
      )}

      <PaginationBar
        pagination={pagination}
        handleRowsPerPageChange={handleRowsPerPageChange}
        handlePageChange={handlePageChange}
      />

      {/* [POPUP] Confirm Permanently-Deleted */}
      {showDeletePopup && (
        <Dialog open={showDeletePopup} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
            This action cannot restore!
            Are you sure want to delete this user?
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDeleteConfirm} color="error">
              Delete
            </Button>
            <Button onClick={handleDeleteCancel}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}

    </Container>
  );
}

export default TrashUserListPage
;
