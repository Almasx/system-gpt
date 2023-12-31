import { Edge, Instance, Node } from "reactflow";
import { DoneInvokeEvent, assign, createMachine } from "xstate";
import {
  getRootNode,
  saveActions,
} from "~/app/journeys/[journeyId]/stages.actions";
import {
  ActionGoal,
  PersistedGoal,
  ProcessedGoal,
  UnprocessedGoal,
} from "~/types/goal";
import { GoalContext, goalMachine } from "./goalMachine";

import { createActorContext } from "@xstate/react";
import { useTreeStatusStore } from "../hooks/useTreeStatus";
import { calculateSubnodePosition } from "../utils";

interface TreeContext {
  stack: Array<UnprocessedGoal>;
  currentGoal: UnprocessedGoal | null;
  journeyId: string;
  ui: {
    node: {
      get: Instance.GetNode<any>;
      set: Instance.SetNodes<any>;
    };
    edge: {
      set: Instance.SetEdges<any>;
    };
  };
  onGenerate: () => void;
  onGoal: () => void;
  rootDescription: string | null;
}

type TreeEvent =
  | { type: "SUBGOALS_GENERATED"; goal: ProcessedGoal }
  | { type: "INTERRUPT" };

export const treeMachine = createMachine<TreeContext, TreeEvent>({
  predictableActionArguments: true,
  initial: "idle",
  states: {
    idle: {
      invoke: {
        src: async (context) => {
          const rootNodeData = await getRootNode(context.journeyId);

          if (rootNodeData.state !== "not found") {
            return rootNodeData;
          }
        },
        onDone: [
          {
            target: "done",
            cond: (_ctx, event) => event.data.state === "done",
            actions: (context, event) => {
              populateTree(context, event);
            },
          },
          {
            target: "checkStack",
            cond: (_ctx, event) => event.data.state === "generating",
            actions: [
              assign((context, event) => {
                const unprocessedGoalStack = populateTree(context, event);

                return {
                  ...context,
                  stack: context.stack.concat(unprocessedGoalStack),
                  rootDescription: event.data.tree.description,
                };
              }),
            ],
          },

          {
            target: "checkStack",
            cond: (_ctx, event) => event.data.state === "root",
            actions: [
              (context, event) => {
                const node: Node = {
                  id: event.data.tree.id,
                  data: {
                    label: event.data.tree.topic,
                    keywords: event.data.tree.keywords,
                    description: event.data.tree.description,
                    importance: event.data.tree.importance,
                  },
                  position: {
                    x: 500,
                    y: 500,
                  },
                  type: "goal",
                };
                context.ui.node.set((nds) => nds.concat(node));
              },
              assign((context, event) => {
                return {
                  ...context,
                  stack: context.stack.concat(event.data.tree),
                  rootDescription: event.data.tree.description,
                };
              }),
            ],
          },
        ],
      },
    },

    checkStack: {
      always: [
        { target: "save", cond: (context) => context.stack.length === 0 },
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
        data: (context): GoalContext => ({
          ...(context.currentGoal as UnprocessedGoal),
          journeyId: context.journeyId,
          rootDescription: context.rootDescription!,
        }),
        onDone: {
          target: "checkStack",
          actions: [
            (context, event) => {
              const goal = event.data.goal;
              const childPosition = calculateSubnodePosition(
                context.ui.node.get(goal.id)!.position,
                goal.children.length
              );

              for (let i = 0; i < goal.children.length; i++) {
                const child = goal.children[i];

                useTreeStatusStore.getState().addGoal(child);

                const node: Node = {
                  id: child.id,
                  data: {
                    label: child.topic,
                    keywords: child.keywords,
                    description: child.description,
                    importance: child.importance,
                  },
                  position: childPosition[i],
                  type: "goal",
                };
                context.ui.node.set((nds) => nds.concat(node));

                const edge: Edge = {
                  id: `${goal.id}-${child.id}`,
                  source: goal.id,
                  target: child.id,
                };
                context.ui.edge.set((edges) => edges.concat(edge));
              }
              context.onGenerate();
            },
            assign((context, event) => {
              return {
                ...context,
                stack: context.stack.concat(event.data.goal.children),
              };
            }),
          ],
        },
      },
    },

    save: {
      invoke: {
        src: async (context) => {
          const rootNodeData = await getRootNode(context.journeyId);
          if (rootNodeData.state !== "not found") {
            const persistedStack: PersistedGoal[] = [rootNodeData.tree];
            const actionGoalStack: ActionGoal[] = [];

            while (persistedStack.length) {
              const current = persistedStack.pop() as PersistedGoal;

              const children =
                Object.keys(current.children).length > 0
                  ? (current.children as Record<string, PersistedGoal>)
                  : null;

              if (children) {
                for (const child of Object.keys(children)) {
                  persistedStack.push(children[child]);
                }
              } else {
                actionGoalStack.push({
                  ...current,
                  effort: {},
                  prerequisites: [],
                  processed: false,
                });
              }
            }

            await saveActions(context.journeyId, actionGoalStack);
          }
        },
        onDone: {
          target: "done",
          actions: (context) => {
            context.onGoal();
          },
        },
      },
    },

    done: {
      type: "final",
    },
  },
  on: {
    INTERRUPT: {
      target: ".save",
    },
  },
});

export const TreeMachineContext = createActorContext(treeMachine, {
  devTools: true,
});

const populateTree = (
  context: TreeContext,
  event: DoneInvokeEvent<{
    state: "done" | "generating";
    tree: PersistedGoal;
  }>
) => {
  const persistedStack: PersistedGoal[] = [event.data.tree];
  const unprocessedGoalStack: UnprocessedGoal[] = [];

  const edgeStack = [];
  while (persistedStack.length) {
    const current = persistedStack.pop() as PersistedGoal;
    if (current.processed === false) {
      if (!current.path) {
        console.log(current);
        continue;
      }

      unprocessedGoalStack.push({
        ...current,
        depth: current.path.split("children").length,
        meta: {
          score: {
            significance: 0,
            relevance: 0,
            complexity: 0,
          },
        },
        children: [],
      });
    }

    const node: Node = {
      id: current.id,
      data: {
        label: current.topic,
        keywords: current.keywords,
        description: current.description,
        importance: current.importance,
      },
      position: {
        x: Math.random() * 500,
        y: Math.random() * 500,
      },
      type: "goal",
    };
    context.ui.node.set((nds) => nds.concat(node));

    const children =
      Object.keys(current.children).length > 0
        ? (current.children as Record<string, PersistedGoal>)
        : null;

    if (children) {
      for (const child of Object.keys(children)) {
        edgeStack.push({
          parent: current.id,
          child: children[child].id,
        });

        persistedStack.push(children[child]);
      }
    }
  }

  for (const { parent, child } of edgeStack) {
    const edge: Edge = {
      id: `${parent}-${child}`,
      source: parent,
      target: child,
    };

    context.ui.edge.set((edges) => edges.concat(edge));
  }

  context.onGenerate();

  return unprocessedGoalStack;
};
