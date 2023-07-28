import { Edge, Node, useReactFlow } from "reactflow";

import Dagre from "@dagrejs/dagre";
import { useCallback } from "react";

const getLayoutedElements = (
  nodes: Node[],
  edges: Edge[],
  options: { direction: "TB" | "LR" }
) => {
  g.setGraph({ rankdir: options.direction });

  edges.forEach((edge) => g.setEdge(edge.source, edge.target));
  nodes.forEach((node) =>
    g.setNode(node.id, {
      ...node,
      width: node.width || 350,
      height: node.height || 200,
    })
  );

  Dagre.layout(g);

  return {
    nodes: nodes.map((node) => {
      node.position = g.node(node.id);

      return node;
    }),
    edges,
  };
};

const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));

export const useDagreLayout = () => {
  const { fitView, setNodes, setEdges, getEdges, getNodes } = useReactFlow();

  const onLayout = useCallback(
    (direction: "TB" | "LR") => {
      const layouted = getLayoutedElements(getNodes(), getEdges(), {
        direction,
      });

      setNodes([...layouted.nodes]);
      setEdges([...layouted.edges]);

      window.requestAnimationFrame(() => {
        fitView();
      });
    },
    [getNodes, getEdges, setNodes, setEdges, fitView]
  );

  return { onLayout };
};
