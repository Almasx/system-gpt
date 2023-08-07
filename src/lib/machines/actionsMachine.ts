import { Edge, Instance, Node } from "reactflow";
import { assign, createMachine } from "xstate";
import {
  getActions,
  patchAction,
} from "~/app/journeys/[journeyId]/stages.actions";
import { ActionGoal, ActionProcessedGoal, estimateSchema } from "~/types/goal";
import { estimate_goal, system_prompts } from "../constants";

import { createActorContext } from "@xstate/react";
import { openaiFunctions } from "~/app/api.actions";
import { useActionStatusStore } from "../hooks/useActionStatus";

interface ActionContext {
  journeyId: string;
  goals: ActionGoal[];
  currentAction: ActionGoal | null;
  ui: {
    node: {
      set: Instance.SetNodes<any>;
    };
    edge: {
      set: Instance.SetEdges<any>;
    };
  };
}

export const actionMachine = createMachine<ActionContext>({
  predictableActionArguments: true,
  initial: "checkStack",
  states: {
    checkStack: {
      always: [
        {
          target: "chunkAllocation",
          cond: (context) => context.goals.length === 0,
        },
        {
          target: "processGoal",
          actions: assign((context) => ({
            currentAction: context.goals[0],
            goals: context.goals.slice(1),
          })),
        },
      ],
    },
    processGoal: {
      invoke: {
        src: async (context) => {
          if (context.currentAction) {
            useActionStatusStore
              .getState()
              .updateActionStatus(context.currentAction.id, "estimating");

            const scoreRaw = await openaiFunctions(
              [
                {
                  role: "system",
                  content: system_prompts.estimate_goal.message,
                },
                {
                  role: "user",
                  content: `Estimate goal: """${context.currentAction?.description}"""
                          
                          Topic: "${context.currentAction?.topic}"
                          Keywords: "${context.currentAction?.keywords}"
                          Importance: "${context.currentAction?.importance}"
                          `,
                },
              ],
              [estimate_goal],
              { name: estimate_goal.name },
              system_prompts.message_enrich
            );

            const score = estimateSchema.parse(JSON.parse(scoreRaw));
            await patchAction(context.journeyId, {
              ...context.currentAction,
              prerequisites: score.prerequisites,
              effort: score.effort,
              processed: true,
            });
          }
        },
        onDone: {
          target: "checkStack",
          actions: (context) => {
            useActionStatusStore
              .getState()
              .updateActionStatus(context.currentAction!.id, "done");
          },
        },
      },
    },
    chunkAllocation: {
      invoke: {
        src: async (context) => {
          const actions = await getActions(context.journeyId);

          return allocateToChunks(
            actions.filter(
              (action) => action.processed
            ) as ActionProcessedGoal[]
          );
        },
        onDone: {
          target: "done",
          actions: (context, event) => {
            const chunks: ActionProcessedGoal[][] = event.data;
            console.log(chunks);

            const nodes: Node[] = [];
            const edges: Edge[] = [];
            let xPos = 100;
            let yPos = 100;

            chunks.forEach((chunk, index) => {
              const NODE_WIDTH =
                chunk.reduce(
                  (acc, node) =>
                    acc > node.topic.length ? acc : node.topic.length,
                  0
                ) *
                  7.59 +
                24 +
                PADDING * 2;

              const parentId = `chunk-${index}`;
              let chunkWidth = NODE_WIDTH + 2 * PADDING;
              let chunkHeight = chunk.length * NODE_HEIGHT + 2 * PADDING;

              nodes.push({
                id: parentId,
                data: {
                  label: `Chunk ${index + 1}`,
                  width: chunkWidth,
                  height: chunkHeight,
                  children: chunk,
                },
                position: { x: xPos, y: yPos },
                type: "chunk",
              });

              console.log("parrent", xPos, yPos);

              chunk.forEach((goal, goalIndex) => {
                const goalId = `goal-${index}-${goalIndex}`;

                nodes.push({
                  id: goalId,
                  data: {
                    label: goal.topic,
                    time: goal.effort.estimatedDuration,
                    score: goal.effort.storyPoints,
                  },
                  position: {
                    x: PADDING,
                    y: PADDING + NODE_HEIGHT * goalIndex,
                  },
                  parentNode: parentId,
                  type: "action",
                });
              });

              xPos += NODE_WIDTH + 120;
            });

            context.ui.node.set(nodes);
            context.ui.edge.set(edges);
          },
        },
      },
    },
    done: {},
  },
});

const NODE_HEIGHT = 87;
const PADDING = 15;

const CHUNK_CAPACITY = 40; // chunk capacity in hours
const CHUNK_STORY_POINTS = 18; // chunk capacity in story points

function allocateToChunks(goals: ActionProcessedGoal[]) {
  let chunks = [];
  let currentChunk: ActionProcessedGoal[] = [];
  let currentDuration = 0;
  let currentStoryPoints = 0;

  for (let goal of goals) {
    let goalDuration = goal.effort.estimatedDuration;
    let goalStoryPoints = goal.effort.storyPoints;

    if (
      currentDuration + goalDuration > CHUNK_CAPACITY ||
      currentStoryPoints + goalStoryPoints > CHUNK_STORY_POINTS
    ) {
      chunks.push(currentChunk);
      currentChunk = [goal];
      currentDuration = goalDuration;
      currentStoryPoints = goalStoryPoints;
    } else {
      currentChunk.push(goal);
      currentDuration += goalDuration;
      currentStoryPoints += goalStoryPoints;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export const ActionMachineContext = createActorContext(actionMachine, {
  devTools: true,
});
