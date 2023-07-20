import { Day } from "~/components/calendar";

export interface OpenAIMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export type StateMessage = {
  hiddenUI?: boolean;
  role: "user" | "assistant" | "system";
  content: string | { days: Day[] };
};

export interface Chat extends Record<string, any> {
  id: string;
  title: string;
  createdAt: Date;
  userId: string;
  path: string;
  messages: StateMessage[];
  sharePath?: string;
}
