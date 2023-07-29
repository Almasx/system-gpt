"use server";

import { redis } from "~/lib/services/redis";
import { OpenAIMessage } from "~/types/message";

export const cacheRootGoalMessages = async (
  journeyId: string,
  messages: OpenAIMessage[],
  response: string
) => {
  const createdAt = Date.now();
  const payload = [
    ...messages,
    {
      content: response,
      role: "assistant",
    },
  ];

  await redis.json.set(
    `journey:${journeyId}`,
    "$.stages.goalConversation",
    payload
  );
};
