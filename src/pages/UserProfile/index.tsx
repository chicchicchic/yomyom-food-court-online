import { Container, Grid, Paper, Typography, Button } from "@mui/material";
import { makeStyles } from "@mui/styles";
import React, { useEffect, useState, ChangeEvent } from "react";
import { getDecodeToken, useAuthToken } from "../../utils/Auth/authUtils";
import axios from "axios";
import Avatar from "react-avatar";
import moment from "moment";
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import HourglassTopIcon from '@mui/icons-material/HourglassTop';
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setAvatar } from "../../reducers/Slice/userSlice";
import { RootState } from "../../reducers";
import { useSelector } from "react-redux";
import { apiUrl } from "../../variable/globalVariable";

const useStyles = makeStyles({
  root: {
    flexGrow: 1,
  },
  avatarImage: {
    position: "relative",
    width: "200px",
    height: "200px",
    borderRadius: "50%",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  avatar: {
    marginBottom: "1rem",
  },
  inputFile: {
    display: "none",
  },
  avatarBtn: {
    width: "200px",
    height: "200px",
    top: 0,
    position: "absolute",
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
    opacity: 0,
    transition: "0.6s",
    borderRadius: "50%",

    "&:hover": {
      opacity: 1,
    },
  },
  userInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  userInfoItem: {
    display: "flex",
    alignItems: "center",
  },
});

interface UserDetail {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string | null;
  roleEnum: string;
  avatar: string | null;

  createdAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

function UserProfile() {
  const accessToken = useAuthToken();
  const decodeToken = getDecodeToken();
  let userEmail: string | null = null;
  if (decodeToken) {
    userEmail = decodeToken.sub;
  }

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const classes = useStyles();
  const [userInfo, setUserInfo] = useState<UserDetail>();
  const avatar = useSelector((state: RootState) => state.user.avatar);
  // console.log("Avatar From Redux: ", avatar)

  // [Handle] Fetch User Information
  useEffect(() => {
    if (userEmail !== null || userEmail === "") {
      fetchUserDetail(userEmail);
    }
  }, [userEmail]);
  const fetchUserDetail = async (email: string) => {
    try {
      const response = await axios.get(`${apiUrl}/user/find-by-email`, {
        params: { email },
        headers: {
          Authorization: `Bearer ${accessToken}`
        },
      });
      console.log("User Info: ", response.data);

      if (response.data) {
        console.log("User Info: ", response.data);
        setUserInfo(response.data);
      }
    } catch (error) {
      console.error("Error fetching User detail by email:", error);
    }
  };

  // [Handle] Mask The Phone Number
  const maskPhoneNumber = (phone: string) => {
    if (phone.length < 6) return phone; // Return as is if too short to mask
    const maskedPart = phone.slice(2, -2).replace(/./g, "*");
    return phone.slice(0, 2) + maskedPart + phone.slice(-2);
  };

  // [Handle] Navigate Order Tracking
  const handleNavigateOrderTracking = () => {
    if(userInfo) {
      navigate("/order-tracking",
        {
          state: {
            userId: userInfo.userId,
            userFirstName: userInfo.firstName,
            userEmail: userInfo.email,
            shippingAddress: "",
            shippingPhone: "",
          }
        }
      );
    }
  }

  // [Handle] Navigate Detail Order Tracking
  const handleNavigateDetailOrderTracking = (status: string) => {
    if(userInfo) {
      navigate("/detail-order-tracking", {
        state: {
          userId: userInfo.userId,
          orderStatus: status,
        },
      });
    }
  }

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("email", userEmail!);

      try {
        const response = await axios.post(`${apiUrl}/user/upload-avatar`, formData, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "multipart/form-data"
          },
        });

        if (response.data.avatar) {
          // console.log("Avatar is: ", response.data.avatar)
          dispatch(setAvatar(response.data.avatar));
        }

        console.log("WOWWWWWWWW AVATAR CHANGED !!!")

        // ADD To User Slide HERE
      } catch (error) {
        console.error("Error uploading avatar:", error);
      }
    }
  };


  return (
    <>
      {!userInfo ? (
        <React.Fragment>
          <Typography variant="h5">
            Waiting for user information available!
          </Typography>
        </React.Fragment>
      ) : (
        <Container maxWidth={false}>
          {/* [PAPER] Related User Info */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              {/* [SECTION] Avatar, Change Avatar */}
              <Grid item xs={12} sm={6} md={6} lg={6} className={classes.avatarImage}>
                {avatar && avatar !== null ? (
                  <Avatar
                    alt={userInfo.firstName}
                    src={`data:image/jpeg;base64, ${avatar}`}
                    size="200"
                    round
                    className={classes.avatar}
                  />
                ) : (
                  <Avatar
                    name={`${userInfo.firstName} ${userInfo.lastName}`}
                    size="200"
                    round
                    className={classes.avatar}
                  />
                )}

                {/* Change Avatar Button */}
                <div className={classes.avatarBtn}>
                  <input
                    id="contained-button-file"
                    className={classes.inputFile}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="contained-button-file">
                    <Button
                      variant="outlined"
                      sx={{
                        color: "#ffffff",
                        borderColor: "#ffffff",
                        "&:hover": {
                          color: "#000000",
                          borderColor: "#000000",
                          backgroundColor: "#ffffff",
                        },
                      }}
                      component="span"
                    >
                      Change Avatar
                    </Button>
                  </label>
                </div>
              </Grid>

              {/* [SECTION] User Information */}
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <div className={classes.userInfo}>
                  <div className={classes.userInfoItem}>
                    <Typography
                      sx={{ fontSize: "2rem" }}
                    >{`${userInfo.firstName} ${userInfo.lastName}`}</Typography>
                  </div>

                  <div className={classes.userInfoItem}>
                    <Typography>
                      Phone: {maskPhoneNumber(userInfo.phone)}
                    </Typography>
                  </div>

                  <div className={classes.userInfoItem}>
                    <Typography>
                      Date of Birth:{" "}
                      {moment(userInfo.dateOfBirth || "N/A").format(
                        "MMMM Do YYYY"
                      )}
                    </Typography>
                  </div>
                </div>
              </Grid>
            </Grid>
          </Paper>

          {/* [PAPER] Related User Actions */}
          <Paper elevation={3} sx={{ padding: 3, marginBottom: 3 }}>
            <Grid
              container
              spacing={2}
              justifyContent="center"
              alignItems="center"
            >
              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  onClick={handleNavigateOrderTracking}
                  sx={{
                    "&:hover": {
                      backgroundColor: "primary.main",
                      color: "white",
                    },
                  }}
                >
                  <LocalShippingIcon fontSize="large" sx={{marginRight: "1rem"}} />
                  Order Tracking
                </Button>
              </Grid>

              <Grid item xs={12} sm={6} md={6} lg={6}>
                <Button
                  variant="outlined"
                  color="secondary"
                  fullWidth
                  onClick={() => handleNavigateDetailOrderTracking("COMPLETED")}
                  sx={{
                    "&:hover": {
                      backgroundColor: "secondary.main",
                      color: "white",
                    },
                  }}
                >
                  <HourglassTopIcon fontSize="large" sx={{marginRight: "1rem"}} />
                  History Purchases
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      )}
    </>
  );
}

export default UserProfile;
