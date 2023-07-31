"use client";

import "reactflow/dist/style.css";

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  useReactFlow,
} from "reactflow";
import { TreeMachineContext, treeMachine } from "~/lib/machines/treeMachine";

import clsx from "clsx";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import GoalNode from "~/components/goal-node";
import { useDagreLayout } from "~/lib/hooks/useDagreLayout";

export default function App(props: { params: { journeyId: string } }) {
  const { goalId } = useParams();

  return (
    <div
      className={clsx(
        "relative duration-300 rounded-xl rounded-t border border-gray-light-secondary h-[calc(100vh-80px)]",
        goalId ? "mr-96 w-[calc(100vw-384px)]  rounded-l" : "w-screen "
      )}
    >
      <ReactFlowProvider>
        <GoalFlow journeyId={props.params.journeyId} />
      </ReactFlowProvider>
    </div>
  );
}

const nodeTypes = { goal: GoalNode };

const GoalFlow = ({ journeyId }: { journeyId: string }) => {
  const { onLayout } = useDagreLayout();
  const { setNodes, getNode, setEdges } = useReactFlow();

  const onGenerate = useCallback(() => {
    onLayout("TB");
  }, [onLayout]);

  return (
    <TreeMachineContext.Provider
      machine={treeMachine.withContext({
        stack: [],
        onGenerate,
        currentGoal: null,
        journeyId,
        ui: {
          node: {
            set: setNodes,
            get: getNode,
          },
          edge: {
            set: setEdges,
          },
        },
      })}
    >
      <ReactFlow
        fitView
        nodeTypes={nodeTypes}
        snapToGrid={true}
        minZoom={0.2}
        proOptions={{ hideAttribution: true }}
        defaultEdges={[]}
        defaultNodes={[]}
      >
        <Stop />
        <Controls />
        <MiniMap />
        <Background variant={"lines" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </TreeMachineContext.Provider>
  );
};

export const Stop = () => {
  const treeRef = TreeMachineContext.useActorRef();

  return (
    <Panel position="top-left">
      <button
        className="px-4 py-1 bg-white border border-gray-light-secondary rounded-xl"
        onClick={() => {
          treeRef.send({ type: "INTERRUPT" });
        }}
      >
        Stop
      </button>
    </Panel>
  );
};
