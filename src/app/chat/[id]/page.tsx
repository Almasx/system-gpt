import { notFound, redirect } from "next/navigation";

import { auth } from "@clerk/nextjs";
import { Metadata } from "next";
import { getChat } from "~/app/actions";
import { Wrapper } from "~/components/ui/message";

export interface ChatPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({
  params,
}: ChatPageProps): Promise<Metadata> {
  const { userId } = auth();

  if (!userId) {
    return {};
  }

  const chat = await getChat(params.id, userId);
  return {
    title: chat?.title.toString().slice(0, 50) ?? "Chat",
  };
}

export default async function ChatPage({ params }: ChatPageProps) {
  const { userId } = auth();

  if (!userId) {
    redirect(`/sign-in?next=/chat/${params.id}`);
  }
  const chat = await getChat(params.id, userId);

  if (!chat) {
    notFound();
  }

  if (chat?.userId !== userId) {
    notFound();
  }

  console.log(chat.messages);

  return (
    <div className="h-screen flex flex-col pt-16 pb-8 items-center">
      <main className="max-w-[1024px] rounded-lg overflow-clip border border-gray-light-secondary">
        {...chat.messages.map((message, index) => {
          if (message.role !== "system" && !message.hiddenUI) {
            typeof message.content !== "string" && console.log(message.content);
            return (
              <Wrapper
                key={index}
                message={typeof message.content === "string" && message.content}
                id={index.toString()}
                type={message.role}
              />
            );
          }
        })}
      </main>
    </div>
  );
}
