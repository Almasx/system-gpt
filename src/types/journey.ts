import { ProcessedGoal } from "./goal";

export type Journey = {
  id: string;
  title: string;
  stages: {
    goalConversation: [];
    goalTree: ProcessedGoal | {};
  };
  description: string;
  userId: string;
  createdAt: number;
};
