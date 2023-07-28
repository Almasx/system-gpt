"use server";

import { OpenAIMessage } from "~/types/message";

import { zact } from "zact/server";
import { z } from "zod";
import { createShedule } from "~/lib/services/calendar";
import { openai } from "~/lib/services/openai";
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

type Models =
  | "gpt-3.5-turbo-16k"
  | "gpt-3.5-turbo"
  | "gpt-3.5-turbo-0613"
  | "gpt-3.5-turbo-16k-0613"
  | "gpt-4"
  | "gpt-4-0613";

export const openaiChat = async (
  messages: OpenAIMessage[],
  config?: { model: Models; temperature?: number }
) => {
  console.log("action");
  const response = await openai.createChatCompletion({
    messages,
    ...(config
      ? {
          model: config.model,
          temperature: config.temperature ?? 1,
        }
      : {
          model: "gpt-3.5-turbo-16k",
          presence_penalty: 2,
          temperature: 1.1,
        }),
  });

  const ai_response = response.data?.choices[0].message?.content;
  console.log(ai_response);

  if (!ai_response) {
    throw Error("Internal OpenAI Error");
  }

  return ai_response;
};

export const openaiFunctions = async (
  messages: OpenAIMessage[],
  functions: any[],
  function_call: { name: string },
  config?: { model: Models; temperature?: number }
) => {
  console.log("action");
  const response = await openai.createChatCompletion({
    messages: messages,
    functions,
    function_call,
    ...(config
      ? {
          model: config.model,
          temperature: config.temperature ?? 1,
        }
      : {
          model: "gpt-3.5-turbo-0613",
        }),
  });

  const ai_response =
    response.data.choices[0].message?.function_call?.arguments;

  if (!ai_response) {
    throw Error("Internal OpenAI Error");
  }
  console.log(ai_response);

  return ai_response;
};
