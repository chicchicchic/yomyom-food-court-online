import React from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const BreadcrumbsBar: React.FC = () => {
  const location = useLocation(); // Get the current URL path.
  const pathnames = location.pathname.split("/").filter((x) => x); // Split the current path by / and filter out any empty segments. This results in an array of path segments.
  // console.log("pathnames: ", pathnames)

  // Check if the segment can be converted to a number (["Home", "User-Detail", "3"] => ["Home", "User-Detail"])
  const filteredPathnames = pathnames.filter((x) => {
    return isNaN(Number(x));
  });
  // console.log("filteredPathnames: ", filteredPathnames)

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      sx={{
        marginLeft: "2rem",
        marginBottom: "2rem",
        fontSize: "1.2rem",
      }}
    >
      <Link component={RouterLink} to="/yomyom-food-court-online">
        Home
      </Link>

      {filteredPathnames.map((value, index) => {
        const last = index === filteredPathnames.length - 1; // A boolean indicating if the current item is the last one in the array
        const to = `/${filteredPathnames.slice(0, index + 1).join("/")}`; // The path for the current breadcrumb item, constructed by joining the segments up to the current index

        // console.log("last: ", last)
        // console.log("to: ", to)
        // console.log("value: ", value)
        // console.log("value.charAt(0).toUpperCase() + value.slice(1): ", value.charAt(0).toUpperCase() + value.slice(1))

        // The last one in Breadcrumbs (Just a text + Cannot click). Ex: Home > Basket > Payment => Payment cannot click
        return last ? (
          <Typography
            color="textPrimary"
            key={to}
            sx={{
              fontSize: "1.2rem",
            }}
          >
            {/* UpperCase the first character (Ex: basket => Basket ) */}
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Typography>
        ) : (
          <Link
            component={RouterLink}
            to={to}
            key={to}
            sx={{
              fontSize: "1.2rem",
            }}
          >
            {value.charAt(0).toUpperCase() + value.slice(1)}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};

export default BreadcrumbsBar;
