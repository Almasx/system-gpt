import { z } from "zod";

export type Goal = {
  topic: string;
  description: string;
  importance: number;
  keywords: string[];
  obstacles: string[];
};

export type PersistedGoal = (
  | {
      children: Record<string, PersistedGoal>;
      processed: true;
      meta: {
        score: Score;
        context: string;
      };
    }
  | {
      children: {};
      processed: false;
      meta: {
        score: null;
        context: null;
      };
    }
) &
  Goal & { path: string; id: string; depth: number };

export type ProcessedGoal = {
  id: string;
  path: string;
  meta: {
    score: Score;
    context: string;
  };
  children: Array<UnprocessedGoal | ProcessedGoal>;
  depth: number;
} & Goal;

export type UnprocessedGoal = {
  id: string;
  path: string;
  meta: {
    score?: Score;
    context?: string;
  };
  children: never[];
  depth: number;
} & Goal;

export interface Score {
  priority: number;
  relevance: number;
  complexity: number;
}

export const scoreShema = z.object({
  goal: z.object({
    priority: z.number(),
    relevance: z.number(),
    complexity: z.number(),
  }),
});

export const subgoalSchema = z.object({
  subgoals: z.array(
    z.object({
      sub_goal: z.string(),
      sub_goal_content: z.string(),
      importance: z.number(),
      keywords: z.array(z.string()),
      obstacles: z.array(z.string()),
    })
  ),
});

export const rootGoalSchema = z.object({
  goal_topic: z.string(),
  goal_content: z.string(),
  goal_importance: z.number(),
  goal_keywords: z.array(z.string()),
  goal_obstacles: z.array(z.string()),
});
