import React, { useState } from "react";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import SearchIcon from '@mui/icons-material/Search';
import { Button, MenuItem, Select, SelectChangeEvent, TextField } from "@mui/material";

interface SearchFormProps {
    onSearch: (searchText: string, searchType: string) => void;
  }

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [searchText, setSearchText] = useState("");
  const [searchType, setSearchType] = useState("ALL"); // Default search type

  const handleSearchTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value);
    if (e.target.value === "ALL") {
        setSearchText(""); // Clear search text if type is "ALL"
    }
  };

  const handleSearchTypeChange = (event: SelectChangeEvent<string>) => {
    setSearchText("");
    setSearchType(event.target.value);
  };

  const handleReset = () => {
    setSearchText("");
    setSearchType("ALL");
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Search Text:", searchText);
    console.log("Search Type:", searchType);
    onSearch(encodeURIComponent(searchText), searchType);
  };

  return (
    <div style={{ width: '100%', padding: 0, margin: 0, marginBottom: "2rem" }}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center' }}>
      <Button
          type="button"
          variant="contained"
          onClick={handleReset}
          sx={{
            backgroundColor: '#e0e0e0',
            color: "#000000",
            fontSize: '14px',
            marginBottom: '1rem',
            width: '100%', // Apply on mobile
            '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
              width: 'auto',
              marginRight: "1rem"
            },
          }}
        >
          <RestartAltIcon sx={{ marginRight: "2px", fontSize: '24px' }} />
          Reset
        </Button>

        <Select
          variant="outlined"
          value={searchType}
          onChange={handleSearchTypeChange}
          sx={{
            width: '100%',
            marginBottom: '8px',
            '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
              width: '35%',
              marginRight: "0.5rem"
            },
          }}
        >
          <MenuItem value="ALL">All</MenuItem>
          <MenuItem value="NAME">Firstname OR Lastname</MenuItem>
          <MenuItem value="PHONE">Phone</MenuItem>
        </Select>

        <TextField
          type={searchType === "PHONE" ? "number" : "text"}
          variant="outlined"
          label="Search..."
          value={searchText}
          onChange={handleSearchTextChange}
          disabled={searchType === "ALL"} // Disable when search type is "ALL"
          sx={{
            width: '100%',
            marginBottom: '8px',
            '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
              width: '35%',
              marginRight: "0.5rem"
            },
          }}

        />

        <Button
          type="submit"
          variant="contained"
          style={{ backgroundColor: "#7c0303", marginBottom: '1rem' }}
          sx={{
            width: '100%', // Apply on mobile
            '@media (min-width: 37.563rem)': { // Apply on tablet and destop (<= 37.563rem/601px)
              width: 'auto',
              marginRight: "0.5rem"
            },
          }}
        >
          <SearchIcon style={{ fontSize: "30px" }} />
        </Button>


      </form>
    </div>
  );
};

export default SearchForm;
