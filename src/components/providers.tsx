"use client";

import { ChatMachineContext, chatMachine } from "~/lib/machines/chatMachine";

import { useRouter } from "next/navigation";
import { system_prompts } from "~/lib/constants";

interface StateProviders {
  children: React.ReactNode;
  journeyId: string;
}

export const ChatProvider = ({ children, journeyId }: StateProviders) => {
  const { push } = useRouter();
  return (
    <ChatMachineContext.Provider
      machine={chatMachine.withContext({
        user: {
          topic: null,
          onGoal: () => {
            push(`/journeys/${journeyId}/tree/`);
          },
        },
        chatHistory: [
          { role: "system", content: system_prompts.goal_conversation.message },
        ],
        message: null,
        journeyId,
      })}
    >
      {children}
    </ChatMachineContext.Provider>
  );
};
