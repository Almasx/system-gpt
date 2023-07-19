"use client";

import "reactflow/dist/style.css";

import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  Edge,
  MiniMap,
  Node,
  NodeTypes,
  useEdgesState,
  useNodesState,
} from "reactflow";

import { inspect } from "@xstate/inspect";
import clsx from "clsx";
import { useParams } from "next/navigation";
import { useCallback } from "react";
import GoalNode from "~/components/molecules/goal-node";
import { useTreeStore } from "~/lib/hooks/useTree";
import { TreeMachineContext } from "~/lib/machines/treeMachine";
import { Goal } from "~/types/goal";

export const rootGoal = {
  topic: "Learn digital marketing",
  description:
    "Understand the various digital marketing channels and how to implement effective strategies. Learn how to measure the success of digital marketing campaigns.",
  id: "1",
  importance: "High",
  keywords: ["digital marketing", "online marketing", "internet advertising"],
  potential_hurdles: [
    "Understanding various digital marketing channels",
    "Implementing effective digital marketing strategies",
    "Measuring the success of digital marketing campaigns",
  ],
  meta: {
    context: ``,
    score: {
      priority: 0,
      relevance: 0,
      complexity: 0,
    },
  },
  children: [],
  position: {
    x: 500,
    y: 500,
  },
};

const initialNodes: Node[] = [];
const initialEdges: Edge[] = [];

const nodeTypes: NodeTypes = {
  goal: GoalNode,
};

if (typeof window !== "undefined") {
  inspect({
    url: "https://statecharts.io/inspect",
    iframe: false,
  });
}

export default function App() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { send } = TreeMachineContext.useActorRef();
  const addGoal = useTreeStore((state) => state.addGoal);
  const { id } = useParams();

  const onGenerate = useCallback(
    (goal: Goal) => {
      for (let i = 0; i < goal.children.length; i++) {
        const child = goal.children[i];
        addGoal(child);

        let node: Node = {
          id: child.id,
          data: {
            label: child.topic,
            keywords: child.keywords,
            description: child.description,
          },
          position: child.position,
          type: "goal",
        };
        setNodes((nds) => nds.concat(node));

        let edge = {
          id: `${goal.id}-${child.id}`,
          source: goal.id,
          target: child.id,
        };
        setEdges((eds) => eds.concat(edge));
      }
    },
    [addGoal, setEdges, setNodes]
  );

  return (
    <div
      className={clsx(
        "relative  duration-300",
        id
          ? "mr-96 w-[calc(100vw-384px)] h-[calc(100vh-20px)] rounded-l rounded-xl border border-gray-light-secondary top-5"
          : "w-screen h-screen"
      )}
    >
      <Status />
      <button
        className="absolute z-10 px-4 py-1 text-white button top-5 left-5 bg-dark"
        onClick={() =>
          send({
            type: "START",
            goal: rootGoal,
            onRoot: (goal: Goal) => {
              let node: Node = {
                id: goal.id,
                data: {
                  label: goal.topic,
                  keywords: goal.keywords,
                  description: goal.description,
                },
                type: "goal",
                position: { x: 500, y: 500 },
              };
              setNodes((nds) => nds.concat(node));
              addGoal(goal);
            },
            onGenerate,
          })
        }
      >
        Start
      </button>
      <button
        className="absolute z-10 px-4 py-1 text-white button top-20 left-5 bg-dark"
        onClick={() => send("INTERRUPT")}
      >
        INTERRUPT{" "}
      </button>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
      >
        <Controls />
        <MiniMap />
        <Background variant={"lines" as BackgroundVariant} gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}

export const Status = () => {
  return null;
  // const { loading, message } = TreeMachineContext.useSelector((state) => ({
  //   loading: state.matches("serviceStatus.loading"),
  // }));

  // console.log(loading, message);

  // if (loading) {
  //   return (
  //     <div className="absolute z-10 flex gap-1 p-1 bg-blue-200 border border-blue-500 rounded-md bottom-5 left-10 text-blue-950">
  //       <Loader /> {message}
  //     </div>
  //   );
  // }
};
