export const coach_message = `Now instead of 3 experts you are one productivity coach who specializes in helping people build better habits and stick to those habits. You have to generate schedule to include in his calendar

Note: DO NOT include break time. Only include work blocks 

Task: Choose a specific time and place to perform this habit based on previous thoughts to make the cue as clear as possible, and remember, consistency is key. Generate calendar for him`;

export const brainstorm_system = `Imagine three different experts are answering this question.
They will brainstorm the answer step by step reasoning carefully and taking all facts into consideration
All experts will write down 1 step of their thinking, then share it with the group.
They will each critique their response, and the all the responses of others
They will check their answer based on book Atomic Habits and the laws of habits
Then all experts will go on to the next step and write down this step of their thinking.
They will keep going through steps until they reach their conclusion taking into account the thoughts of the other experts
If at any time they realize that there is a flaw in their logic they will backtrack to where that flaw occurred
If any expert realizes they're wrong at any point then they acknowledges this and start another train of thought
Each expert will assign a likelihood of their current assertion being correct
Continue until the experts agree on the single most likely location.
The result should be a detailed guide what to do with schedule.
Remember goal is setting for direction and habits is for making progress`;

export const ai_create_schedule = {
  name: "create_schedule",
  description: "Create a schedule based on goals",
  parameters: {
    type: "object",
    properties: {
      schedule: {
        type: "array",
        items: {
          type: "object",
          properties: {
            summary: {
              type: "string",
              description: "Summary of the work block",
            },
            description: {
              type: "string",
              description: "What to do during work block",
            },
            dayOfWeek: {
              type: "number",
              description: "day of week from 0(Monday)-6(Sunday) only number",
            },
            start: {
              type: "string",
              description: "Start time of the work block",
            },
            end: {
              type: "string",
              description: "End time of the work block",
            },
          },
          required: ["summary", "description", "start", "end"],
        },
      },
    },
    required: ["events"],
  },
};

export const extract_root = {
  name: "extract_context",
  description:
    "Extracts and think of key context information from the input goal text for later use",
  parameters: {
    type: "object",
    properties: {
      goal_topic: {
        type: "string",
        description: "The title of the goal",
      },
      goal_content: {
        type: "string",
        description: "The text context for goal",
      },
      goal_importance: {
        type: "number",
        description: "Importance of the goal (0-2)",
      },
      goal_keywords: {
        type: "array",
        description:
          "Related keywords or phrases that provide additional context. > 1",
        items: {
          type: "string",
        },
      },
      goal_obstacles: {
        type: "array",
        description:
          "Potential obstacles or hurdles identified in the goal text. > 1",
        items: {
          type: "string",
        },
      },
    },
    required: [
      "goal_topic",
      "goal_content",
      "goal_keywords",
      "goal_obstacles",
      "goal_importance",
    ],
  },
};

export const score_goal = {
  name: "score_goal",
  description:
    "Calculate the score of a goal based on priority, relevance, and complexity",
  parameters: {
    type: "object",
    properties: {
      goal: {
        type: "object",
        description: "The goal to be scored",
        properties: {
          priority: {
            type: "integer",
            description: "Priority of the goal (1-10)",
          },
          relevance: {
            type: "integer",
            description: "Relevance of the goal to the main goal (1-10)",
          },
          complexity: {
            type: "integer",
            description:
              "Complexity of the goal, based on the number of subgoals (1-10)",
          },
        },
        required: ["priority", "relevance", "complexity"],
      },
    },
    required: ["goal"],
  },
};

export const generate_subgoals = {
  name: "generate_subgoals",
  description: "Generate subgoals based on a given goal, score, and context",
  parameters: {
    type: "object",
    properties: {
      subgoals: {
        type: "array",
        description:
          "List of subgoals generated from the main goal, context. Length depend on NUMBER_OF_SUBGOALS",
        items: {
          type: "object",
          properties: {
            sub_goal: {
              type: "string",
              description: "Subgoal",
            },
            sub_goal_content: {
              type: "string",
              description:
                "Description as well as content of the subgoal as much as possible",
            },
            importance: {
              type: "number",
              description:
                "Importance of the topic or entity in the context of the goal 0 - Low, 1 - Medium, 2 - High",
            },
            keywords: {
              type: "array",
              description:
                "Related keywords or phrases that provide additional context. > 1",
              items: {
                type: "string",
              },
            },
            obstacles: {
              type: "array",
              description:
                "Potential obstacles or hurdles identified in the goal text. > 1",
              items: {
                type: "string",
              },
            },
          },
          required: [
            "sub_goal",
            "description",
            "importance",
            "keywords",
            "obstacles",
          ],
        },
      },
    },
    required: ["subgoals"],
  },
};

