"use client";

import { ChatMachineContext, chatMachine } from "~/lib/machines/chatMachine";

import { ReactFlowProvider } from "reactflow";
import { system_prompts } from "~/lib/constants";
import { TreeMachineContext } from "~/lib/machines/treeMachine";

export const ChatProvider = ({
  children,
  journeyId,
}: {
  children: React.ReactNode;
  journeyId: string;
}) => {
  return (
    <ChatMachineContext.Provider
      machine={chatMachine.withContext({
        user: {
          topic: null,
          onGoal: null,
        },
        goal: null,
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
export const TreeProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <TreeMachineContext.Provider>
      <ReactFlowProvider>{children}</ReactFlowProvider>
    </TreeMachineContext.Provider>
  );
};
