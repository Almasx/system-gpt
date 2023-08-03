import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

enableMapSet();

export type ServiceStatus = "estimating" | "done" | "error" | "idle";

type State = {
  goals: Map<string, ServiceStatus>;
};

type Actions = {
  removeActionStatus: (id: string) => void;
  updateActionStatus: (id: string, status: ServiceStatus) => void;
};

export const useActionStatusStore = create(
  immer<State & Actions>((set) => ({
    goals: new Map(),

    updateActionStatus: (id, status) =>
      set((state) => {
        state.goals.set(id, status);
      }),

    removeActionStatus: (id) =>
      set((state) => {
        state.goals.delete(id);
      }),
  }))
);

export const selectActionStatus = (id: string) => (state: State) =>
  state.goals.get(id);
