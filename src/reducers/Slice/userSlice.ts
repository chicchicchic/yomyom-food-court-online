import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Draft } from "immer";

interface UserState {
  avatar: string | null;
  // Other initial state properties...
}

const initialState: UserState = {
  avatar: "" || null,
  // Other initial state properties...
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAvatar(state: Draft<UserState>, action: PayloadAction<string>) {
      state.avatar = action.payload;
      // sessionStorage.setItem("avatar", action.payload);
    },
    clearAvatar(state: Draft<UserState>) {
      state.avatar = null;
      // sessionStorage.removeItem("avatar");
    },
    // Other reducer functions...
  },
});

export const { setAvatar, clearAvatar } = userSlice.actions;
export default userSlice.reducer;
export type { UserState };