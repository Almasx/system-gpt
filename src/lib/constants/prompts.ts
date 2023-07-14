export const coach_message = `Now instead of 3 experts you are one productivity coach who specializes in helping people build better habits and stick to those habits. You have to generate schedule to include in his calendar

Note: DO NOT include break time. Only include work blocks 

Task: Choose a specific time and place to perform this habit based on previous thoughts to make the cue as clear as possible, and remember, consistency is key. Generate calendar for him`;

export const system_message = `Imagine three different experts are answering this question.
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
