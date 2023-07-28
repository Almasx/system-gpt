import { assign, createMachine } from "xstate";
import { openaiChat, openaiFunctions } from "~/app/api.actions";
import { PartialGoal, Score, scoreShema, subgoalSchema } from "~/types/goal";
import { generate_subgoals, score_goal, system_prompts } from "../constants";
import { UpdateGoal, UpdateGoalStatus } from "../hooks/useTree";
import { calculateChildren, nanoid } from "../utils";

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

export const goalMachine = createMachine<
  Context<PartialGoal> & {
    update: null | UpdateGoal;
    statusUpdate: null | UpdateGoalStatus;
  },
  Events
>(
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
      obstacles: [],
      depth: 0,

      update: null,
      statusUpdate: null,

      meta: {
        context: null,
        score: null,
      },
      children: [],
    },
    states: {
      messageEnrich: {
        entry: (context) => {
          context.statusUpdate?.call(
            context.update,
            context.id!,
            "messageEnrich"
          );
        },
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
          onError: {
            target: "done",
            actions: (context) =>
              context.statusUpdate?.call(context.update, context.id!, "error"),
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
        entry: (context) => {
          context.statusUpdate?.call(
            context.update,
            context.id!,
            "calculateScore"
          );
        },
        invoke: {
          src: "calculateScoreService",
          onDone: {
            target: "generateSubgoals",
            actions: assign({
              meta: (context, event) => {
                context.update?.call(context.update, context.id!, {
                  score: event.data as Score,
                });

                return {
                  ...context.meta,
                  score: event.data,
                };
              },
            }),
          },
          onError: {
            target: "done",
            actions: (context) =>
              context.statusUpdate?.call(context.update, context.id!, "error"),
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
        entry: (context) => {
          context.statusUpdate?.call(
            context.update,
            context.id!,
            "generateSubgoals"
          );
        },
        invoke: {
          src: "generateSubgoalsService",
          onDone: {
            actions: [
              assign({ children: (_, event) => event.data }),
              (context) =>
                context.statusUpdate?.call(context.update, context.id!, "done"),
            ],
            target: "done",
          },
          onError: {
            target: "done",
            actions: (context) =>
              context.statusUpdate?.call(context.update, context.id!, "error"),
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
        ${context.obstacles
          ?.map((hurdle, index) => `${index + 1}. ${hurdle}`)
          .join("\n")}
        
        Remember, the importance of this goal is "${
          context.importance
        }". This learning journey will expand your understanding of ${context.keywords?.join(
          ", "
        )}.
        
        Good luck with your journey in learning ${context.topic}!
        `;

        const enrichedMessage = await openaiChat(
          [
            { role: "system", content: system_prompts.message_enrich.message },
            { role: "user", content },
          ],
          system_prompts.message_enrich
        );

        context.update?.call(context.update, context.id!, {
          context: enrichedMessage,
        });

        // await new Promise((resolve, reject) =>
        //   setTimeout(() => resolve(0), 2000)
        // );

        return enrichedMessage;
      },

      calculateScoreService: async (context): Promise<Score> => {
        const scoreRaw = await openaiFunctions(
          [
            { role: "system", content: system_prompts.message_enrich.message },
            {
              role: "user",
              content:
                "Calculate the score for the goal: " + context.meta?.context,
            },
          ],
          [score_goal],
          { name: score_goal.name },
          system_prompts.message_enrich
        );

        const score = scoreShema.parse(JSON.parse(scoreRaw));

        // await new Promise((resolve, reject) =>
        //   setTimeout(() => resolve(0), 2000)
        // );
        // console.log(context.update)
        context.update?.call(context.update, context.id!, {
          score: score.goal, // { priority: 1, complexity: 2, relevance: 3 },
        });
        // return { priority: 1, complexity: 2, relevance: 3 };
        return score.goal;
      },

      generateSubgoalsService: async (context): Promise<PartialGoal[]> => {
        const numberChildren = calculateChildren(
          context.meta.score!.priority,
          context.meta.score!.relevance,
          context.meta.score!.complexity,
          context.depth!
        );
        const prompt = `NUMBER_OF_SUBGOALS=${numberChildren}
        
        Context: ${context.meta.context}`;

        console.log(prompt);
        const subgoalsRaw = await openaiFunctions(
          [
            {
              role: "system",
              content: system_prompts.generate_subgoals.message,
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          [generate_subgoals],
          { name: generate_subgoals.name },
          system_prompts.generate_subgoals
        );

        const { subgoals } = subgoalSchema.parse(JSON.parse(subgoalsRaw));

        //         const childPosition = calculateSubnodePosition(
        //   context.position as any,
        //   2
        // );

        // await new Promise((resolve, reject) =>
        //   setTimeout(() => resolve(0), 2000)
        // );

        // return Array(2)
        //   .fill("")
        //   .map((_, index) => ({
        //     ...rootGoal,
        //     id: nanoid(),
        //     position: childPosition[index],
        //     meta: {},
        //   }));

        return subgoals.map((subgoal, index) => ({
          ...subgoal,
          topic: subgoal.sub_goal,
          description: subgoal.sub_goal_content,
          importance: subgoal.importance as 0 | 1 | 2,
          meta: {},
          children: [],
          id: nanoid(),
          depth: context.depth! + 1,
        }));
      },
    },
  }
);
