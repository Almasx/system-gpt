import { assign, createMachine, raise } from "xstate";
import { openaiChat, openaiFunctions } from "~/app/api.actions";
import { extract_root, system_prompts } from "../constants";

import { createActorContext } from "@xstate/react";
import { cacheRootGoalMessages } from "~/app/journeys/[journeyId]/goal.actions";
import { rootGoalSchema } from "~/types/goal";
import { OpenAIMessage } from "~/types/message";

interface ChatContext {
  journeyId: string | null;
  chatHistory: OpenAIMessage[];
  goal: {
    topic: string;
    description: string;
    importance: 0 | 1 | 2;
    keywords: string[];
    obstacles: string[];
  } | null;
  user: {
    topic: string | null;
    onGoal: ((rootGoal: any) => void) | null;
  };
  message: string | null;
}

type ChatEvents =
  | {
      type: "SET_GOAL";
      goal: string;
      topic: string;
      journeyId: string;
      onGoal: (rootGoal: any) => void;
    }
  | {
      type: "REFACTOR_GOAL";
      message: string;
    }
  | { type: "PERSIST_GOAL" }
  | { type: "LOADING" }
  | { type: "DONE_LOADING" };

export const chatMachine = createMachine<ChatContext, ChatEvents>(
  {
    predictableActionArguments: true,
    id: "chat",
    type: "parallel",
    context: {
      journeyId: null,
      user: {
        topic: null,
        onGoal: null,
      },
      goal: null,
      chatHistory: [
        { role: "system", content: system_prompts.goal_conversation.message },
      ],
      message: null,
    },
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
        initial: "idle",
        states: {
          idle: {
            on: {
              SET_GOAL: {
                target: "refactorRootGoal",
                actions: assign({
                  user: (context, event) => ({
                    ...context.user,
                    topic: event.topic,
                    onGoal: event.onGoal,
                    journeyId: event.journeyId,
                  }),
                  chatHistory: (context, event) => [
                    ...context.chatHistory,
                    { role: "user", content: event.goal },
                  ],
                }),
              },
            },
          },

          waitingForMessage: {},
          refactorRootGoal: {
            entry: raise("LOADING"),
            invoke: {
              src: "sendChatbotMessage",
              onDone: {
                target: "waitingForMessage",
                actions: [
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
                  message: (context, event) => event.data.message,
                }),
              },
            },
          },
          addingRootGoal: {
            invoke: {
              src: "addRootGoal",
              onDone: {
                target: "done",
                actions: assign({
                  goal: (context, event) => {
                    const goal = {
                      description: event.data.goal_content,
                      topic: event.data.goal_topic,
                      importance: event.data.goal_importance,
                      obstacles: event.data.goal_obstacles,
                      keywords: event.data.goal_keywords,
                    };
                    context.user.onGoal?.call(context.user.onGoal, goal);
                    return goal;
                  },
                }),
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
              assign({
                chatHistory: (context, event) => [
                  ...context.chatHistory,
                  { role: "user", content: event.message },
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
  },
  {
    services: {
      sendChatbotMessage: async (context) => {
        const message = await openaiChat(
          context.chatHistory,
          system_prompts.goal_conversation
        );
        await cacheRootGoalMessages(
          context.journeyId!,
          context.chatHistory,
          message
        );
        return { role: "assistant", content: message };
      },

      addRootGoal: async (context) => {
        const rootGoalRaw = await openaiFunctions(
          context.chatHistory,
          [extract_root],
          { name: extract_root.name }
        );

        const rootGoal = rootGoalSchema.parse(JSON.parse(rootGoalRaw));
        console.log(rootGoal);

        // await cache(
        //   {
        //     id: context.id,
        //     messages: context.chatHistory,
        //     title: context.user.goal!,
        //     userId: context.user.userId,
        //   },
        //   convertEventsUI(workBlocks.schedule)
        // );

        return rootGoal;
      },
    },
  }
);

export const ChatMachineContext = createActorContext(chatMachine, {
  devTools: true,
});
