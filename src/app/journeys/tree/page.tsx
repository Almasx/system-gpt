"use client";

import "reactflow/dist/style.css";

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
} from "reactflow";

import clsx from "clsx";
import { useParams } from "next/navigation";
import GoalNode from "~/components/goal-node";
import { useDagreLayout } from "~/lib/hooks/useDagreLayout";
import { useStartTree } from "~/lib/hooks/useStartTree";
import { TreeMachineContext } from "~/lib/machines/treeMachine";

export default function App() {
  const { id } = useParams();

  return (
    <div
      className={clsx(
        "relative duration-300 rounded-xl rounded-t border border-gray-light-secondary h-[calc(100vh-80px)]",
        id ? "mr-96 w-[calc(100vw-384px)]  rounded-l" : "w-screen "
      )}
    >
      <GoalFlow />
    </div>
  );
}

const nodeTypes = { goal: GoalNode };

const GoalFlow = () => {
  const { onLayout } = useDagreLayout();

  useStartTree({
    layout: () => {
      onLayout("TB");
    },
  });

  const treeRef = TreeMachineContext.useActorRef();

  return (
    <>
      <ReactFlow
        fitView
        nodeTypes={nodeTypes}
        snapToGrid={true}
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
        defaultEdges={[]}
        defaultNodes={[]}
      >
        <Panel position="top-left">
          <button
            className="px-4 py-1 bg-white border border-gray-light-secondary rounded-xl"
            onClick={() => treeRef.send("INTERRUPT")}
          >
            Stop
          </button>
        </Panel>
        <Controls />
        <MiniMap />
        <Background variant={"lines" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </>
  );
};
