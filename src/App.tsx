import React, { useEffect } from "react";
import { makeStyles } from '@mui/styles';
// When deploying a react application to GitHub Pages, you may encounter issues with routing because GitHub Pages only serves the index.html file for the root path and doesn't support client-side routing out of the box. To resolve this issue, you can use the HashRouter from react-router-dom instead of BrowserRouter. HashRouter uses the hash portion of the URL to keep the UI in sync with the URL, which works well with GitHub Pages.
import { HashRouter as Router, Route, Routes } from "react-router-dom";
// import { BrowserRouter as Router, Route, Routes } from "react-router-dom"; // (old code--)
import Header from "./CommonComponent/Header/Header";
import Footer from "./CommonComponent/Footer/Footer";
import ScrollToTopOnPageChange from "./CommonComponent/ScrollToTopOnPageChange/ScrollToTopOnPageChange";
import DishManagement from "./pages/DishManagement";
import ViewDetailDish from "./pages/DishManagement/ViewDetailDish";
import TrashDishListPage from "./pages/DishManagement/TrashDishListPage";
import { checkTokenIsExpired, refreshToken } from "./utils/Auth/authUtils";
import { useSelector } from "react-redux";
import { RootState } from "./reducers";
import UserManagement from "./pages/UserManagement";
import ViewDetailUser from "./pages/UserManagement/ViewDetailUser";
import TrashUserListPage from "./pages/UserManagement/TrashUserListPage";
import HomePage from "./pages/HomePage";
import Basket from "./pages/Basket";
import PlaceOrder from "./pages/PlaceOrder";
import OrderTracking from "./pages/OrderTracking";
import DetailOrderTracking from "./pages/DetailOrderTracking";
import UserProfile from "./pages/UserProfile";
import BreadcrumbsBar from "./CommonComponent/BreadcrumbsBar";
import OrderManagement from "./pages/OrderManagment";
import TrashOrderManagementListPage from "./pages/OrderManagment/TrashOrderManagementListPage";
import ContactUs from "./pages/ContactUs";
import ResetPassword from "./pages/Auth/ResetPassword";
import ResetPasswordSuccessfully from "./pages/Auth/ResetPassword/ResetPasswordSuccessfully";



const useStyles = makeStyles(() => ({
  contentSection: {
    paddingTop: "12.5rem",
    minHeight: "9.5rem",
    "@media (min-width: 376px)": {
      minHeight: "39.7rem",
    },
    "@media (min-width: 769px)": {
      minHeight: "17.5rem",
    },
  },
}));

function App() {
  const classes = useStyles();


  // [AUTO HANDLE] Check Token Expired Every 5 minutes
  const token = useSelector((state: RootState) => state.auth.token);
  // console.log("TOKEN IS", token);
  useEffect(() => {
    const interval = setInterval(() => {
      const isTokenExpired = checkTokenIsExpired();

      if (token != null && isTokenExpired) {
        console.log("Het hang roi")
        refreshToken()
      }
    }, 30000 ); // check every 30s

    // Cleanup interval on unmount
    return () => clearInterval(interval);
  }, [token]);


  return (
    <Router>
      {/* Header */}
      <Header />

      {/* Always go to the top of page when go to another page */}
      <ScrollToTopOnPageChange />

      {/* Content */}
      <div className={`container-fluid p-0 ${classes.contentSection}`}>

        {/* Breadcrumbs Bar */}
        <BreadcrumbsBar />

        <Routes>
          <Route path="/order-management" element={<OrderManagement />} />
          <Route path="/order-management/trash-order-list" element={<TrashOrderManagementListPage />} />
          <Route path="/dish-management/view-dish/:id" element={<ViewDetailDish />} />
          <Route path="/dish-management" element={<DishManagement />} />
          <Route path="/dish-management/trash-dish-list" element={<TrashDishListPage />} />
          <Route path="/user-management/view-user/:id" element={<ViewDetailUser />} />
          <Route path="/user-management" element={<UserManagement />} />
          <Route path="/user-management/trash-user-list" element={<TrashUserListPage />} />
          <Route path="/basket" element={<Basket />} />
          <Route path="/place-order" element={<PlaceOrder />} />
          <Route path="/order-tracking" element={<OrderTracking />} />
          <Route path="/detail-order-tracking" element={<DetailOrderTracking />} />
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/reset-password-successfully" element={<ResetPasswordSuccessfully />} />
          <Route path="/" element={<HomePage />} />
          {/* Add more routes as needed */}
        </Routes>
      </div>


      {/* Footer */}
      <Footer />
    </Router>
  );
}

export default App;
