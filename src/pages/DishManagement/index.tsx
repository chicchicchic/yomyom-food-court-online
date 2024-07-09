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
import SearchForm from "./SearchForm";
import AddNewDishForm from "./AddNewDishForm";
import UpdateDishForm from "./UpdateDishForm";
import { useAuthToken } from "../../utils/Auth/authUtils";



// Define an interface representing the structure of the data returned from the API
interface Dish {
  dishId: number;
  name: string;
  deleted: boolean;
  categoryEnum: string;
  createdAt: string;
  createdBy: string;
  discount: number;
  mealSet: string;
  image: string;
  originalPrice: number;
  preparationTime: number;
  updatedBy: string;
}

function DishManagement() {
  // const mockProducts = [
  //   { productId: 1, name: 'Product 1', price: 10.99, benefit: 'Benefit 1', description: 'Description 1', tax: 5, deleted: false },
  //   { productId: 2, name: 'Product 2', price: 15.99, benefit: 'Benefit 2', description: 'Description 2', tax: 7, deleted: false },
  //   { productId: 3, name: 'Product 3', price: 12.99, benefit: 'Benefit 3', description: 'Description 3', tax: 6, deleted: false },
  //   { productId: 4, name: 'Product 4', price: 8.99, benefit: 'Benefit 4', description: 'Description 4', tax: 4, deleted: false },
  //   { productId: 5, name: 'Product 5', price: 20.99, benefit: 'Benefit 5', description: 'Description 5', tax: 8, deleted: false },
  //   { productId: 6, name: 'Product 6', price: 18.99, benefit: 'Benefit 6', description: 'Description 6', tax: 9, deleted: false },
  //   { productId: 7, name: 'Product 7', price: 14.99, benefit: 'Benefit 7', description: 'Description 7', tax: 7, deleted: false },
  //   { productId: 8, name: 'Product 8', price: 9.99, benefit: 'Benefit 8', description: 'Description 8', tax: 5, deleted: false },
  //   { productId: 9, name: 'Product 9', price: 16.99, benefit: 'Benefit 9', description: 'Description 9', tax: 8, deleted: false },
  //   { productId: 10, name: 'Product 10', price: 22.99, benefit: 'Benefit 10', description: 'Description 10', tax: 9, deleted: false },
  //   { productId: 11, name: 'Product 11', price: 11.99, benefit: 'Benefit 11', description: 'Description 11', tax: 6, deleted: false },
  //   { productId: 12, name: 'Product 12', price: 25.99, benefit: 'Benefit 12', description: 'Description 12', tax: 8, deleted: false }
  // ];
  const accessToken = useAuthToken();
  const [list, setList] = useState<Dish[]>([]);
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
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null);



  // [Handle] Fetching Dish List
  useEffect(() => {
    loadList();
  }, [page, rowsPerPage, searchText, searchType]);

  const loadList = async () => {
    // Prevent concurrent API calls
    if (loading) return;
    setLoading(true); // Set loading state to true

    try {
      const result = await axios.get(
        `/dish?searchType=${searchType}&searchText=${searchText}&pageNumber=${pagination.page - 1}&pageSize=${pagination.rowsPerPage}`,
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

  // [Display + Handle] Soft-Delete
  const deleteItem = async (id: number) => {
    try {
      await axios.put(`/dish/soft-delete/${id}`,
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
      page: 1
    })
  };

  // [Display + Close] Adding New Dish
  const handleAddFormToggle = () => {
    setShowAddForm(!showAddForm);
  };
  const handleAddFormClose = () => {
    setShowAddForm(false);
  };

  // [Display + Close] Update Dish
  const handleUpdateFormToggle = (dishId: number) => {
    setSelectedDishId(dishId);
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
      >Dish Management</Typography>

      <hr />

      {/* Adding "container" attribute in grid parent to use Grid System and Flexbox */}
      <Grid container justifyContent="flex-end">
        <Grid item>
          <Link to="/dish-management/trash-dish-list">
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
                <TableCell align="center" sx={{ color: '#ffffff' }}>Image</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Name</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Current Price</TableCell>
                <TableCell align="center" sx={{ color: '#ffffff' }}>Category</TableCell>
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
                    colSpan={8} // because the number of columns in the table is 8
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
                  <TableRow key={listItem.dishId}>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 30 }}>{index+1}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 200 }}>
                        <CardMedia
                          component="img"
                          height="100"
                          src={`data:image/jpeg;base64, ${listItem.image}`}
                          alt={listItem.name}
                          style={{ objectFit: 'fill' }} // Types: fill, none, cover, contain, inherit
                        />
                    </TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 200 }}>{listItem.name}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>
                      <div>
                        {listItem.discount > 0 && (
                          <>
                            <span style={{ marginRight: '0.5rem' }}>
                              {`(-${listItem.discount}%)`}
                            </span>
                            <del style={{ marginRight: '0.5rem' }}>{`$${listItem.originalPrice}`}</del>
                          </>
                        )}
                        <span>
                          {`$${(listItem.originalPrice * (1 - (listItem.discount / 100))).toFixed(2)}`}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.categoryEnum}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 300 }}>
                      {moment(listItem.createdAt).format('MMMM Do YYYY, h:mm:ss a') }
                      </TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.createdBy}</TableCell>
                    <TableCell align="center"  style={{ fontSize: "14px", minWidth: 100 }}>{listItem.updatedBy}</TableCell>
                    <TableCell align="center" style={{ minWidth: 400 }}>
                      <Link to={`/dish-management/view-dish/${listItem.dishId}`} style={{ textDecoration: 'none' }}>
                        <Button variant="outlined" color="primary" sx={{ mx: 2 }}>View</Button>
                      </Link>
                      <Button
                          variant="outlined"
                          color="warning"
                          sx={{ mx: 2 }}
                          onClick={() => handleUpdateFormToggle(listItem.dishId)} // Pass the dish ID to handleUpdateFormToggle
                      >
                          Edit
                      </Button>
                      <Button variant="contained" color="error" onClick={() => handleDeleteClick(listItem.dishId)} sx={{ mx: 2 }}>Delete</Button>
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
            Are you sure want to delete this item?
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

      {/* [POPUP] Add New Dish Form */}
      <Dialog open={showAddForm} onClose={handleAddFormToggle}>
        <DialogTitle sx={{ fontSize: "2rem" ,textAlign: 'center' }}>Add New Dish</DialogTitle>
        <DialogContent sx={{
          padding: "0.8rem",
          '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
            padding: 0,
          },
        }}>
          <AddNewDishForm onClose={handleAddFormClose}/>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddFormToggle} color="secondary">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* [POPUP] Update Dish Form */}
      <Dialog open={showUpdateForm} onClose={handleUpdateFormToggle}>
        <DialogTitle sx={{ fontSize: "2rem" ,textAlign: 'center' }}>Update New Dish</DialogTitle>
        <DialogContent sx={{
          padding: "0.8rem",
          '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
            padding: 0,
          },
        }}>
          <UpdateDishForm onClose={handleUpdateFormClose} selectedDishId={selectedDishId}/>
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

export default DishManagement;
