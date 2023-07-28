import { z } from "zod";

export interface Goal {
  id: string;
  topic: string;
  description: string;
  importance: 0 | 1 | 2;
  keywords: string[];
  obstacles: string[];
  meta: {
    score: Score;
    // resources: Array<Resource>;
    context: string;
  };
  children: Array<Goal>;
  depth: number;
}

export interface PartialGoal {
  id: string;
  topic: string;
  description: string;
  importance: 0 | 1 | 2;
  keywords: string[];
  obstacles: string[];
  meta: {
    score?: Score;
    context?: string;
  };
  children: Array<Goal>;
  depth: number;
}

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
