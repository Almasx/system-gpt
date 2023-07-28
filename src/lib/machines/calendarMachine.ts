// import { assign, createMachine, raise } from "xstate";
// import {
//   cache,
//   openaiChat,
//   openaiFunctions,
//   scheduleCalendar,
// } from "~/app/actions";
// import { OpenAIMessage, StateMessage } from "~/types/message";
// import { WorkBlock, workBlocksSchema } from "~/types/work-block";
// import {
//   ai_create_schedule,
//   coach_message,
//   system_message,
// } from "../constants";
// import { convertEventsUI, nanoid } from "../utils";

// import { createActorContext } from "@xstate/react";

// interface Context {
//   id: string;
//   chatHistory: StateMessage[];
//   data: {
//     calendar: WorkBlock[] | null;
//     accessToken: string | null;
//   };
//   user: {
//     goal: string | null;
//     suggestion: string | null;
//     userId: string | null;
//   };
//   brainstorm: {
//     counter: number;
//     maxRounds: number;
//   };
//   errorMessage: string | null;
// }

// type Event =
//   | { type: "SET_GOAL"; goal: string; userId: string }
//   | {
//       type: "ADD_CALENDAR";
//     }
//   | {
//       type: "REFACTOR_CALENDAR";
//       suggestion: string;
//     }
//   | { type: "PERSIST_CALENDAR"; calendar: any }
//   | {
//       type: "LOADING";
//     }
//   | { type: "DONE_LOADING" };

// // @TODO: refactor services
// const chatService = {
//   sendChatbotMessage: async (context: Context) => {
//     if (!context.user.userId) {
//       throw Error("Forbidden");
//     }

//     const message = await openaiChat(convertStateMessages(context.chatHistory));
//     await cache(
//       {
//         id: context.id,
//         messages: context.chatHistory,
//         title: context.user.goal!,
//         userId: context.user.userId,
//       },
//       message
//     );
//     return { role: "assistant", content: message };
//   },

//   createCalendar: async (context: Context) => {
//     if (!context.user.userId) {
//       throw Error("Forbidden");
//     }

//     const calendar = await openaiFunctions(
//       convertStateMessages([context.chatHistory.at(-1) as StateMessage]),
//       [ai_create_schedule],
//       { name: ai_create_schedule.name }
//     );

//     const workBlocks = workBlocksSchema.parse(JSON.parse(calendar));

//     console.log(workBlocks);

//     await cache(
//       {
//         id: context.id,
//         messages: context.chatHistory,
//         title: context.user.goal!,
//         userId: context.user.userId,
//       },
//       convertEventsUI(workBlocks.schedule)
//     );

//     return {
//       ui: convertEventsUI(workBlocks.schedule),
//       workBlocks: workBlocks.schedule,
//     };
//   },
//   addCalendarToUserAccount: async (context: Context) => {
//     if (!context.user.userId) {
//       throw Error("Forbidden");
//     }

//     if (context.data.calendar) {
//       scheduleCalendar({
//         workBlocks: context.data.calendar,
//         userId: context.user.userId,
//       });
//     }
//   },
// };

// export const chatMachine = createMachine<Context, Event>({
//   predictableActionArguments: true,
//   id: "chat",
//   type: "parallel",
//   context: {
//     id: nanoid(),
//     user: {
//       userId: null,
//       goal: null,
//       suggestion: null,
//     },
//     data: {
//       accessToken: null,
//       calendar: null,
//     },
//     brainstorm: {
//       counter: 0,
//       maxRounds: 2,
//     },

