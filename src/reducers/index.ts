import { combineReducers } from 'redux';
import authReducer, { AuthState } from "./Slice/authSlice";
import cartReducer, { CartState } from './Slice/cartSlice';
import userReducer, { UserState } from './Slice/userSlice';

// Define the RootState interface to describe the shape of the root state
interface RootState {
  auth: AuthState;
  user: UserState;
  cart: CartState;
  // Add other state slices as needed
}

// Combine reducers with RootState
const rootReducer = combineReducers<RootState>({
  auth: authReducer as any,
  user: userReducer as any,
  cart: cartReducer as any,
  // Add other reducers as needed
});

export default rootReducer;
export type { RootState };

