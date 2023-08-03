import { assign, createMachine, raise } from "xstate";
import { openaiChat, openaiFunctions } from "~/app/api.actions";
import {
  getRootGoalMessages,
  patchRootNodeDescription,
  saveRootGoalMessage,
  saveTreeNode,
} from "~/app/journeys/[journeyId]/stages.actions";
import { PersistedGoal, rootGoalSchema } from "~/types/goal";
import { extract_root, system_prompts } from "../constants";

import { createActorContext } from "@xstate/react";
import { patchTitle } from "~/app/journeys/journey.actions";
import { OpenAIMessage } from "~/types/message";
import { nanoid } from "../utils";

interface ChatContext {
  journeyId: string;
  chatHistory: OpenAIMessage[];
  user: {
    topic: string | null;
    onGoal: () => void;
  };
  message: string | null;
}

type ChatEvents =
  | {
      type: "SET_GOAL";
      goal: string;
      topic: string;
    }
  | {
      type: "REFACTOR_GOAL";
      message: string;
    }
  | { type: "PERSIST_GOAL" }
  | { type: "LOADING" }
  | { type: "DONE_LOADING" };

export const chatMachine = createMachine<ChatContext, ChatEvents>({
  predictableActionArguments: true,
  id: "chat",
  type: "parallel",

  states: {
    serviceStatus: {
      id: "serviceStatus",
      initial: "idle",
      states: {
        idle: {},
        loading: {},
        error: {},
      },
    },
    chatFlow: {
      initial: "checkDB",
      states: {
        checkDB: {
          invoke: {
            src: async (context) =>
              await getRootGoalMessages(context.journeyId),
            onDone: [
              {
                target: "idle",
                cond: (_ctx, event) => event.data.state === "idle",
              },
              {
                target: "waitingForMessage",
                actions: assign({
                  chatHistory: (context, event) => event.data.goalConversation,
                }),
                cond: (_ctx, event) => event.data.state === "refactor",
              },

              {
                target: "done",
                cond: (_ctx, event) => event.data.state === "done",
              },
            ],
          },
        },
        idle: {
          on: {
            SET_GOAL: {
              target: "refactorRootGoal",

              actions: [
                async (context, event) => {
                  await patchTitle({
                    journeyId: context.journeyId,
                    title: event.topic,
                  });
                },
                async (context, event) => {
                  await saveRootGoalMessage(context.journeyId, {
                    role: "system",
                    content: system_prompts.goal_conversation.message,
                  });
                  await saveRootGoalMessage(context.journeyId, {
                    role: "user",
                    content: event.goal,
                  });
                },
                assign({
                  user: (context, event) => ({
                    ...context.user,
                    topic: event.topic,
                  }),
                  chatHistory: (context, event) => [
                    ...context.chatHistory,
                    {
                      role: "user",
                      content: event.goal,
                    },
                  ],
                }),
              ],
            },
          },
        },

        waitingForMessage: {},
        refactorRootGoal: {
          entry: raise("LOADING"),
          invoke: {
            src: async (context) => {
              const message = await openaiChat(
                context.chatHistory,
                system_prompts.goal_conversation
              );
              return { role: "assistant", content: message };
            },

            onDone: {
              target: "waitingForMessage",
              actions: [
                async (context, event) => {
                  await saveRootGoalMessage(context.journeyId, event.data);
                },
                assign({
                  chatHistory: (context, event) => [
                    ...context.chatHistory,
                    event.data,
                  ],
                }),
                raise("DONE_LOADING"),
              ],
            },
            onError: {
              target: "#chat.serviceStatus.error",
              actions: assign({
                message: (_ctx, event) => event.data.message,
              }),
            },
          },
        },
        addingRootGoal: {
          invoke: {
            src: async (context) => {
              const rootGoalRaw = await openaiFunctions(
                context.chatHistory,
                [extract_root],
                { name: extract_root.name }
              );

              const rootGoal = rootGoalSchema.parse(JSON.parse(rootGoalRaw));
              const goalId = nanoid();
              const goal: PersistedGoal = {
                id: goalId,
                description: rootGoal.goal_content,
                topic: rootGoal.goal_topic,
                importance: rootGoal.goal_importance as number,
                obstacles: rootGoal.goal_obstacles,
                keywords: rootGoal.goal_keywords,
                path: goalId,
                meta: { score: null, context: null },
                processed: false,
                children: {},
                depth: 1,
              };

              await patchRootNodeDescription(
                context.journeyId,
                rootGoal.goal_content
              );

              await saveTreeNode(context.journeyId, goal);
              context.user.onGoal();
            },
            onDone: {
              target: "done",
            },
          },
        },
        done: {
          type: "final",
        },
      },

      on: {
        LOADING: "#chat.serviceStatus.loading",
        DONE_LOADING: "#chat.serviceStatus.idle",
        REFACTOR_GOAL: {
          target: ".refactorRootGoal",
          actions: [
            async (context, event) => {
              await saveRootGoalMessage(context.journeyId, {
                role: "user",
                content: event.message,
              });
            },
            assign({
              chatHistory: (context, event) => [
                ...context.chatHistory,
                {
                  role: "user",
                  content: event.message,
                },
              ],
            }),
          ],
        },
        PERSIST_GOAL: {
          target: ".addingRootGoal",
        },
      },
    },
  },
});

export const ChatMachineContext = createActorContext(chatMachine, {
  devTools: true,
});
