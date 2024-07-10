import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useParams } from "react-router-dom";
import RecyclingIcon from "@mui/icons-material/Recycling";
import AddIcon from '@mui/icons-material/Add';
import moment from "moment";
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
} from "@mui/material";
import PaginationBar from "../../CommonComponent/Pagination";
import AddNewUserForm from "./AddNewUserForm";
// import UpdateDishForm from "./UpdateDishForm";
import { useAuthToken } from "../../utils/Auth/authUtils";
import SearchForm from "./SearchForm";
import UpdateUserForm from "./UpdateUserForm";
import { apiUrl } from "../../variable/globalVariable";



// Define an interface representing the structure of the data returned from the API
interface User {
  userId: number;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  dateOfBirth: null;
  roleEnum: string;
  createdAt: string;
  createdBy: string;
  updatedBy: string;
  deleted: boolean;
}

function UserManagement() {
  const accessToken = useAuthToken();
  const [list, setList] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("ALL");
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);



  // [Handle] Fetching User List
  useEffect(() => {
    loadList();
  }, [page, rowsPerPage, searchText, searchType]);

  const loadList = async () => {
    // Prevent concurrent API calls
    if (loading) return;
    setLoading(true); // Set loading state to true

    try {
      const result = await axios.get(
        `${apiUrl}/user?searchType=${searchType}&searchText=${searchText}&pageNumber=${pagination.page - 1}&pageSize=${pagination.rowsPerPage}`,
        {
          headers: {
              'Authorization': `Bearer ${accessToken}` // Set the token in the headers
          }
      }
      );
      // console.log("result", result)
      setList(result.data.content);

      // pagination
      const totalItems = result.data.totalElements;
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

  // [Display + Handle] Soft-Delete
  const deleteItem = async (id: number) => {
    try {
      await axios.put(`${apiUrl}/user/soft-delete/${id}`,
      {},
      {
        headers: {
            'Authorization': `Bearer ${accessToken}` // Set the token in the headers
        }
    });
      loadList();
      setShowDeletePopup(false);
    } catch (error) {
        // Handle error
        console.error("Error updating isDeleted:", error);
    }
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

  // [Handle] Search Submit
  const handleOnSearch = (searchText: string, searchType: string) => {
    // console.log("Parent searchText: ", searchText);
    // console.log("Parent searchType: ", searchType);

    setSearchText(searchText);
    setSearchType(searchType);

    setPagination({
        ...pagination,
        page: 1,
    });
  };

  // [Display + Close] Adding New User
  const handleAddFormToggle = () => {
    setShowAddForm(!showAddForm);
  };
  const handleAddFormClose = () => {
    setShowAddForm(false);
  };

  // [Display + Close] Update User
  const handleUpdateFormToggle = (userId: number) => {
    setSelectedUserId(userId);
    setShowUpdateForm(!showUpdateForm);
  };
  const handleUpdateFormClose = () => {
    setShowUpdateForm(false);
  };

  return (
    <Container sx={{minWidth: "100%"}}>
      <Typography
        align="center"
        variant="h5"
      >User Management</Typography>

      <hr />

      {/* Adding "container" attribute in grid parent to use Grid System and Flexbox */}
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link to="/user-management/trash-user-list">
            <Button variant="contained" sx={{backgroundColor: "#000000"}}>
              <RecyclingIcon sx={{ marginRight: "4px", fontSize: "24px" }} />
              Trash
            </Button>
          </Link>
        </Grid>
      </Grid>

      <hr />

      {/* Removing "container" attribute in grid parent to make Grid's width is full screen */}
      <SearchForm onSearch={handleOnSearch} />

      <hr />

      <Grid container justifyContent="flex-end" sx={{marginBottom: "2rem"}}>
        <Grid item>
            <Button
              variant="contained"
              color="success"
              sx={{
                borderRadius: '50%',
                padding: '8px', // Adjust padding as needed
                minWidth: '0', // Remove minimum width for proper sizing
                minHeight: '0', // Remove minimum height for proper sizing
              }}
              onClick={handleAddFormToggle}
              >
              <AddIcon sx={{ fontSize: "2.5rem" }} />
            </Button>
        </Grid>
      </Grid>

      {loading ? (
        <h1>Loading...</h1>
      ) : (
        <TableContainer style={{ maxHeight: "350px", overflowY: "auto"}}>
          <Table className="border shadow">
            <TableHead sx={{ backgroundColor: '#000000' }}>
              <TableRow>
                <TableCell align="center" sx={{ color: '#ffffff' }}>No.</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Name</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Phone</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Email</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Create At</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Create By</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Update By</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}></TableCell>
              </TableRow>
            </TableHead>


            {list.length === 0 ? (
              <TableBody>
                <TableRow>
                  <TableCell
                    colSpan={7} // because the number of columns in the table is 7
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
                  <TableRow key={listItem.userId}>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 30 }}>{index+1}</TableCell>

                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 200 }}>{`${listItem.firstName} ${listItem.lastName}`}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 200 }}>{listItem.phone}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 200 }}>{listItem.email}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 300 }}>
                      {moment(listItem.createdAt).format('MMMM Do YYYY, h:mm:ss a') }
                    </TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.createdBy}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.updatedBy}</TableCell>
                    <TableCell align="center" style={{ minWidth: 400 }}>
                      <Link to={`/user-management/view-user/${listItem.userId}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" color="primary" sx={{ mx: 2 }}>View</Button>
                      </Link>
                      <Button
                          variant="outlined"
                          color="warning"
                          sx={{ mx: 2 }}
                          onClick={() => handleUpdateFormToggle(listItem.userId)} // Pass the user ID to handleUpdateFormToggle
                      >
                          Edit
                      </Button>
                      <Button variant="contained" color="error" onClick={() => handleDeleteClick(listItem.userId)} sx={{ mx: 2 }}>Delete</Button>
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

      {/* [POPUP] Confirm Soft-Delete */}
      {showDeletePopup && (
        <Dialog open={showDeletePopup} onClose={handleDeleteCancel}>
          <DialogTitle>Confirm Delete</DialogTitle>
          <DialogContent>
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

      {/* [POPUP] Add New User Form */}
      <Dialog open={showAddForm} onClose={handleAddFormToggle}>
        <DialogTitle sx={{ fontSize: "2rem" ,textAlign: 'center' }}>Add New User</DialogTitle>
        <DialogContent sx={{
          padding: "0.8rem",
          '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
            padding: 0,
          },
        }}>
          <AddNewUserForm onClose={handleAddFormClose}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddFormToggle} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* [POPUP] Update User Form */}
      <Dialog open={showUpdateForm} onClose={handleUpdateFormToggle}>
        <DialogTitle sx={{ fontSize: "2rem" ,textAlign: 'center' }}>Update New User</DialogTitle>
        <DialogContent sx={{
          padding: "0.8rem",
          '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
            padding: 0,
          },
        }}>
          <UpdateUserForm onClose={handleUpdateFormClose} selectedUserId={selectedUserId}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUpdateForm(false)} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

    </Container>
  );
}

export default UserManagement;
