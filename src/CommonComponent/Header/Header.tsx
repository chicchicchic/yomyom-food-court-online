import React, { useEffect, useState } from "react";
import { Badge, Menu, MenuItem, Typography } from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { makeStyles } from "@mui/styles";
import CloseIcon from "@mui/icons-material/Close";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import AccountBoxIcon from "@mui/icons-material/AccountBox";
import AttachEmailIcon from "@mui/icons-material/AttachEmail";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import SettingsIcon from "@mui/icons-material/Settings";
import FastfoodIcon from "@mui/icons-material/Fastfood";
import ListAltIcon from '@mui/icons-material/ListAlt';
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircle";
import Avatar from "react-avatar";
import { Link } from "react-router-dom";

import {
  checkTokenAlreadyExists,
  getDecodeToken,
  removeTokenToLogout,
  useAuthToken,
} from "../../utils/Auth/authUtils";
import RegisterForm from "../../pages/Auth/RegisterForm/RegisterForm";
import SignInForm from "../../pages/Auth/SignInForm/SignInForm";
import axios from "axios";
import { useSelector } from "react-redux";
import { RootState } from "../../reducers";
import { useDispatch } from "react-redux";
import { setCartItemCount } from "../../reducers/Slice/cartSlice";
import { clearAvatar, setAvatar } from "../../reducers/Slice/userSlice";

const useStyles: any = makeStyles(() => ({
  // Whole header
  appBar: {
    backgroundImage: 'url("./images/Header/header-background.jpg")',
    backgroundSize: "cover",
    height: "12rem",
    minHeight: "10rem",
    opacity: "100%",
    borderBottomRightRadius: "100px 60px",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000, // Ensure the header stays on top
  },
  // Left side
  leftGroup: {
    display: "flex",
    alignItems: "center",
    flexGrow: 1,
    marginLeft: "0rem",
    color: "#ffffff",
    "@media (max-width: 375px)": {
      marginRight: "6rem",
    },
  },
  logo: {
    width: "48px",
    height: "32px",
    marginRight: "4px",
  },
  // Right side
  buttonGroupMobile: {
    display: "flex",
    "@media (min-width: 376px)": {
      display: "none",
    },
  },
  buttonGroupDestop: {
    display: "none",
    position: "absolute",
    top: "2rem",
    right: "3rem",
    "@media (min-width: 376px)": {
      display: "flex",
    },
  },
  buttonNav: {
    fontFamily:
      "'Inter Grab Web', 'Apple System', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica,'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'",
    color: "black",
    backgroundColor: "white",
    borderRadius: "4px",
  },
  // Drawer section (mobile screen)
  drawerContainer: {
    width: "100%",
    // height: "50%",
    maxWidth: "250px",
    // maxHeight: "250px",
  },
  listItemMobileDrawerContent: {
    textDecoration: "none",
    color: "black",
    fontSize: "18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start", // Center the content within the ListItem
    width: "100%",
    padding: "8px 16px",
    boxSizing: "border-box",
  },
  closeButton: {
    textAlign: "right",
    padding: "1rem",
  },
  horizontalLine: {
    width: "100%",
    height: "1px",
    backgroundColor: "#e7e9eb",
    border: "none",
    margin: "1rem 0",
  },
}));

interface UserDetail {
  userId: number;
  firstName: string;
  lastName: string;
  avatar: string | null;
}

