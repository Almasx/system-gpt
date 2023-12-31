import {
  Score,
  UnprocessedGoal,
  scoreShema,
  subgoalSchema,
} from "~/types/goal";
import { assign, createMachine } from "xstate";
import { calculateChildren, nanoid } from "../utils";
import { generate_subgoals, score_goal, system_prompts } from "../constants";
import { openaiChat, openaiFunctions } from "~/app/api.actions";
import {
  patchTreeNodeContext,
  patchTreeNodeScore,
  patchTreeNodeStatus,
  saveTreeNode,
} from "~/app/journeys/[journeyId]/stages.actions";

import { useTreeStatusStore } from "../hooks/useTreeStatus";

export type GoalEvents = {
  type: "INPUT_GOAL";
  topic: string;
  description: string;
  importance: string;
  keywords: string[];
};

export type GoalContext = UnprocessedGoal & {
  journeyId: string;
  rootDescription: string;
};

export const goalMachine = createMachine<GoalContext, GoalEvents>(
  {
    predictableActionArguments: true,
    id: "goal",
    initial: "messageEnrich",

    states: {
      messageEnrich: {
        entry: (context) => {
          useTreeStatusStore
            .getState()
            .updateGoalStatus(context.id, "messageEnrich");
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
            actions: (context, event) => {
              console.log(event.data);
              useTreeStatusStore
                .getState()
                .updateGoalStatus(context.id, "error");
            },
          },
        },
      },
      calculateScore: {
        entry: (context) => {
          useTreeStatusStore
            .getState()
            .updateGoalStatus(context.id, "calculateScore");
        },
        invoke: {
          src: "calculateScoreService",
          onDone: {
            target: "generateSubgoals",
            actions: [
              async (context, event) => {
                await patchTreeNodeScore(
                  context.journeyId,
                  context.path,
                  event.data as Score
                );
              },
              assign({
                meta: (context, event) => ({
                  ...context.meta,
                  score: event.data,
                }),
              }),
            ],
          },
          onError: {
            target: "done",
            actions: (context, event) => {
              console.log(event.data);
              useTreeStatusStore
                .getState()
                .updateGoalStatus(context.id, "error");
            },
          },
        },
      },
      generateSubgoals: {
        entry: (context) => {
          useTreeStatusStore
            .getState()
            .updateGoalStatus(context.id, "generateSubgoals");
        },
        invoke: {
          src: "generateSubgoalsService",
          onDone: {
            actions: [
              assign({ children: (_, event) => event.data }),
              (context) =>
                useTreeStatusStore
                  .getState()
                  .updateGoalStatus(context.id, "done"),
            ],
            target: "done",
          },
          onError: {
            target: "done",
            actions: (context, event) => {
              console.log(event.data);
              useTreeStatusStore
                .getState()
                .updateGoalStatus(context.id, "error");
            },
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
        Importance: ${context.importance}
        Keywords: ${context.keywords?.join(", ")}
        ${context.description}
        

        Remember original goal was: """${context.rootDescription}""" 
        `;

        const enrichedMessage = await openaiChat(
          [
            { role: "system", content: system_prompts.message_enrich.message },
            { role: "user", content },
          ],
          system_prompts.message_enrich
        );

        await patchTreeNodeContext(
          context.journeyId,
          context.path,
          enrichedMessage
        );

        return enrichedMessage;
      },

      calculateScoreService: async (context): Promise<Score> => {
        const scoreRaw = await openaiFunctions(
          [
            { role: "system", content: system_prompts.message_enrich.message },
            {
              role: "user",
              content: `Calculate the score for the goal: """${context.meta?.context}"""
                 You can account relevance by root goal: """${context.rootDescription}"""`,
            },
          ],
          [score_goal],
          { name: score_goal.name },
          system_prompts.message_enrich
        );

        const score = scoreShema.parse(JSON.parse(scoreRaw));
        return score.goal;
      },

      generateSubgoalsService: async (context): Promise<UnprocessedGoal[]> => {
        const numberChildren = calculateChildren(
          context.meta.score!.significance,
          context.meta.score!.relevance,
          context.meta.score!.complexity,
          context.depth!
        );
        const prompt = `MAX_NUMBER_OF_SUBGOALS=${numberChildren}. Remember If context can be divided to more than that number compromise.

        remember original goal was: """${context.rootDescription}"""
        
        User Context (REMEMBER MAX_NUMBER_OF_SUBGOALS): """${context.meta.context}"""
        
        REMEMBER MAX_NUMBER_OF_SUBGOALS=${numberChildren}
        You have to not exceed it (<=)

        remember original goal`;

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
        const subgoalFormatted = subgoals.map((subgoal) => {
          const id = nanoid();
          return {
            keywords: subgoal.keywords,
            obstacles: subgoal.obstacles,
            path: `${context.path}.children.${id}`,
            topic: subgoal.sub_goal,
            description: subgoal.sub_goal_content,
            importance: subgoal.importance as number,
            meta: {},
            children: [],
            id,
            depth: context.depth + 1,
          };
        });

        await patchTreeNodeStatus(context.journeyId, context.path);

        for await (const subgoal of subgoalFormatted) {
          await saveTreeNode(context.journeyId, {
            ...subgoal,
            processed: false,
            meta: {
              context: null,
              score: null,
            },
            children: {},
          });
        }

        return subgoalFormatted;
      },
    },
  }
);
