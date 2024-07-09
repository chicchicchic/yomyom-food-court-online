import React, { useEffect, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import axios from "axios";
import { useAuthToken } from "../../../utils/Auth/authUtils";

interface FilterStatusProps {
  handleChangeSelectedStatus: (status: string) => void;
  selectedStatusDefault: string
}

const FilterStatus: React.FC<FilterStatusProps> = ({
  handleChangeSelectedStatus,
  selectedStatusDefault
}) => {
  const accessToken = useAuthToken();
  const [statuses, setStatuses] = useState<string[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>(selectedStatusDefault);

  useEffect(() => {
    fetchTypes();
  }, []);

  const fetchTypes = async () => {
    try {
      const response = await axios.get("/order/order-item-status-list", {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Set the token in the headers
        },
      });

      // console.log(response.data)
      setStatuses(response.data);
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        // Handle 404 error here
        setStatuses([]);
      } else {
        // Handle other errors
        alert(error);
      }
    }
  };

  const handleChangeStatus = (event: React.SyntheticEvent, status: string) => {
    setSelectedStatus(encodeURIComponent(status));
    handleChangeSelectedStatus(encodeURIComponent(status)); // Pass the selected category to the parent component
  };

  return (
    <Tabs
      variant="scrollable"
      scrollButtons="auto"
      aria-label="category tabs"
      value={selectedStatus}
      onChange={handleChangeStatus}
      style={{
        background: "#ffffff",
        borderBottom: "1px solid #b2b2b2",
        borderRadius: "4px",
        paddingTop: "3rem",
      }}
      sx={{
        "& .MuiTabScrollButton-root": {
          color: "#000000",
        },
        "& .css-ptiqhd-MuiSvgIcon-root": {
          // Use this selector for the SVG icon within scroll buttons
          width: "2rem", // Adjust the width of the SVG icon
          height: "2rem", // Adjust the height of the SVG icon
        },
        "& .MuiTabs-indicator": {
          backgroundColor: "rgb(124, 3, 3)", // Change the background color
          width: "50px",
          height: "3px",
          borderRadius: "10px", // Adjust the width of the indicator
        },
      }}
    >
      {statuses.map((status, index) => (
        <Tab
          sx={{ margin: "auto" }}
          key={index}
          label={status.replace(/_/g, " ")}
          value={status}
          style={{ color: "#000000", fontSize: "14px" }}
        />
      ))}
    </Tabs>
  );
};

export default FilterStatus;
