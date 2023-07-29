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
      title: null,
      description: "",
      stages: {
        goalConversation: null,
      },
      userId,
      createdAt,
    };

    await redis.json.set(`journey:${id}`, ".", payload);
    await redis.zadd(`user:${userId}:journeys`, {
      score: createdAt,
      member: `journey:${id}`,
    });

    revalidatePath("/journeys");

    return id;
  }
);
