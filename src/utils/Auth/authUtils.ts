import { RootState } from "../../reducers";
import { clearToken, setToken } from "../../reducers/Slice/authSlice";
import { store } from "../../store";
import { jwtDecode } from "jwt-decode";
import axios from "axios";
import { apiUrl } from "../../variable/globalVariable";

interface DecodedToken {
  exp: number;
  [key: string]: any;
}

export const checkTokenAlreadyExists = (): boolean => {
  const state: RootState = store.getState();
  // console.log(!!state.auth.token)
  return !!state.auth.token; // = 'useSelector((state: RootState) => state.auth.token)'
};

export const useAuthToken = (): string | null => {
  const state: RootState = store.getState();
  return state.auth.token;
};

export const getDecodeToken = (): DecodedToken | null => {
  const state: RootState = store.getState();
  const token = state.auth.token;

  if (!token) {
    return null;
  }

  try {
    const decodedToken: DecodedToken = jwtDecode(token);
    return decodedToken;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const checkTokenIsExpired = (): boolean => {
  const rootState: RootState = store.getState();
  const token = rootState.auth.token;

  if (!token) {
    // If token doesn't exist, consider it expired
    return true;
  }

  try {
    // Decode the token to access its payload
    const decodedToken: DecodedToken = jwtDecode(token);

    if (!decodedToken || !decodedToken.exp) {
      // If the decoded token doesn't exist or doesn't have an expiration time, consider it expired
      return true;
    }

    // Get the current time in seconds
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);

    console.log("currentTimeInSeconds: ", currentTimeInSeconds);
    console.log("decodedToken.exp: ", decodedToken.exp);

    // Check if the current time is greater than the token's expiration time
    // Consider the token expired if it will expire within the next 5 minutes
    const bufferTimeInSeconds = 30; // Return The Token Is Expired Early 30 Seconds The Token Already Expired
    // return currentTimeInSeconds > decodedToken.exp; // (old code)
    return currentTimeInSeconds > (decodedToken.exp - bufferTimeInSeconds); // (new code)
  } catch (error) {
    // If there's an error decoding the token, consider it expired
    console.error("Error decoding token:", error);
    return true;
  }
};

export const removeTokenToLogout = (): void => {
  store.dispatch(clearToken());
};


export const refreshToken = async () => {
  const state: RootState = store.getState();
  const refreshTokenExisted = state.auth.refreshToken;

  if (refreshTokenExisted) {
    try {
      const response = await axios.post(`${apiUrl}/auth/refresh-token`, null, {
        headers: {
          Authorization: `Bearer ${refreshTokenExisted}`, // Set the refresh token of current access token which stored in Redux
        },
      });
      console.log("Refresh Token Response Is : ", response.data)

      const { token, refreshToken } = response.data;
      store.dispatch(setToken({ token, refreshToken }));
      console.log("Refresh OK");
      console.log("New Token: ", token);
      console.log("New Refresh Token: ", refreshToken);
    } catch (error) {
      console.log("Have error in implement refresh token !");
      store.dispatch(clearToken());
      window.location.href = "/"; // Redirect to home page
    }
  } else {
    store.dispatch(clearToken());
    window.location.href = "/"; // Redirect to home page
  }
};
