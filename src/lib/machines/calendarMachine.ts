import { assign, createMachine, raise } from "xstate";
import { OpenAIMessage, StateMessage } from "~/types/message";
import { WorkBlock, workBlocksSchema } from "~/types/work-block";

import { createActorContext } from "@xstate/react";
import { openaiFunctions } from "~/app/api.actions";
import { ai_create_schedule } from "../constants";
import { convertEventsUI } from "../utils";

interface CalendarContext {
  chatHistory: StateMessage[];
  calendar: WorkBlock[] | null;
  errorMessage: string | null;
}

type CalendarEvent =
  | {
      type: "REFACTOR_CALENDAR";
      suggestion: string;
    }
  | {
      type: "LOADING";
    }
  | { type: "DONE_LOADING" };

export const calendarMachine = createMachine<CalendarContext, CalendarEvent>({
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
      initial: "createCalendar",
      states: {
        idle: {},
        createCalendar: {
          entry: raise("LOADING"),
          invoke: {
            src: async (context) => {
              const calendar = await openaiFunctions(
                convertStateMessages([
                  context.chatHistory.at(-1) as StateMessage,
                ]),
                [ai_create_schedule],
                { name: ai_create_schedule.name }
              );

              const workBlocks = workBlocksSchema.parse(JSON.parse(calendar));

              console.log(workBlocks);

              return {
                ui: convertEventsUI(workBlocks.schedule),
                workBlocks: workBlocks.schedule,
              };
            },
            onDone: {
              target: "idle",
              actions: [
                assign({
                  calendar: (context, event) => event.data.workBlocks,
                  chatHistory: (context, event) => [
                    ...context.chatHistory,
                    { role: "assistant", content: event.data.ui },
                  ],
                }),
                raise("DONE_LOADING"),
              ],
            },
            onError: {
              target: "#chat.serviceStatus.error",
              actions: assign({
                errorMessage: (context, event) => event.data.message,
              }),
            },
          },
        },
      },

      on: {
        LOADING: "#chat.serviceStatus.loading",
        DONE_LOADING: "#chat.serviceStatus.idle",
        REFACTOR_CALENDAR: {
          target: "#chat.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  chatFlow.createCalendar",
          actions: [
            assign({
              calendar: null,
              chatHistory: (context, event) => [
                ...context.chatHistory,
                { role: "user", content: event.suggestion },
              ],
            }),
          ],
        },
      },
    },
  },
});

export const convertStateMessages = (
  messages: StateMessage[]
): OpenAIMessage[] => {
  const filteredMessages = messages.filter(
    (msg) => typeof msg.content === "string"
  );

  const openAIMessages = filteredMessages.map((msg) => {
    return {
      role: msg.role,
      content: msg.content as string,
    } as OpenAIMessage;
  });

  return openAIMessages;
};

export const CalendarMachineContext = createActorContext(calendarMachine);
