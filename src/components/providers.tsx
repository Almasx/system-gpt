"use client";

import { ChatMachineContext } from "~/lib/machines/chatMachine";
import { TreeMachineContext } from "~/lib/machines/treeMachine";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  return <ChatMachineContext.Provider>{children}</ChatMachineContext.Provider>;
};
export const TreeProvider = ({ children }: { children: React.ReactNode }) => {
  return <TreeMachineContext.Provider>{children}</TreeMachineContext.Provider>;
};
