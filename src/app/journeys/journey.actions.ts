"use server";

import { revalidatePath } from "next/cache";
import { zact } from "zact/server";
import { z } from "zod";
import { redis } from "~/lib/services/redis";
import { nanoid } from "~/lib/utils";
import { Journey } from "~/types/journey";

export const create = zact(z.object({ userId: z.string() }))(
  async ({ userId }) => {
    const id = nanoid();

    const createdAt = Date.now();
    const payload: Journey = {
      id,
      title: "",
      description: "",
      stages: {
        goalConversation: [],
      },
      userId,
      createdAt,
    };

    await redis.json.set(`journey:${id}`, "$", payload);
    await redis.zadd(`user:${userId}:journeys`, {
      score: createdAt,
      member: `journey:${id}`,
    });

    revalidatePath("/journeys");

    return id;
  }
);

export const patchTitle = zact(
  z.object({ journeyId: z.string(), title: z.string() })
)(async ({ journeyId, title }) => {
  console.log(journeyId, title);
  await redis.json.set(`journey:${journeyId}`, "$.title", `"${title}"`);
});
