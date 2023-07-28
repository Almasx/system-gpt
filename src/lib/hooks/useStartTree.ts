import { Goal, PartialGoal } from "~/types/goal";
import { Node, useReactFlow } from "reactflow";
import { useCallback, useEffect } from "react";

import { ChatMachineContext } from "../machines/chatMachine";
import { TreeMachineContext } from "../machines/treeMachine";
import { calculateSubnodePosition } from "../utils";
import { nanoid } from "nanoid";
import { useTreeStore } from "./useTree";

export const useStartTree = ({ layout }: { layout: () => void }) => {
  const rootId = nanoid();
  const { getNode, setEdges, setNodes, addNodes } = useReactFlow();
  const treeRef = TreeMachineContext.useActorRef();

  const { addGoal, updateGoal, updateGoalStatus } = useTreeStore((state) => ({
    addGoal: state.addGoal,
    updateGoal: state.updateGoal,
    updateGoalStatus: state.updateGoalStatus,
  }));
  const rootGoal = ChatMachineContext.useSelector(
    (state) => state.context.goal
  );

  const idle = TreeMachineContext.useSelector((state) => state.matches("idle"));

  const onGenerate = useCallback(
    (goal: Goal) => {
      console.log(goal);
      const childPosition = calculateSubnodePosition(
        getNode(goal.id)!.position,
        goal.children.length
      );

      for (let i = 0; i < goal.children.length; i++) {
        const child = goal.children[i];
        addGoal(child);

        const node: Node = {
          id: child.id,
          data: {
            label: child.topic,
            keywords: child.keywords,
            description: child.description,
          },
          position: childPosition[i],
          type: "goal",
        };
        setNodes((nds) => nds.concat(node));

        const edge = {
          id: `${goal.id}-${child.id}`,
          source: goal.id,
          target: child.id,
        };
        setEdges((edges) => edges.concat(edge));
      }

      layout();
    },
    [addGoal, getNode, layout, setEdges, setNodes]
  );

  const startTree = useCallback(
    (goal: PartialGoal) => {
      treeRef.send({
        type: "START",
        goal,
        onGenerate,
        onUpdate: updateGoal,
        onStatusUpdate: updateGoalStatus,
      });
    },
    [onGenerate, treeRef, updateGoal, updateGoalStatus]
  );

  useEffect(() => {
    if (rootGoal && idle) {
      const goal = {
        ...rootGoal,
        id: rootId,
        meta: {},
        children: [],
        position: {
          x: 500,
          y: 500,
        },
        depth: 0,
      };

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
      addNodes(node);
      addGoal(goal);
      startTree(goal);
    }
  }, [addGoal, addNodes, idle, rootGoal, rootId, startTree]);
};