const Header = () => {
  const isLogin = checkTokenAlreadyExists();
  // console.log(isLogin ? 'Token is set' : 'Token is not set');
  const accessToken = useAuthToken();
  const decodeToken = getDecodeToken();
  let userRole: string | null = null;
  let userEmail: string | null = null;

  if (decodeToken) {
    userRole = decodeToken.role;
    userEmail = decodeToken.sub;
    // console.log("userRole", userRole);
  }

  const [customerInfo, setCustomerInfo] = useState<UserDetail>({
    userId: 0,
    firstName: "",
    lastName: "",
    avatar: null,
  });

  const classes = useStyles();
  const dispatch = useDispatch();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl2, setAnchorEl2] = useState(null);
  const [isRegisterFormOpen, setIsRegisterFormOpen] = useState(false);
  const [isSignInFormOpen, setIsSignInFormOpen] = useState(false);
  const basketItemCount = useSelector(
    (state: RootState) => state.cart.cartItemCount
  );
  const avatar = useSelector((state: RootState) => state.user.avatar);
  // console.log("Avatar From Redux: ", avatar)

  // [Handle] Fetch User's Detail From User Email;
  useEffect(() => {
    if (accessToken) {
      if (userEmail !== null || userEmail === "") {
        fetchDetailByEmail(userEmail);
      }
    }
  }, [accessToken]);
  const fetchDetailByEmail = async (email: string) => {
    try {
      const response = await axios.get(`/user/find-by-email`, {
        params: { email },
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("User Details Basket:", response.data);
      if (response.data) {
        setCustomerInfo(response.data);

        if (response.data.userId !== 0) {
          // console.log("User Id: ", response.data.userId);
          fetchBasketItemCount(response.data.userId);
        }

        if (response.data.avatar) {
          // console.log("Detail User Avatar is: ", response.data.avatar)
          dispatch(setAvatar(response.data.avatar));
        }
      }
    } catch (error) {
      console.error("Error fetching User detail by email:", error);
    }
  };
  const fetchBasketItemCount = async (userId: number) => {
    try {
      const response = await axios.get(`/basket/count-all-items/${userId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      // console.log("Count Items In Basket: ", response.data)
      if (response.data) {
        dispatch(setCartItemCount(response.data)); // Dispatch action to set count in Redux
      } else if (response.data === 0) {
        dispatch(setCartItemCount(0)); // Dispatch action to set count in Redux
      }
    } catch (error) {
      console.error("Error fetching basket item count:", error);
    }
  };

  // [Display/Close] Side Bar
  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  // [Display/Close] User Dropdown
  const handleMenuOpenDropdownUser = (event: any) => {
    setAnchorEl2(event.currentTarget);
  };
  const handleMenuCloseDropdownUser = () => {
    setAnchorEl2(null);
  };

  // [Display/Close] Register Form
  const handleRegisterFormOpen = () => {
    setIsRegisterFormOpen(true);
  };
  const handleRegisterFormClose = () => {
    setIsRegisterFormOpen(false);
    setDrawerOpen(false);
  };

  // [Display/Close] Sign In Form
  const handleSignInFormOpen = () => {
    setIsSignInFormOpen(true);
  };
  const handleSignInFormClose = () => {
    setIsSignInFormOpen(false);
    setDrawerOpen(false);
  };

  // [Handle] Logout On Destop/Tablet
  const handleLogout = async () => {
    try {
      // await persistor.purge(); // Clear the persisted state // Reset the persisted state upon logout
      // await axios.post("/user/logout")
      // sessionStorage.removeItem("token");
      await removeTokenToLogout();
      await dispatch(setCartItemCount(0)); // Dispatch action to set count in Redux
      await dispatch(clearAvatar());
      window.location.href = "/";
    } catch (error) {
      alert("Logout Error is: " + error);
    }
  };

  // [Handle] Logout On Mobile
  const handleLogoutMobile = async () => {
    try {
      // await persistor.purge(); // Clear the persisted state // Reset the persisted state upon logout
      // await axios.post("/user/logout")
      // sessionStorage.removeItem("token");
      await removeTokenToLogout();
      await dispatch(setCartItemCount(0)); // Dispatch action to set count in Redux
      await dispatch(clearAvatar());
      await setDrawerOpen(false);
      window.location.href = "/";
    } catch (error) {
      alert("Logout Error is: " + error);
    }
  };

  return (
    <div>
      {/* Header */}
      <AppBar position="fixed" className={classes.appBar}>
        <Toolbar>
          <Link to="/" style={{ textDecoration: "none" }}>
            <div className={classes.leftGroup}>
              <img
                src="/images/Header/logoApp.png"
                alt="Logo"
                className={classes.logo}
              />
              <h3>YomYom</h3>
            </div>
          </Link>

          {/* [MENU] For Mobile (Hamburger Button) */}
          <div className={classes.buttonGroupMobile}>
            {isLogin && (
              <>
                <Link
                  to="/basket"
                  style={{
                    textDecoration: "none",
                    color: "#000000",
                    marginRight: "2rem",
                    backgroundColor: "white",
                    padding: "6px 6px",
                    borderRadius: "50%",
                  }}
                >
                  <Badge
                    badgeContent={
                      basketItemCount > 0 ? `${basketItemCount}` : null
                    }
                    color="primary"
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <IconButton sx={{ color: "#000000" }}>
                      <ShoppingCartIcon fontSize="medium" />
                    </IconButton>
                  </Badge>
                </Link>
              </>
            )}

            <IconButton
              edge="end"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer}
              style={{ ...(!isLogin ? { marginLeft: "5rem" } : {}) }}
            >
              <MenuIcon />
            </IconButton>
          </div>

          {/* Login and Sign Up Buttons OR Logged In Menu for Tablet/Desktop */}
          <div className={classes.buttonGroupDestop}>
            {!isLogin ? (
              <>
                <div
                  className={classes.buttonNav}
                  style={{ marginRight: "1rem" }}
                >
                  <Button color="inherit" onClick={handleSignInFormOpen}>
                    Login
                  </Button>
                </div>
                <div className={classes.buttonNav}>
                  <Button color="inherit" onClick={handleRegisterFormOpen}>
                    Sign Up
                  </Button>
                </div>
              </>
            ) : (
              <div className="col-3">
                {/* [MENU] For Tablet/Destop */}
                <Link
                  to="/basket"
                  style={{
                    textDecoration: "none",
                    color: "#000000",
                    marginRight: "2rem",
                    backgroundColor: "white",
                    padding: "14px 6px",
                    borderRadius: "50%",
                  }}
                >
                  <Badge
                    badgeContent={
                      basketItemCount > 0 ? `${basketItemCount}` : null
                    }
                    color="primary"
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "left",
                    }}
                  >
                    <IconButton sx={{ color: "#000000" }}>
                      <ShoppingCartIcon fontSize="medium" />
                    </IconButton>
                  </Badge>
                </Link>

                <IconButton
                  onClick={handleMenuOpenDropdownUser}
                  sx={{
                    color: "white",
                    backgroundColor: "white",
                    padding: "5px 10px",
                    borderRadius: "8px",
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#000000",
                      marginRight: 1,
                    }}
                    className=""
                  >
                    <span style={{ fontSize: "14px", fontWeight: 600 }}>
                      Welcome, {customerInfo.firstName || "default name"}
                    </span>
                  </Typography>

                  {avatar && avatar !== null ? (
                    <Avatar
                      alt={customerInfo.firstName}
                      src={`data:image/jpeg;base64, ${avatar}`}
                      size="40"
                      round
                      className={classes.avatar}
                    />
                  ) : (
                    <Avatar
                      size="40"
                      round={true}
                      name={
                        `${customerInfo.firstName} ${customerInfo.lastName}` ||
                        "default name"
                      }
                      alt={
                        `${customerInfo.firstName} ${customerInfo.lastName}` ||
                        "default name"
                      }
                    />
                  )}
                </IconButton>

                {/* [DROPDOWN] Tab "Menu" Dropdown (Tablet/Destop) */}
                <Menu
                  id="user-menu"
                  anchorEl={anchorEl2}
                  open={Boolean(anchorEl2)}
                  onClose={handleMenuCloseDropdownUser}
                  sx={{
                    marginTop: "0.04rem",
                  }}
                >
                  <MenuItem
                    onClick={handleMenuCloseDropdownUser}
                    sx={{ padding: "0rem 0.4rem" }}
                  >
                    <Link
                      to="/user-profile"
                      style={{
                        textDecoration: "none",
                        color: "black",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "8px 16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <AccountBoxIcon
                        fontSize="large"
                        sx={{ marginRight: "8px" }}
                      />
                      Profile
                    </Link>
                  </MenuItem>

                  <MenuItem
                    onClick={handleMenuCloseDropdownUser}
                    sx={{ padding: "0rem 0.4rem" }}
                  >
                    <Link
                      to="/contact-us"
                      style={{
                        textDecoration: "none",
                        color: "black",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "8px 16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <AttachEmailIcon
                        fontSize="large"
                        sx={{ marginRight: "8px" }}
                      />
                      Contact Us
                    </Link>
                  </MenuItem>

                  {userRole != null && userRole === "ROLE_MANAGER" && (
                    <div>
                      <hr />

                      <MenuItem
                        onClick={handleMenuCloseDropdownUser}
                        sx={{ padding: "0rem 0.4rem" }}
                      >
                        <Link
                          to="/order-management"
                          style={{
                            textDecoration: "none",
                            color: "black",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            padding: "8px 16px",
                            boxSizing: "border-box",
                          }}
                        >
                          <ListAltIcon
                            fontSize="large"
                            sx={{ marginRight: "8px" }}
                          />
                          Order Management
                        </Link>
                      </MenuItem>

                      <MenuItem
                        onClick={handleMenuCloseDropdownUser}
                        sx={{ padding: "0rem 0.4rem" }}
                      >
                        <Link
                          to="/dish-management"
                          style={{
                            textDecoration: "none",
                            color: "black",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            padding: "8px 16px",
                            boxSizing: "border-box",
                          }}
                        >
                          <FastfoodIcon
                            fontSize="large"
                            sx={{ marginRight: "8px" }}
                          />
                          Dish Management
                        </Link>
                      </MenuItem>

                    </div>
                  )}

                  {userRole != null && userRole === "ROLE_ADMIN" && (
                    <div>
                      <hr />
                      <MenuItem
                        onClick={handleMenuCloseDropdownUser}
                        sx={{ padding: "0rem 0.4rem" }}
                      >
                        <Link
                          to="/user-management"
                          style={{
                            textDecoration: "none",
                            color: "black",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            width: "100%",
                            padding: "8px 16px",
                            boxSizing: "border-box",
                          }}
                        >
                          <SupervisedUserCircleIcon
                            fontSize="large"
                            sx={{ marginRight: "8px" }}
                          />
                          User Management
                        </Link>
                      </MenuItem>
                    </div>
                  )}

                  <hr />

                  <MenuItem
                    onClick={handleMenuCloseDropdownUser}
                    sx={{ padding: "0rem 0.4rem" }}
                  >
                    <Link
                      to="/settings"
                      style={{
                        textDecoration: "none",
                        color: "black",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "8px 16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <SettingsIcon
                        fontSize="large"
                        sx={{ marginRight: "8px" }}
                      />
                      Settings
                    </Link>
                  </MenuItem>

                  <hr />

                  <MenuItem
                    onClick={handleMenuCloseDropdownUser}
                    sx={{ padding: "0rem 0.4rem" }}
                  >
                    <Button
                      onClick={handleLogout}
                      style={{
                        textDecoration: "none",
                        color: "black",
                        fontSize: "12px",
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        padding: "8px 16px",
                        boxSizing: "border-box",
                      }}
                    >
                      <ExitToAppIcon
                        fontSize="large"
                        sx={{ marginRight: "8px" }}
                      />
                      Logout
                    </Button>
                  </MenuItem>
                </Menu>
              </div>
            )}
          </div>
        </Toolbar>

        {/* [DRAWER] Drawer Container In Mobile */}
        <Drawer
          anchor="top"
          open={drawerOpen}
          onClose={toggleDrawer}
          className={classes.drawerContainer}
        >
          <div className={classes.closeButton}>
            <IconButton
              edge="end"
              color="inherit"
              aria-label="close"
              onClick={toggleDrawer}
            >
              <CloseIcon />
            </IconButton>
          </div>

          <List>
            {isLogin && (
              <ListItem>

                {avatar && avatar !== null ? (
                  <Avatar
                    alt={customerInfo.firstName}
                    src={`data:image/jpeg;base64, ${avatar}`}
                    size="60"
                    round
                    className={classes.avatar}
                  />
                ) : (
                  <Avatar
                    size="40"
                    round={true}
                    name={
                      `${customerInfo.firstName} ${customerInfo.lastName}` ||
                      "default name"
                    }
                    alt={
                      `${customerInfo.firstName} ${customerInfo.lastName}` ||
                      "default name"
                    }
                  />
                )}

                <Typography variant="h5" sx={{
                  marginLeft: "1rem"
                }}>
                  Hi,{" "}
                  <b>
                    {customerInfo.firstName
                      ? customerInfo.firstName
                      : "default name"}
                  </b>
                </Typography>
              </ListItem>
            )}

            {!isLogin ? (
              <>
                <ListItem>
                  <Typography variant="h5">^_^ Welcome</Typography>
                </ListItem>

                <div className={classes.horizontalLine}></div>

                <ListItem>
                  <Button
                    onClick={handleSignInFormOpen}
                    style={{
                      textDecoration: "none",
                      color: "black",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 16px",
                      boxSizing: "border-box",
                    }}
                  >
                    <ExitToAppIcon
                      fontSize="large"
                      sx={{ marginRight: "8px" }}
                    />
                    Sign In
                  </Button>
                </ListItem>

                <ListItem>
                  <Button
                    onClick={handleRegisterFormOpen}
                    style={{
                      textDecoration: "none",
                      color: "black",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 16px",
                      boxSizing: "border-box",
                    }}
                  >
                    <ExitToAppIcon
                      fontSize="large"
                      sx={{ marginRight: "8px" }}
                    />
                    Sign Up
                  </Button>
                </ListItem>
              </>
            ) : (
              <>
                <div className={classes.horizontalLine}></div>

                <ListItem onClick={() => setDrawerOpen(false)}>
                  <Link
                    to="/user-profile"
                    className={classes.listItemMobileDrawerContent}
                  >
                    <AccountBoxIcon
                      fontSize="large"
                      sx={{ marginRight: "8px" }}
                    />
                    Profile
                  </Link>
                </ListItem>

                <ListItem onClick={() => setDrawerOpen(false)}>
                  <Link
                    to="/contact-us"
                    className={classes.listItemMobileDrawerContent}
                  >
                    <AttachEmailIcon
                      fontSize="large"
                      sx={{ marginRight: "8px" }}
                    />
                    Contact Us
                  </Link>
                </ListItem>

                {userRole != null && userRole === "ROLE_MANAGER" && (
                  <>
                    <div className={classes.horizontalLine}></div>

                    <ListItem onClick={() => setDrawerOpen(false)}>
                      <Link
                        to="/order-management"
                        className={classes.listItemMobileDrawerContent}
                      >
                        <ListAltIcon
                          fontSize="large"
                          sx={{ marginRight: "8px" }}
                        />
                        Order Management
                      </Link>
                    </ListItem>

                    <ListItem onClick={() => setDrawerOpen(false)}>
                      <Link
                        to="/dish-management"
                        className={classes.listItemMobileDrawerContent}
                      >
                        <FastfoodIcon
                          fontSize="large"
                          sx={{ marginRight: "8px" }}
                        />
                        Dish Management
                      </Link>
                    </ListItem>
                  </>
                )}

                {userRole != null && userRole === "ROLE_ADMIN" && (
                  <>
                    <div className={classes.horizontalLine}></div>

                    <ListItem onClick={() => setDrawerOpen(false)}>
                      <Link
                        to="/user-management"
                        className={classes.listItemMobileDrawerContent}
                      >
                        <SupervisedUserCircleIcon
                          fontSize="large"
                          sx={{ marginRight: "8px" }}
                        />
                        User Management
                      </Link>
                    </ListItem>
                  </>
                )}

                <div className={classes.horizontalLine}></div>

                <ListItem onClick={() => setDrawerOpen(false)}>
                  <Link
                    to="/settings"
                    className={classes.listItemMobileDrawerContent}
                  >
                    <SettingsIcon
                      fontSize="large"
                      sx={{ marginRight: "8px" }}
                    />
                    Settings
                  </Link>
                </ListItem>

                <div className={classes.horizontalLine}></div>

                <ListItem>
                  <Button
                    onClick={handleLogoutMobile}
                    style={{
                      textDecoration: "none",
                      color: "black",
                      fontSize: "12px",
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                      padding: "8px 16px",
                      boxSizing: "border-box",
                    }}
                  >
                    <ExitToAppIcon
                      fontSize="large"
                      sx={{ marginRight: "8px" }}
                    />
                    Logout
                  </Button>
                </ListItem>
              </>
            )}

            {/* Add other tabs as needed */}
          </List>
        </Drawer>
      </AppBar>

      {/* Register Form */}
      <RegisterForm
        open={isRegisterFormOpen}
        onClose={handleRegisterFormClose}
      />
      {/* Sign In Form */}
      <SignInForm open={isSignInFormOpen} onClose={handleSignInFormClose} />
    </div>
  );
};

export default Header;

// [Warning]: You must create and export Header to avoid this error:
// webpack compiled successfully
// ERROR in src/CommonComponent/Header/Header.tsx
// TS1208: 'Header.tsx' cannot be compiled under '--isolatedModules' because it is considered a global script file. Add an import, export, or an empty 'export {}' statement to make it a module.
