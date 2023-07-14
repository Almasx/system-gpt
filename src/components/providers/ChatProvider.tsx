"use client";

import { ChatMachineContext } from "../../lib/machines/chatMachine";

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
  return <ChatMachineContext.Provider>{children}</ChatMachineContext.Provider>;
};
