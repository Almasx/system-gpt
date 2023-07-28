import { PartialGoal, Score } from "~/types/goal";

import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

enableMapSet();

export type ServiceStatus =
  | "messageEnrich"
  | "calculateScore"
  | "generateSubgoals"
  | "done"
  | "error"
  | "idle";

type State = {
  goals: Map<
    string,
    PartialGoal & {
      status: ServiceStatus;
    }
  >;
};

export type UpdateGoal = (
  id: string,
  pair: { score: Score } | { context: string }
) => void;

export type UpdateGoalStatus = (id: string, status: ServiceStatus) => void;

type Actions = {
  addGoal: (goal: PartialGoal) => void;
  removeGoal: (id: string) => void;
  updateGoal: UpdateGoal;
  updateGoalStatus: UpdateGoalStatus;
};

export const useTreeStore = create(
  immer<State & Actions>((set) => ({
    goals: new Map(),
    rootGoal: null,

    addGoal: (goal) =>
      set((state) => {
        state.goals.set(goal.id, { ...goal, status: "idle" });
      }),
    updateGoal: (id, pair) =>
      set((state) => {
        const goal = state.goals.get(id)!;
        state.goals.set(id, {
          ...goal,
          meta: {
            ...goal.meta,
            ...pair,
          },
          id,
        });
      }),

    updateGoalStatus: (id, status) =>
      set((state) => {
        const goal = state.goals.get(id)!;
        state.goals.set(id, { ...goal, status });
      }),

    removeGoal: (id) =>
      set((state) => {
        state.goals.delete(id);
      }),
  }))
);

export const selectGoalById = (id: string) => (state: State) =>
  state.goals.get(id);

export const selectGoalStatus = (id: string) => (state: State) =>
  state.goals.get(id)?.status;
