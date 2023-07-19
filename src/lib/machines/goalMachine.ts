import { assign, createMachine } from "xstate";
import { Goal, Score } from "~/types/goal";
import { calculateSubnodePosition, nanoid } from "../utils";

import { rootGoal } from "~/app/tree/new/page";

// export interface Resource {
//   title: string;
//   url: string;
//   description: string;
// }

export type Events = {
  type: "INPUT_GOAL";
  topic: string;
  description: string;
  importance: string;
  keywords: string[];
};

export type Context<T extends Record<any, any>> = {
  [K in keyof T]: T[K] extends Record<any, any> ? Context<T[K]> : T[K] | null;
};

export const goalMachine = createMachine<Context<Goal>, Events>(
  {
    predictableActionArguments: true,
    id: "goal",
    initial: "messageEnrich",
    context: {
      id: null,

      topic: null,
      description: null,
      importance: null,

      keywords: [],
      potential_hurdles: [],

      meta: {
        context: null,
        score: {
          priority: null,
          complexity: null,
          relevance: null,
        },
      },
      children: [],
      position: {
        x: null,
        y: null,
      },
    },
    states: {
      messageEnrich: {
        invoke: {
          src: "messageEnrichService",
          onDone: {
            target: "calculateScore",
            actions: assign({
              meta: (context, event) => ({
                ...context.meta,
                context: event.data,
              }),
            }),
          },
        },
      },
      // extractContext: {
      //   invoke: {
      //     src: "extractContextService",
      //     onDone: {
      //       target: "calculateScore",
      //       actions: assign({ meta: (_, event) => event.data }),
      //     },
      //   },
      // },
      calculateScore: {
        invoke: {
          src: "calculateScoreService",
          onDone: {
            target: "generateSubgoals",
            actions: assign({
              meta: (context, event) => ({
                ...context.meta,
                score: event.data,
              }),
            }),
          },
        },
      },
      // searchResources: {
      //   invoke: {
      //     src: "searchResourcesService",
      //     onDone: {
      //       target: "generateSubgoals",
      //       actions: assign({ meta: (_, event) => event.data }),
      //     },
      //   },
      // },
      generateSubgoals: {
        invoke: {
          src: "generateSubgoalsService",
          onDone: {
            actions: [assign({ children: (_, event) => event.data })],
            target: "done",
          },
        },
      },
      done: {
        type: "final",
        data: (context, event) => ({
          goal: context,
        }),
      },
    },
  },
  {
    services: {
      messageEnrichService: async (context) => {
        const content = `Goal: ${context.topic}
        Content: ${context.description}
        Importance: ${context.importance}
        Keywords: ${context.keywords?.join(", ")}
        
        Potential Hurdles:
        ${context.potential_hurdles
          ?.map((hurdle, index) => `${index + 1}. ${hurdle}`)
          .join("\n")}
        
        Remember, the importance of this goal is "${
          context.importance
        }". This learning journey will expand your understanding of ${context.keywords?.join(
          ", "
        )}.
        
        Good luck with your journey in learning ${context.topic}!
        `;

        // const enrichedMessage = await openaiChat(
        //   [
        //     { role: "system", content: system_prompts.message_enrich.message },
        //     { role: "user", content },
        //   ],
        //   system_prompts.message_enrich
        // );

        await new Promise((resolve, reject) =>
          setTimeout(() => resolve(0), 2000)
        );

        return "enrichedMessage";
      },

      calculateScoreService: async (context): Promise<Score> => {
        // const scoreRaw = await openaiFunctions(
        //   [
        //     { role: "system", content: system_prompts.message_enrich.message },
        //     {
        //       role: "user",
        //       content:
        //         "Calculate the score for the goal: " + context.meta?.context,
        //     },
        //   ],
        //   [score_goal],
        //   { name: score_goal.name },
        //   system_prompts.message_enrich
        // );

        // const score = scoreShema.parse(JSON.parse(scoreRaw));

        await new Promise((resolve, reject) =>
          setTimeout(() => resolve(0), 2000)
        );
        return { priority: 1, complexity: 2, relevance: 3 };
        // return score.goal;
      },

      generateSubgoalsService: async (context): Promise<Goal[]> => {
        const prompt = `Context: ${context.meta.context}
        Score: 
        ${(JSON.stringify(context.meta.score), null, "\t")}`;

        console.log(prompt);
        // const subgoalsRaw = await openaiFunctions(
        //   [
        //     {
        //       role: "system",
        //       content: system_prompts.generate_subgoals.message,
        //     },
        //     {
        //       role: "user",
        //       content: prompt,
        //     },
        //   ],
        //   [generate_subgoals],
        //   { name: generate_subgoals.name },
        //   system_prompts.generate_subgoals
        // );

        // const { subgoals } = subgoalSchema.parse(JSON.parse(subgoalsRaw));

        //         const childPosition = calculateSubnodePosition(
        //   context.position as any,
        //   2
        // );

        await new Promise((resolve, reject) =>
          setTimeout(() => resolve(0), 2000)
        );

        const childPosition = calculateSubnodePosition(
          context.position as any,
          2
        );

        return Array(2)
          .fill("")
          .map((_, index) => ({
            ...rootGoal,
            id: nanoid(),
            position: childPosition[index],
          }));

        // return subgoals.map((subgoal, index) => ({
        //   ...subgoal,
        //   topic: subgoal.sub_goal,
        //   description: subgoal.sub_goal_content,
        //   meta: {
        //     context: "",
        //     score: {
        //       complexity: 0,
        //       relevance: 0,
        //       priority: 0,
        //     },
        //   },
        //   children: [],
        //   id: nanoid(),
        //   position: childPosition[index],
        // }));
      },
    },
  }
);
