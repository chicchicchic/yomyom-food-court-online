import React from "react";
import {
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from "@mui/material";
import { makeStyles } from "@mui/styles";

interface PaginationProps {
    pagination: {
      rowsPerPage: number;
      totalPages: number;
      page: number;
    };
    handleRowsPerPageChange: (event: SelectChangeEvent<number>, child: React.ReactNode) => void;
    handlePageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  }

const useStyles = makeStyles({
  paginationContainer: {
    marginTop: "2rem",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  dropdownRowPerPageLabel: {
    marginRight: "1rem",
  },
  dropdownRowPerPage: {
    marginRight: "3rem",
  },
});

const PaginationBar: React.FC<PaginationProps> = ({
  pagination,
  handleRowsPerPageChange,
  handlePageChange,
}) => {
  const classes = useStyles();

  return (
    <div className={classes.paginationContainer}>
      {/* Dropdown menu for rows per page */}
     
      <FormControl className={classes.dropdownRowPerPage}>
        <Select
          labelId="rows-per-page-label"
          id="rows-per-page"
          value={pagination.rowsPerPage}
          onChange={handleRowsPerPageChange}
        >
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={10}>10</MenuItem>
          <MenuItem value={20}>20</MenuItem>
        </Select>
      </FormControl>

      {/* Pagination */}
      <Pagination
        count={pagination.totalPages} // Total number of pages
        page={pagination.page} // Current page
        onChange={handlePageChange} // Event handler for page change
        variant="outlined"
        shape="rounded"
      />
    </div>
  );
};

export default PaginationBar;
