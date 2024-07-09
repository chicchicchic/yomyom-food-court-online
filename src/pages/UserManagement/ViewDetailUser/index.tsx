import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  CircularProgress,
  Container,
  Grid,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import { useAuthToken } from "../../../utils/Auth/authUtils";
import moment from "moment";
import Avatar from "react-avatar";



interface UserDetail {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: null;
  roleEnum: string;
  avatar: string;

  createdAt: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
}

const ViewDetailUser: React.FC = () => {
  const accessToken = useAuthToken();
  const [userDetail, setUserDetail] = useState<UserDetail | null>(null);
  const { id } = useParams();


  useEffect(() => {
    fetchUserDetail();
  }, []);
  const fetchUserDetail = async () => {
    try {
      const response = await axios.get<UserDetail>(`/user/${id}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Set the token in the headers
        },
      }); // Assuming the backend API endpoint is /dish/23
      // console.log("User Detail: ", response.data)
      setUserDetail(response.data);
    } catch (error) {
      console.error("Error fetching user detail:", error);
    }
  };

  if (!userDetail) {
    return <CircularProgress />;
  }

  return (
    <Container maxWidth="lg">
      <Typography variant="h4" align="center" gutterBottom>
        {`${userDetail.firstName} ${userDetail.lastName}`}
      </Typography>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={6} md={6} lg={6}>
          {userDetail.avatar && userDetail.avatar !== null ? (
                  <Avatar
                    alt={userDetail.firstName}
                    src={`data:image/jpeg;base64, ${userDetail.avatar}`}
                    size="340"
                    round
                  />
                ) : (
                  <Avatar
                    name={`${userDetail.firstName} ${userDetail.lastName}`}
                    size="340"
                    round
                  />
                )}
        </Grid>
        <Grid item xs={12} sm={12} md={6} lg={6}>
          <Card>
            <CardContent>
              <Typography variant="h6">
                ID: <b>{userDetail.userId}</b>
              </Typography>
              <Typography variant="h6">
                Firt Name: <b>{userDetail.firstName}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Last Name: <b>{userDetail.lastName}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Role: <b>{userDetail.roleEnum}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Email: <b>{userDetail.email}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Phone: <b>{userDetail.phone}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Date Of Birth:{" "}
                <b>
                  {moment(userDetail.dateOfBirth).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  )}
                </b>{" "}
              </Typography>
              <Typography variant="h6">
                Created At:{" "}
                <b>
                  {moment(userDetail.createdAt).format(
                    "MMMM Do YYYY, h:mm:ss a"
                  )}
                </b>{" "}
              </Typography>
              <Typography variant="h6">
                Created By: <b>{userDetail.createdBy}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Updated By: <b>{userDetail.updatedBy}</b>{" "}
              </Typography>
              <Typography variant="h6">
                Is Deleted: <b>{userDetail.isDeleted ? "Yes" : "No"}</b>{" "}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ViewDetailUser;
