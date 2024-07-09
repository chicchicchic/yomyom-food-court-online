import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  // Other initial state properties...
}

const initialState: AuthState = {
  token: null,
  refreshToken: null,
  // Other initial state properties...
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state: Draft<AuthState>, action: PayloadAction<{ token: string, refreshToken: string }>) {
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken;
    },
    clearToken(state: Draft<AuthState>) {
      state.token = null;
      state.refreshToken = null;
    },
    // Other reducer functions...
  },
});

export const { setToken, clearToken } = authSlice.actions;
export default authSlice.reducer;
export type { AuthState };