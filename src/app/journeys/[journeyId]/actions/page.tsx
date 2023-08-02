"use client";

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
} from "reactflow";
import {
  ActionMachineContext,
  actionMachine,
} from "~/lib/machines/actionsMachine";

import clsx from "clsx";
import GoalNode from "~/components/goal-node";

const nodeTypes = { goal: GoalNode };

export default async function ActionPage({
  params,
}: {
  params: { journeyId: string };
}) {
  return (
    <ActionMachineContext.Provider
      machine={actionMachine.withContext({
        journeyId: params.journeyId,
        goals: [],
      })}
    >
      <Actions />
      <div
        className={clsx(
          "relative duration-300 rounded-xl rounded-t border border-gray-light-secondary h-[calc(100vh-80px)]",
          " w-[calc(100vw-384px)]  rounded-l"
        )}
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
          <Controls />
          <MiniMap />
          <Background
            variant={"lines" as BackgroundVariant}
            gap={12}
            size={1}
          />
        </ReactFlow>
      </div>
    </ActionMachineContext.Provider>
  );
}

const Actions = () => {
  const actions = ActionMachineContext.useSelector(
    (state) => state.context.goals
  );

  return (
    <div className="flex flex-col gap-3 px-5 pt-5">
      {actions.map((action) => (
        <div
          className="px-3 py-2 bg-white border rounded-xl w-80 border-gray-light-secondary"
          key={action.id}
        >
          {action.topic}
        </div>
      ))}
    </div>
  );
};
