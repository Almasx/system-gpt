import { ProcessedGoal } from "./goal";

export type Journey = {
  id: string;
  title: string;
  stages: {
    state: Stage;
    goalConversation: [];
    goalTree: ProcessedGoal | {};
    actions: [];
  };
  description: string;
  userId: string;
  createdAt: number;
};

export type Stage = "goalConversation" | "goalTree" | "actions";
