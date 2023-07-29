import { assign, createMachine } from "xstate";
import { ProcessedGoal, UnprocessedGoal } from "~/types/goal";
import { UpdateGoal, UpdateGoalStatus } from "../hooks/useTree";

import { createActorContext } from "@xstate/react";
import { goalMachine } from "./goalMachine";

interface TreeContext {
  stack: Array<UnprocessedGoal>;
  currentGoal: UnprocessedGoal | null;
  // resources: Array<Resource>;
  onGenerate: null | ((goal: ProcessedGoal) => void);
  onUpdate: UpdateGoal | null;
  onStatusUpdate: UpdateGoalStatus | null;
}

type TreeEvent =
  | {
      type: "START";
      goal: UnprocessedGoal;
      onGenerate: (goal: ProcessedGoal) => void;
      onStatusUpdate: UpdateGoalStatus;
      onUpdate: UpdateGoal;
    }
  | { type: "SUBGOALS_GENERATED"; goal: ProcessedGoal }
  | { type: "INTERRUPT" };

export const treeMachine = createMachine<TreeContext, TreeEvent>({
  predictableActionArguments: true,
  initial: "idle",
  context: {
    stack: [],
    onGenerate: null,
    onUpdate: null,
    onStatusUpdate: null,
    currentGoal: null,
  },
  states: {
    idle: {
      on: {
        START: {
          target: "checkStack",
          actions: assign((_, event) => ({
            onGenerate: event.onGenerate,
            onUpdate: event.onUpdate,
            onStatusUpdate: event.onStatusUpdate,
            stack: [event.goal],
          })),
        },
      },
    },

    checkStack: {
      always: [
        { target: "done", cond: (context) => context.stack.length === 0 },
        {
          target: "processGoal",
          actions: assign((context) => ({
            currentGoal: context.stack.shift(), // pop the goal from stack
          })),
        },
      ],
    },

    processGoal: {
      invoke: {
        id: "goalMachine",
        src: goalMachine,
        data: (context) => ({
          update: context.onUpdate,
          statusUpdate: context.onStatusUpdate,
          ...context.currentGoal,
        }),
        onDone: {
          target: "checkStack",
          actions: assign((context, event) => {
            context.onGenerate?.call(context.onGenerate, event.data.goal);
            return {
              ...context,
              stack: context.stack.concat(event.data.goal.children),
            };
          }),
        },
      },
    },

    done: {
      type: "final",
    },
  },
  on: {
    INTERRUPT: {
      target: ".done",
    },
  },
});

export const TreeMachineContext = createActorContext(treeMachine, {
  devTools: true,
});
