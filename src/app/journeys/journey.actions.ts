"use server";

import { auth } from "@clerk/nextjs";
import { redis } from "~/lib/services/redis";
import { nanoid } from "~/lib/utils";

export const create = async () => {
  const id = nanoid();
  const { userId } = auth();

  const createdAt = Date.now();
  const payload = {
    id,
    title: null,
    nodes: [],
    userId,
    createdAt,
  };

  await redis.hmset(`journey:${id}`, payload);
  await redis.zadd(`user:journey:${userId}`, {
    score: createdAt,
    member: `journey:${id}`,
  });

  return;
};
