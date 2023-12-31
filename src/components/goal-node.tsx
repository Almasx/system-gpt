import { memo, useState } from "react";
import { Handle, NodeProps, Position } from "reactflow";
import {
  ServiceStatus,
  selectGoalStatus,
  useTreeStatusStore,
} from "~/lib/hooks/useTreeStatus";
import {
  CalendarMachineContext,
  calendarMachine,
} from "~/lib/machines/calendarMachine";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { coach_message } from "~/lib/constants";
import { ActionProcessedGoal } from "~/types/goal";
import { AddCalendar } from "./templates/add-calendar";
import { Modal } from "./ui/modal";

const statusMap: Record<
  Extract<
    ServiceStatus,
    "calculateScore" | "generateSubgoals" | "messageEnrich"
  >,
  string
> = {
  calculateScore: "Calculating score...",
  generateSubgoals: "Generating subnodes....",
  messageEnrich: "Enriching context...",
};

type GoalNodeData = {
  label: string;
  keywords: string[];
  description: string;
  importance: number;
};

export const GoalNode = memo(
  ({
    data: { label, keywords, description, importance },
    id,
    selected,
  }: NodeProps<GoalNodeData>) => {
    const status = useTreeStatusStore(selectGoalStatus(id));
    const path = usePathname();

    return (
      <Link
        href={path.includes("goal") ? `` : `tree/goal/${id}`}
        className={clsx(
          "relative flex flex-col bg-white border rounded-xl w-96 duration-150",
          selected
            ? "border-blue-500 shadow-blue-200/50"
            : "border-gray-light-secondary ",
          status === "error" && "border-red-500"
        )}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="!w-6 !h-3 !border !-top-[7px] !rounded !border-gray-light-secondary !bg-light-secondary"
        />

        {status !== "idle" &&
          status !== "done" &&
          status !== "error" &&
          status && (
            <div className="absolute flex items-center gap-1 px-1 py-0.5 text-xs font-medium text-blue-800 translate-y-full bg-blue-200 border border-blue-500 rounded-md -bottom-3">
              <Loader2 className="w-3 h-3 animate-spin " /> {statusMap[status]}
            </div>
          )}

        <div
          className={clsx(
            "absolute p-1 text-xs uppercase  border  rounded-lg right-1 rotate-12 text-yellow-950 -top-2",
            importance > 6
              ? "bg-yellow-200 border-yellow-500"
              : importance < 4
              ? "bg-lime-200 border-lime-500"
              : "bg-neutral-200 border-neutral-500"
          )}
        >
          {importance > 6 ? "High" : importance < 4 ? "Medium" : "Low"}
        </div>
        <header className="grid px-3 py-2 font-mono uppercase border-b place-items-center font-meduim border-gray-light-secondary">
          {label}
        </header>
        <div className="px-3 py-2 border-b bg-light-secondary border-gray-light-secondary">
          {description}
        </div>
        <div className="flex gap-3 px-3 py-2 pb-2.5 overflow-x-auto hide-scrollbar nodrag">
          {keywords?.map((keyword) => (
            <div
              className="p-1 text-xs uppercase border rounded-lg bg-light-secondary border-gray-light-secondary whitespace-nowrap"
              key={`${id}-${keyword}`}
            >
              {keyword}
            </div>
          ))}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="!w-6 !h-3 !border !-bottom-[7px] !rounded !border-gray-light-secondary !bg-light-secondary"
        />
      </Link>
    );
  }
);

GoalNode.displayName = "GoalNode";

type ActionNodeData = {
  label: string;
  time: number;
  score: number;
};

export const ActionNode = memo(
  ({ data: { label, time, score } }: NodeProps<ActionNodeData>) => {
    return (
      <div className="flex flex-col bg-white border rounded-xl overflow-clip border-gray-light-secondary">
        <div className="px-3 py-1.5 font-base border-b border-gray-light-secondar">
          {label}
        </div>
        <div className="flex gap-2 px-3 py-1.5">
          <p>Timeframe: {time} hours</p> <p>Score: {score}</p>
        </div>
      </div>
    );
  }
);

ActionNode.displayName = "ActionNode";

type ChunkNodeData = {
  label: string;
  width: number;
  height: number;
  children: ActionProcessedGoal[];
};

export const ChunkNode = memo(
  ({
    data: { label, width, height, children }, //keywords, description, importance
    id,
  }: NodeProps<ChunkNodeData>) => {
    const [show, setShow] = useState(false);
    return (
      <>
        <div
          className={`relative border border-blue-500 border-dashed rounded-xl bg-blue-200/20`}
          style={{ width: width + "px", height: height + "px" }}
        >
          <div className="top-0 text-blue-900 uppercase -translate-y-6">
            {label}
          </div>
          <button
            onClick={() => setShow(true)}
            className="absolute flex items-center gap-1 px-1 py-0.5 text-xs font-medium text-white translate-y-full bg-blue-500 rounded-md -bottom-3"
          >
            Generate Calendar
          </button>
        </div>
        <Modal.Root visible={show} setVisible={setShow}>
          <CalendarMachineContext.Provider
            machine={calendarMachine.withContext({
              calendar: null,
              chatHistory: [
                { role: "system", content: coach_message },
                { role: "user", content: createPrompt(children) },
              ],
              errorMessage: null,
            })}
          >
            <AddCalendar />
          </CalendarMachineContext.Provider>
        </Modal.Root>
      </>
    );
  }
);

const createPrompt = (actionGoals: ActionProcessedGoal[]): string => {
  let prompt = "Here are the details of the action goals:\n";

  actionGoals.forEach((goal, index) => {
    prompt += `Goal ${index + 1}:\n`;
    prompt += `  Topic: ${goal.topic}\n`;
    prompt += `  Description: ${goal.description}\n`;
    prompt += `  Importance: ${goal.importance}\n`;
    prompt += `  Prerequisites: ${goal.prerequisites.join(", ")}\n`;
    prompt += `  Effort: ${goal.effort.storyPoints} story points, ${goal.effort.estimatedDuration} estimated duration\n`;
    prompt += `  Keywords: ${goal.keywords.join(", ")}\n`;
    prompt += `  Obstacles: ${goal.obstacles.join(", ")}\n`;
    prompt += `  Processed: ${goal.processed}\n`;
    prompt += `  ID: ${goal.id}\n`;
    prompt += `  Path: ${goal.path}\n\n`;
  });

  return prompt;
};

ChunkNode.displayName = "ChunkNode";

export default GoalNode;
