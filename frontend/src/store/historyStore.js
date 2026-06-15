import { create } from "zustand";

export const useHistoryStore = create((set) => ({
  commands: [],

  addCommand: (command) =>
    set((state) => ({
      commands: [command, ...state.commands],
    })),
}));