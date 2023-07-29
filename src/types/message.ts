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
