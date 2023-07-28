import { assign, createMachine, raise } from "xstate";
import {
  cacheRootGoalConveration,
  openaiChat,
  openaiFunctions,
} from "~/app/api.actions";
import { extract_root, system_prompts } from "../constants";

import { createActorContext } from "@xstate/react";
import { nanoid } from "nanoid";
import { rootGoalSchema } from "~/types/goal";
import { OpenAIMessage } from "~/types/message";

interface Context {
  id: string;
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
    userId: string | null;
    onGoal: ((rootGoal: any) => void) | null;
  };
  message: string | null;
}

type Event =
  | {
      type: "SET_GOAL";
      goal: string;
      userId: string;
      topic: string;
      onGoal: (rootGoal: any) => void;
    }
  | {
      type: "REFACTOR_GOAL";
      message: string;
    }
  | { type: "PERSIST_GOAL" }
  | {
      type: "LOADING";
    }
  | { type: "DONE_LOADING" };

export const chatMachine = createMachine<Context, Event>(
  {
    predictableActionArguments: true,
    id: "chat",
    type: "parallel",
    context: {
      id: nanoid(),
      user: {
        userId: null,
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
                    userId: event.userId,
                    onGoal: event.onGoal,
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
        if (!context.user.userId) {
          throw Error("Forbidden");
        }

        const message = await openaiChat(
          context.chatHistory,
          system_prompts.goal_conversation
        );
        await cacheRootGoalConveration(
          {
            id: context.id,
            messages: context.chatHistory,
            title: context.user.topic!,
            userId: context.user.userId,
          },
          message
        );
        return { role: "assistant", content: message };
      },

      addRootGoal: async (context) => {
        if (!context.user.userId) {
          throw Error("Forbidden");
        }

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
