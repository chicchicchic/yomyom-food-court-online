import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import axios from "axios";
import { useAuthToken } from "../../../utils/Auth/authUtils";


interface FilterCategoryProps {
  handleChangeSelectedCategory: (category: string) => void;
}


const FilterCategory: React.FC<FilterCategoryProps> = ({ handleChangeSelectedCategory }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("MAIN_COURSES");
  const apiUrl = process.env.REACT_APP_API_URL;
  const accessToken = useAuthToken();


  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/dish/category-list`);

      // console.log(response.data)
      setCategories(response.data);
    } catch (error: any) {
        if (error.response && error.response.status === 404) {
          // Handle 404 error here
          setCategories([]);
        } else {
          // Handle other errors
          // alert(error);
          console.log("error: ", error)
        }
    }
  }

  const handleChangeCategory = (event: React.SyntheticEvent, category: string) => {
    setSelectedCategory(encodeURIComponent(category));
    handleChangeSelectedCategory(encodeURIComponent(category)); // Pass the selected category to the parent component
  };

  return (
    <Tabs
      variant="scrollable"
      scrollButtons="auto"
      aria-label="category tabs"
      value={selectedCategory}
      onChange={handleChangeCategory}
      style={{
         background: "#ffffff", borderBottom: "1px solid #b2b2b2", borderRadius: "4px", paddingTop: "3rem" }}
      sx={{
        "& .MuiTabScrollButton-root": {
          color: "#000000",
        },
        "& .css-ptiqhd-MuiSvgIcon-root": { // Use this selector for the SVG icon within scroll buttons
          width: "2rem", // Adjust the width of the SVG icon
          height: "2rem", // Adjust the height of the SVG icon
        },
        '& .MuiTabs-indicator': {
          backgroundColor: 'rgb(124, 3, 3)', // Change the background color
          width: '50px',
          height: '3px',
          borderRadius: "10px" // Adjust the width of the indicator
        },
      }}
    >
      {categories.map((category, index) => (
        <Tab sx={{margin: "auto"}} key={index} label={category.replace(/_/g, ' ')} value={category} style={{ color: "#000000", fontSize: "14px" }} />
      ))}
    </Tabs>
  );
}

export default FilterCategory;
