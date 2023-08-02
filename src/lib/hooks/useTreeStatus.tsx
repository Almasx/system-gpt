import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { UnprocessedGoal } from "~/types/goal";

enableMapSet();

export type ServiceStatus =
  | "messageEnrich"
  | "calculateScore"
  | "generateSubgoals"
  | "done"
  | "error"
  | "idle";

type State = {
  goals: Map<string, ServiceStatus>;
};

export type UpdateGoalStatus = (id: string, status: ServiceStatus) => void;

type Actions = {
  addGoal: (goal: Omit<UnprocessedGoal, "children" | "path">) => void;
  removeGoal: (id: string) => void;
  updateGoalStatus: UpdateGoalStatus;
};

export const useTreeStatusStore = create(
  immer<State & Actions>((set) => ({
    goals: new Map(),

    addGoal: (goal) =>
      set((state) => {
        state.goals.set(goal.id, "idle");
      }),

    updateGoalStatus: (id, status) =>
      set((state) => {
        state.goals.set(id, status);
      }),

    removeGoal: (id) =>
      set((state) => {
        state.goals.delete(id);
      }),
  }))
);

export const selectGoalStatus = (id: string) => (state: State) =>
  state.goals.get(id);
