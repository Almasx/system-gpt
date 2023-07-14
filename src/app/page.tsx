import { auth } from "@clerk/nextjs";
import Link from "next/link";
import { redis } from "~/lib/services/redis";
import { Chat } from "~/types/message";
import SystemGenerator from "./client-components";

export default function Page() {
  return (
    <SystemGenerator>
      <PreviousChats />
    </SystemGenerator>
  );
}

const PreviousChats = async () => {
  const { userId } = auth();

  const pipeline = redis.pipeline();
  const chats: string[] = await redis.zrange(`user:chat:${userId}`, 0, -1, {
    rev: true,
  });

  for (const chat of chats) {
    pipeline.hgetall(chat);
  }

  const previousChats = (await pipeline.exec()) as Chat[];
  console.log(chats, previousChats);

  return (
    <div className="flex flex-col gap-3">
      {previousChats?.map((chat) => (
        <Link
          key={chat.id}
          href={`/chat/${chat.id}`}
          className="px-4 py-2 italic font-normal truncate border rounded-lg bg-light border-gray-light-secondary text-neutral-500"
        >
          {chat.title}
        </Link>
      ))}
    </div>
  );
};
