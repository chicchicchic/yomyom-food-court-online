import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  productId: string;
  quantity: number;
  // Add other properties as needed
}

interface CartState {
  cartList: CartItem[];
  cartItemCount: number
}

const initialState: CartState = {
  cartList: [],
  cartItemCount: 0
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart(state, action: PayloadAction<CartItem>) {
      const { productId } = action.payload;
      const itemIndex = state.cartList.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex >= 0) {
        state.cartList[itemIndex].quantity += 1;
      } else {
        state.cartList.push({ ...action.payload, quantity: 1 });
      }
    },
    updateQuantity(state, action: PayloadAction<{ productId: string; increment: boolean }>) {
      const { productId, increment } = action.payload;
      const itemIndex = state.cartList.findIndex(
        (item) => item.productId === productId
      );

      if (itemIndex >= 0) {
        if (increment) {
          state.cartList[itemIndex].quantity += 1;
        } else {
          state.cartList[itemIndex].quantity -= 1;
          if (state.cartList[itemIndex].quantity <= 0) {
            state.cartList.splice(itemIndex, 1);
          }
        }
      }
    },
    removeItemFromCart(state, action: PayloadAction<{ productId: string }>) {
      const { productId } = action.payload;
      const itemIndex = state.cartList.findIndex(
        (item) => item.productId === productId
      );
      if (itemIndex >= 0) {
        state.cartList.splice(itemIndex, 1);
      }
    },
    // Counting Items In The Cart
    setCartItemCount(state, action: PayloadAction<number>) {
      state.cartItemCount = action.payload;
    }
  },
});

export const {
  addToCart,
  updateQuantity,
  removeItemFromCart,
  setCartItemCount
} = cartSlice.actions;
export default cartSlice.reducer;
export type { CartState };
