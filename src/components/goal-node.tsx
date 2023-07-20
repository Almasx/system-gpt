import { Handle, NodeProps, Position } from "reactflow";

import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { memo, useState } from "react";
import {
  ServiceStatus,
  selectGoalStatus,
  useTreeStore,
} from "~/lib/hooks/useTree";

type GoalNodeData = {
  label: string;
  keywords: string[];
  description: string;
};

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

const GoalNode = ({
  data: { label, keywords, description },
  id,
  selected,
}: NodeProps<GoalNodeData>) => {
  const { push } = useRouter();
  const [toggle, setToggle] = useState<boolean>(false);
  const status = useTreeStore(selectGoalStatus(id));

  return (
    <div
      onClick={() => {
        toggle ? push(`/tree/new/`) : push(`/tree/new/goal/${id}`);
        setToggle((toggle) => !toggle);
      }}
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

      <div className="absolute p-1 text-xs uppercase bg-yellow-200 border border-yellow-500 rounded-lg right-1 rotate-12 text-yellow-950 -top-2">
        High
      </div>
      <header className="grid px-3 py-2 font-mono uppercase border-b place-items-center font-meduim border-gray-light-secondary">
        {label}
      </header>
      <div className="px-3 py-2 border-b bg-light-secondary border-gray-light-secondary">
        {description}
      </div>
      <div className="flex gap-3 px-3 py-2 pb-2.5 overflow-x-auto hide-scrollbar nodrag">
        {keywords.map((keyword) => (
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
    </div>
  );
};

export default memo(GoalNode);
