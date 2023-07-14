"use server";

import { OpenAIMessage, StateMessage } from "~/types/message";

import { zact } from "zact/server";
import { z } from "zod";
import { createShedule } from "~/lib/services/calendar";
import { openai } from "~/lib/services/openai";
import { redis } from "~/lib/services/redis";
import { workBlockSchema } from "~/types/work-block";

export const scheduleCalendar = zact(
  z.object({
    workBlocks: z.array(workBlockSchema),
    userId: z.string(),
  })
)(async ({ workBlocks, userId }) => {
  try {
    await createShedule(workBlocks, userId);
  } catch (e) {
    console.log(e);
  }

  return "Done";
});

export const openaiChat = async (messages: OpenAIMessage[]) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-16k",
    messages,
    presence_penalty: 2,
    temperature: 1.1,
  });

  const ai_response = response.data?.choices[0].message?.content;

  if (!ai_response) {
    throw Error("Internal OpenAI Error");
  }

  return ai_response;
};

export const openaiFunctions = async (
  messages: OpenAIMessage[],
  functions: any[],
  function_call: { name: string }
) => {
  const response = await openai.createChatCompletion({
    model: "gpt-3.5-turbo-0613",
    messages: messages,
    functions,
    function_call,
  });

  const ai_response =
    response.data.choices[0].message?.function_call?.arguments;

  if (!ai_response) {
    throw Error("Internal OpenAI Error");
  }

  return ai_response;
};

interface cacheOptions {
  id: string;
  title: string;
  messages: StateMessage[];
  userId: string;
}

export const cache = async <T>(
  { id, title, messages, userId }: cacheOptions,
  response: T
) => {
  const createdAt = Date.now();
  const path = `/chat/${id}`;
  const payload = {
    id,
    title,
    userId,
    createdAt,
    path,
    messages: [
      ...messages,
      {
        content: response,
        role: "assistant",
      },
    ],
  };

  await redis.hmset(`chat:${id}`, payload);
  await redis.zadd(`user:chat:${userId}`, {
    score: createdAt,
    member: `chat:${id}`,
  });
};