export const search_resources = {
  name: "search_resources",
  description: "Search for external resources related to a goal or subgoal",
  parameters: {
    type: "object",
    properties: {
      resources: {
        type: "array",
        items: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Title of the resource",
            },
            url: {
              type: "string",
              description: "URL of the resource",
            },
            description: {
              type: "string",
              description: "Description of the resource",
            },
          },
          required: ["title", "url", "description"],
        },
        description:
          "List of external resources related to the goal or subgoal",
      },
    },
    required: ["resources"],
  },
};

export const system_prompts = {
  goal_conversation: {
    message: `The following is an informative conversation between a human and an AI goal adviser. AI goal adviser will really try to think out of box. Given user's goal AI advices will try to to develop very specific, achievable goals that subscribes to the SMART goals method with user. The goal adviser will ask lots of questions. The goal adviser will attempt to answer any question asked and will always probe for the human's appetite and goals by asking questions of its own. If the human's appetite is low it will offer conservative goal advice, if the appetite of the human is higher it will offer more aggressive
    advice. In the end you should finalize your work so i can forward this to another AI. There also has to be feedback to user. The conversation is:`,
    model: "gpt-3.5-turbo",
    temperature: 1.3,
  },
  message_enrich: {
    message:
      "The AI agent in this process is tasked with enriching a provided sub goal and its associated attributes into a more detailed context.  It will try to think about it more and brainstorm quality content and insights. The high-level purpose is to augment the user's understanding and planning around this sub goal, thereby facilitating more effective roadmap creation. The final output will be a more in-depth text.",
    model: "gpt-3.5-turbo",
    temperature: 1.3,
  },

  generate_subgoals: {
    message:
      "AI, now you have all the necessary inputs to generate sub goals for the main goal. Use the goal's context and any resources found to create relevant sub goals that will assist the user in achieving their goal. Remember to ensure each sub goal is specific, measurable, achievable, relevant, and time-bound. The number of sub goals is dependent on NUMBER_OF_SUBGOALS",
    model: "gpt-3.5-turbo-16k",
    temperature: 1.4,
  },

  calculate_score: {
    message:
      "AI, now that you have the goal and its context, assess its priority, relevance, and complexity. Remember to consider the context you extracted and how these factors could affect the direction and difficulty of the goal.",
    model: "gpt-3.5-turbo-0613",
    temperature: 0.7,
  },

  resources: {
    message:
      "AI, based on the goal and context, search for any external resources that could help the user in achieving their goal. This could include tutorials, online courses, books, tools, or expert advice that is closely related to the key concepts identified in the goal.",
    model: "gpt-3.5-turbo-0613",
    temperature: 0.7,
  },
  extract_context: {
    message:
      "AI, take the user's goal and extract generate key concepts and entities that will be relevant for generating sub goals. Consider factors such as the subject matter, scope, timeframes, and any specific tasks or skills mentioned.",

    model: "gpt-3.5-turbo-16k",
    temperature: 1.4,
  },
} as const;

export const THRESHOLD = 0.1; // for children
export const MAX_DEPTH = 5;
export const BASE = Math.pow(THRESHOLD, 1 / MAX_DEPTH); // or discount_factor  Math.pow((THRESHOLD / INITIAL_SCORE), (1/MAX_DEPTH)); const MAX_DEPTH = 5;
export const PRIORITY_WEIGHT = 0.1; // Weight for Priority
export const RELEVANCE_WEIGHT = 0.4; // Weight for Relevance
export const COMPLEXITY_WEIGHT = 0.5; // Weight for Complexity
export const COST_PER_NODE = 0.002; //$
// const MAX_TOTAL_NODES = Math.floor(BUDGET / COST_PER_NODE);