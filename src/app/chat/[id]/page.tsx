import { notFound, redirect } from "next/navigation";
import { CalendarMessage, Wrapper } from "~/components/message";

import { auth } from "@clerk/nextjs";
import { redis } from "~/lib/services/redis";
import { Chat } from "~/types/message";

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = auth();

  if (!userId) {
    redirect(`/sign-in?next=/chat/${params.id}`);
  }

  const chat = await redis.hgetall<Chat>(`chat:${params.id}`);
  console.log("chat");

  if (!chat) {
    notFound();
  }

  if (chat?.userId !== userId) {
    notFound();
  }

  console.log(
    chat.messages.filter((message) => typeof message.content !== "string")
  );

  return (
    <div className="flex flex-col items-center pt-8 pb-8">
      <main className="max-w-[1024px] flex flex-col gap-5">
        <div
          className=" text-dark/40 italic !font-normal w-full
              p-4 grid place-items-center
             text-lg rounded-xl bg-gray-light"
        >
          {chat.title}
        </div>
        <div className="flex flex-col border rounded-lg overflow-clip border-gray-light-secondary">
          {...chat.messages.map((message, index) => {
            if (message.role !== "system" && !message.hiddenUI) {
              typeof message.content !== "string" &&
                console.log(message.content);
              return (
                <Wrapper
                  key={index}
                  message={
                    typeof message.content === "string" ? (
                      message.content
                    ) : (
                      <CalendarMessage
                        days={message.content.days.map((day) => ({
                          events: day.events.map((event) => ({
                            ...event,
                            start: new Date(event.start),
                            end: new Date(event.end),
                          })),
                          date: new Date(day.date),
                        }))}
                      />
                    )
                  }
                  id={index.toString()}
                  type={message.role}
                />
              );
            }
          })}
        </div>
      </main>
    </div>
  );
}
