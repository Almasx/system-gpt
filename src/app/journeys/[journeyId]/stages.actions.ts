"use server";

import { ActionGoal, PersistedGoal, Score } from "~/types/goal";

import { redis } from "~/lib/services/redis";
import { Stage } from "~/types/journey";
import { OpenAIMessage } from "~/types/message";

export const saveRootGoalMessage = async (
  journeyId: string,
  message: OpenAIMessage
) => {
  const createdAt = Date.now();

  await redis.json.arrappend(
    `journey:${journeyId}`,
    "$.stages.goalConversation",
    { ...message, createdAt }
  );
};

export const getRootGoalMessages = async (journeyId: string) => {
  const goalConversation: (OpenAIMessage & { createdAt: number })[] =
    await redis.json.get(
      `journey:${journeyId}`,
      "$.stages.goalConversation[*]"
    );

  let state: "idle" | "refactor" | "done" = "idle";
  console.log(goalConversation);

  if (goalConversation.length > 0) {
    state = "refactor";
    return {
      goalConversation: goalConversation.map((message) => ({
        content: message.content,
        role: message.role,
      })),
      state,
    };
  }

  return { state };
};

export const saveTreeNode = async (journeyId: string, node: PersistedGoal) => {
  console.log(node.path, node);
  await redis.json.set(
    `journey:${journeyId}`,
    "$.stages.goalTree." + node.path,
    node
  );
};

export const getRootNode = async (journeyId: string) => {
  const path: any[] = await redis.json.get(
    `journey:${journeyId}`,
    "$.stages.goalTree"
  );

  if (path.length > 0) {
    const tree: PersistedGoal = await getTreeNode(
      journeyId,
      Object.keys(path[0])[0]
    );
    console.log(Object.keys(tree.children).length);
    if (Object.keys(tree.children).length > 0) {
      const state: Stage = (
        await redis.json.get(`journey:${journeyId}`, "$.stages.state")
      )[0];
      console.log("state", state);

      return {
        state:
          state !== "actions" ? ("generating" as const) : ("done" as const),
        tree,
      };
    }

    return { state: "root" as const, tree };
  }

  return { state: "not found" as const };
};

export const getTreeNode = async (journeyId: string, path: string) => {
  return (
    await redis.json.get(`journey:${journeyId}`, "$.stages.goalTree." + path)
  )[0];
};

export const patchRootNodeDescription = async (
  journeyId: string,
  description: string
) => {
  await redis.json.set(
    `journey:${journeyId}`,
    `$.description`,
    JSON.stringify(description)
  );
};

export const patchTreeNodeContext = async (
  journeyId: string,
  path: string,
  context: string
) => {
  await redis.json.set(
    `journey:${journeyId}`,
    `$.stages.goalTree.${path}.meta.context`,
    JSON.stringify(context)
  );
};

export const patchTreeNodeScore = async (
  journeyId: string,
  path: string,
  score: Score
) => {
  await redis.json.set(
    `journey:${journeyId}`,
    `$.stages.goalTree.${path}.meta.score`,
    score as unknown as Record<string, unknown>
  );
};

export const patchTreeNodeStatus = async (journeyId: string, path: string) => {
  await redis.json.set(
    `journey:${journeyId}`,
    `$.stages.goalTree.${path}.processed`,
    true
  );
};

export const saveActions = async (journeyId: string, actions: ActionGoal[]) => {
  const pipeline = redis.pipeline();
  for (const action of actions) {
    pipeline.json.set(
      `journey:${journeyId}`,
      `$.stages.actions.${action.id}`,
      action
    );
  }

  pipeline.json.set(
    `journey:${journeyId}`,
    `$.stages.state`,
    JSON.stringify("actions")
  );

  await pipeline.exec();
};

export const getActions = async (journeyId: string) => {
  const actionsMap = (
    await redis.json.get(`journey:${journeyId}`, `$.stages.actions`)
  )[0] as Record<string, ActionGoal>;

  const actions: ActionGoal[] = [];

  for (const action in actionsMap) {
    actions.push(actionsMap[action]);
  }
  return actions;
};

export const patchAction = async (journeyId: string, action: ActionGoal) => {
  if (action.processed) {
    await redis.json.set(
      `journey:${journeyId}`,
      `$.stages.actions.${action.id}`,
      action
    );
  }
};
