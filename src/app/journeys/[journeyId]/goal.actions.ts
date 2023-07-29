"use server";

import { redis } from "~/lib/services/redis";
import { OpenAIMessage } from "~/types/message";

export const saveRootGoalMessage = async (
  journeyId: string,
  message: OpenAIMessage
) => {
  const createdAt = Date.now();

  await redis.json.arrappend(
    `journey:${journeyId}`,
    "$.stages.goalConversation",
    { ...message, createdAt }
  );
};

export const getRootGoalMessages = async (journeyId: string) => {
  const goalConversation: OpenAIMessage[] = await redis.json.get(
    `journey:${journeyId}`,
    "$.stages.goalConversation[*]"
  );

  let state: "idle" | "refactor" | "done" = "idle";
  console.log(goalConversation);

  if (goalConversation.length > 0) {
    state = "refactor";
    const rootGoal = null;
    console.log(goalConversation);
    return { goalConversation, state };
  }

  return { state };
};
