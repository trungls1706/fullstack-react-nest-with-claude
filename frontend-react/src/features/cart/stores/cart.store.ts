import { create } from 'zustand';

interface CartState {
  cartCount: number;
  setCartCount: (count: number) => void;
  incrementCount: (by?: number) => void;
  decrementCount: (by?: number) => void;
  resetCount: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  cartCount: 0,

  setCartCount: (count) => set({ cartCount: count }),

  incrementCount: (by = 1) =>
    set((state) => ({ cartCount: state.cartCount + by })),

  decrementCount: (by = 1) =>
    set((state) => ({ cartCount: Math.max(0, state.cartCount - by) })),

  resetCount: () => set({ cartCount: 0 }),
}));
