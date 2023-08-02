import { createMachine } from "xstate";
import { ActionGoal, ProcessedGoal } from "~/types/goal";

import { createActorContext } from "@xstate/react";

interface ActionContext {
  journeyId: string;
  goals: ActionGoal[];
}

type ActionEvent =
  | { type: "SUBGOALS_GENERATED"; goal: ProcessedGoal }
  | { type: "INTERRUPT" };

export const actionMachine = createMachine<ActionContext, ActionEvent>({
  predictableActionArguments: true,
  initial: "idle",
  states: {
    idle: {
      invoke: {
        src: async (context) => {},
      },
    },
  },
});

export const ActionMachineContext = createActorContext(actionMachine, {
  devTools: true,
});
