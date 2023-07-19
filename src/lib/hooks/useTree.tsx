import { enableMapSet } from "immer";
import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import { Goal } from "~/types/goal";

enableMapSet();

type State = {
  goals: Map<string, Goal>;
};

type Actions = {
  addGoal: (goal: Goal) => void;
  removeGoal: (id: string) => void;
};

export const useTreeStore = create(
  immer<State & Actions>((set) => ({
    goals: new Map(),
    addGoal: (goal: Goal) =>
      set((state) => {
        state.goals.set(goal.id, goal);
      }),
    removeGoal: (id: string) =>
      set((state) => {
        state.goals.delete(id);
      }),
  }))
);

export const selectGoalById = (id: string) => (state: State) =>
  state.goals.get(id);
