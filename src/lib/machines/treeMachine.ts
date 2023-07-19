import { assign, createMachine } from "xstate";
import { goalMachine } from "./goalMachine";

import { createActorContext } from "@xstate/react";
import { Goal } from "~/types/goal";

interface TreeContext {
  stack: Array<Goal>;
  // resources: Array<Resource>;
  onGenerate: null | ((goal: Goal) => void);
}

type TreeEvent =
  | {
      type: "START";
      goal: Goal;
      onGenerate: (goal: Goal) => void;
      onRoot: (goal: Goal) => void;
    }
  | { type: "SUBGOALS_GENERATED"; goal: Goal }
  | { type: "INTERRUPT" };

export const treeMachine = createMachine<TreeContext, TreeEvent>({
  predictableActionArguments: true,
  initial: "idle",
  context: {
    stack: [],
    onGenerate: null,
  },
  states: {
    idle: {
      on: {
        START: {
          target: "checkStack",
          actions: assign((_, event) => {
            event.onRoot(event.goal);
            return {
              onGenerate: event.onGenerate,
              stack: [event.goal],
            };
          }),
        },
      },
    },

    checkStack: {
      always: [
        { target: "done", cond: (context) => context.stack.length === 0 },
        {
          target: "processGoal",
        },
      ],
    },

    processGoal: {
      invoke: {
        id: "goalMachine",
        src: goalMachine,
        data: (context) => ({ ...context.stack.shift() }),
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
