import { create } from "zustand";

export const useHistoryStore = create((set) => ({
  movimientos: [],

  setMovimientos: (movimientos) =>
    set({
      movimientos,
    }),

  addMovimiento: (movimiento) =>
    set((state) => ({
      movimientos: [...state.movimientos, movimiento],
    })),

  clearMovimientos: () =>
    set({
      movimientos: [],
    }),
}));