//     chatHistory: [{ role: "system", content: system_message }],
//     errorMessage: null,
//   },
//   states: {
//     serviceStatus: {
//       id: "serviceStatus",
//       initial: "idle",
//       states: {
//         idle: {},
//         loading: {},
//         error: {},
//       },
//     },
//     chatFlow: {
//       initial: "idle",
//       states: {
//         idle: {
//           on: {
//             SET_GOAL: {
//               target: "creatingSystem",
//               actions: assign({
//                 user: (context, event) => ({
//                   ...context.user,
//                   goal: event.goal,
//                   userId: event.userId,
//                 }),
//                 chatHistory: (context, event) => [
//                   ...context.chatHistory,
//                   { role: "user", content: event.goal },
//                 ],
//               }),
//             },
//           },
//         },
//         creatingSystem: {
//           initial: "brainstorming",
//           states: {
//             brainstorming: {
//               entry: raise("LOADING"),
//               invoke: {
//                 src: (context) => {
//                   return chatService.sendChatbotMessage(context);
//                 },
//                 onDone: {
//                   target: "checkCounter",
//                   actions: [
//                     assign({
//                       chatHistory: (context, event) => [
//                         ...context.chatHistory,
//                         event.data,
//                       ],
//                       brainstorm: (context, _) => ({
//                         ...context.brainstorm,
//                         counter: context.brainstorm.counter + 1,
//                       }),
//                     }),
//                     raise("DONE_LOADING"),
//                   ],
//                 },
//                 onError: {
//                   target: "#chat.serviceStatus.error",
//                   actions: assign({
//                     errorMessage: (context, event) => event.data.message,
//                   }),
//                 },
//               },
//             },
//             checkCounter: {
//               entry: raise("LOADING"),
//               always: [
//                 {
//                   target: "brainstorming",
//                   cond: (context) =>
//                     context.brainstorm.counter < context.brainstorm.maxRounds,
//                 },
//                 {
//                   target: "generatingSchedule",
//                   cond: (context) =>
//                     context.brainstorm.counter >= context.brainstorm.maxRounds,
//                   actions: assign({
//                     chatHistory: (context) => [
//                       ...context.chatHistory,
//                       {
//                         role: "user",
//                         content: coach_message,
//                         hiddenUI: true,
//                       },
//                     ],
//                   }),
//                 },
//               ],
//               exit: raise("DONE_LOADING"),
//             },
//             generatingSchedule: {
//               entry: raise("LOADING"),
//               invoke: {
//                 src: (context) => chatService.sendChatbotMessage(context),
//                 onDone: {
//                   target: "createCalendar",
//                   actions: [
//                     assign({
//                       chatHistory: (context, event) => [
//                         ...context.chatHistory,
//                         event.data,
//                       ],
//                     }),
//                     raise("DONE_LOADING"),
//                   ],
//                 },
//                 onError: {
//                   target: "#chat.serviceStatus.error",
//                   actions: assign({
//                     errorMessage: (context, event) => event.data.message,
//                   }),
//                 },
//               },
//             },
//             createCalendar: {
//               entry: raise("LOADING"),
//               invoke: {
//                 src: (context) => chatService.createCalendar(context),
//                 onDone: {
//                   actions: [
//                     assign({
//                       data: (context, event) => ({
//                         ...context.data,
//                         calendar: event.data.workBlocks,
//                       }),
//                       chatHistory: (context, event) => [
//                         ...context.chatHistory,
//                         { role: "assistant", content: event.data.ui },
//                       ],
//                     }),
//                     raise("DONE_LOADING"),
//                   ],
//                 },
//                 onError: {
//                   target: "#chat.serviceStatus.error",
//                   actions: assign({
//                     errorMessage: (context, event) => event.data.message,
//                   }),
//                 },
//               },
//             },
//           },
//           on: {
//             REFACTOR_CALENDAR: {
//               target: "creatingSystem.generatingSchedule",
//               actions: [
//                 assign({
//                   data: (context, _) => ({
//                     ...context.data,
//                     calendar: null,
//                   }),
//                   user: (context, event) => ({
//                     ...context.user,
//                     calendar: event.suggestion,
//                   }),
//                   chatHistory: (context, event) => [
//                     ...context.chatHistory,
//                     { role: "user", content: event.suggestion },
//                   ],
//                 }),
//               ],
//             },
//             ADD_CALENDAR: {
//               target: "#chat.chatFlow.addingCalendarToUser",
//               actions: [
//                 assign({
//                   data: (context, event) => ({
//                     ...context.data,
//                   }),
//                 }),
//               ],
//             },
//           },
//         },
//         addingCalendarToUser: {
//           entry: raise("LOADING"),
//           invoke: {
//             src: (context) => chatService.addCalendarToUserAccount(context),
//           },
//           onDone: {
//             actions: [raise("DONE_LOADING"), "saveConversation"],
//           },

//           type: "final",
//         },
//       },
//       on: {
//         LOADING: "#chat.serviceStatus.loading",
//         DONE_LOADING: "#chat.serviceStatus.idle",
//       },
//     },
//   },
// });

// export const convertStateMessages = (
//   messages: StateMessage[]
// ): OpenAIMessage[] => {
//   const filteredMessages = messages.filter(
//     (msg) => typeof msg.content === "string"
//   );

//   const openAIMessages = filteredMessages.map((msg) => {
//     return {
//       role: msg.role,
//       content: msg.content as string,
//     } as OpenAIMessage;
//   });

//   return openAIMessages;
// };

// export const ChatMachineContext = createActorContext(chatMachine);
