import { z } from "zod";

export interface Goal {
  id: string;
  topic: string;
  description: string;
  importance: string;
  keywords: string[];
  obstacles: string[];
  meta: {
    score: Score;
    // resources: Array<Resource>;
    context: string;
  };
  children: Array<Goal>;
  position: { x: number; y: number };
  depth: number;
}

export interface PartialGoal {
  id: string;
  topic: string;
  description: string;
  importance: string;
  keywords: string[];
  obstacles: string[];
  meta: {
    score?: Score;
    // resources: Array<Resource>;
    context?: string;
  };
  children: Array<Goal>;
  position: { x: number; y: number };
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
      importance: z.string(),
      keywords: z.array(z.string()),
      obstacles: z.array(z.string()),
    })
  ),
});

// subgoals: {
//   type: "array",
//   items: {
//     type: "object",
//     properties: {
//       sub_goal: {
//         type: "string",
//         description: "Subgoal",
//       },
//       sub_goal_content: {
//         type: "string",
//         description:
//           "Description as well as content of the subgoal as much as possible",
//       },
//       importance: {
//         type: "string",
//         description:
//           "Importance of the topic or entity in the context of the goal (High, Medium, Low)",
//       },
//       keywords: {
//         type: "array",
//         description:
//           "Related keywords or phrases that provide additional context. non empty",
//         items: {
//           type: "string",
//         },
//       },
//       obstacles: {
//         type: "array",
//         description:
//           "Potential obstacles or hurdles identified in the goal text. non empty",
//         items: {
//           type: "string",
//         },
//       },
//     },
//     required: [
//       "sub_goal",
//       "description",
//       "importance",
//       "keywords",
//       "obstacles",
//     ],
//   },
//   description:
//     "List of subgoals generated from the main goal, score, and context",
// },
