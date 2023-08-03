import { Action, ActionFlow } from "./client-components";

import { ActionGoal } from "~/types/goal";
import { getActions } from "../stages.actions";

export default async function ActionPage(props: {
  params: { journeyId: string };
}) {
  const actions = await getActions(props.params.journeyId);
  console.log("actions.filter((action) => !action.processed)");

  return (
    <div className="relative h-[calc(100vh-80px)]">
      <Actions actions={actions} />

      <ActionFlow
        actions={actions.filter((action) => !action.processed)}
        journeyId={props.params.journeyId}
      />
    </div>
  );
}

const Actions = ({ actions }: { actions: ActionGoal[] }) => {
  return (
    <div className="fixed flex flex-col w-96 gap-3 px-5 pt-5 overflow-y-auto h-[calc(100vh-80px)] hide-scroll">
      {actions.map((action) => (
        <Action action={action} key={action.id} />
      ))}
    </div>
  );
};
