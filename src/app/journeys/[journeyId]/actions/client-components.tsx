"use client";

import "reactflow/dist/style.css";

import {
  ActionMachineContext,
  actionMachine,
} from "~/lib/machines/actionsMachine";
import { ActionNode, ChunkNode } from "~/components/goal-node";
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  selectActionStatus,
  useActionStatusStore,
} from "~/lib/hooks/useActionStatus";

import { ActionGoal } from "~/types/goal";
import clsx from "clsx";

const nodeTypes = { action: ActionNode, chunk: ChunkNode };

export const ActionFlow = ({
  actions,
  journeyId,
}: {
  journeyId: string;
  actions: ActionGoal[];
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  return (
    <ActionMachineContext.Provider
      machine={actionMachine.withContext({
        journeyId,
        goals: actions,
        currentAction: null,
        ui: {
          node: {
            set: setNodes,
          },
          edge: {
            set: setEdges,
          },
        },
      })}
    >
      <div
        className={clsx(
          "relative duration-300 rounded-xl rounded-t border border-gray-light-secondary",
          "w-[calc(100vw-384px)] ml-96 h-[calc(100vh-80px)]"
        )}
      >
        <ReactFlow
          nodeTypes={nodeTypes}
          minZoom={0.2}
          proOptions={{ hideAttribution: true }}
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
        >
          <Controls />
          <MiniMap zoomable pannable />
          <Background
            variant={"lines" as BackgroundVariant}
            gap={12}
            size={1}
          />
        </ReactFlow>
      </div>
    </ActionMachineContext.Provider>
  );
};

export const Action = ({ action }: { action: ActionGoal }) => {
  const status = useActionStatusStore(selectActionStatus(action.id));
  console.log(status);

  return (
    <div
      className={clsx(
        "px-3 py-2 border rounded-xl w-80",
        status === "estimating"
          ? "text-blue-800 bg-blue-200 border-blue-500"
          : "border-gray-light-secondary bg-white "
      )}
      key={action.id}
    >
      {action.topic}
    </div>
  );
};
