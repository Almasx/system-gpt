"use client";

import "reactflow/dist/style.css";

import { useParams, useRouter } from "next/navigation";
import { Reducer, useCallback, useEffect, useReducer } from "react";
import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
} from "react-joyride";
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
import { Loader2 } from "lucide-react";
import GoalNode from "~/components/goal-node";
import { Modal } from "~/components/ui/modal";
import { useDagreLayout } from "~/lib/hooks/useDagreLayout";

const nodeTypes = { goal: GoalNode };

interface State {
  run: boolean;
  stepIndex: number;
  steps: Step[];
}

export default function App(props: { params: { journeyId: string } }) {
  const { goalId } = useParams();
  const [state, updateState] = useReducer<Reducer<State, Partial<State>>>(
    (prev, next) => {
      return { ...prev, ...next };
    },
    {
      run: false,
      stepIndex: 0,
      steps: [
        {
          content: <div>Press here ONLY after generating enough</div>,
          disableBeacon: true,
          disableOverlayClose: true,
          placement: "bottom",

          target: "#forward",
          title: "Forward to next step",
        },
      ],
    }
  );

  const handleJoyrideCallback = useCallback((data: CallBackProps) => {
    const { action, index, status, type } = data;

    if (([STATUS.FINISHED, STATUS.SKIPPED] as string[]).includes(status)) {
      updateState({ run: false, stepIndex: 0 });
    } else if (
      ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND] as string[]).includes(type)
    ) {
      const nextStepIndex = index + (action === ACTIONS.PREV ? -1 : 1);

      updateState({
        stepIndex: nextStepIndex,
      });
    }
  }, []);

  useEffect(() => {
    updateState({
      run: true,
    });
  }, []);

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
      <Joyride
        callback={handleJoyrideCallback}
        continuous
        run={state.run}
        scrollToFirstStep
        showProgress
        showSkipButton
        stepIndex={state.stepIndex}
        steps={state.steps}
        styles={{
          options: {
            arrowColor: "#ffffff",
            backgroundColor: "#ffffff",
            overlayColor: "rgba(0, 0, 0, 0.4)",
            primaryColor: "#000",
            textColor: "#000",
            zIndex: 1000,
          },
        }}
      />
    </div>
  );
}

const GoalFlow = ({ journeyId }: { journeyId: string }) => {
  const { onLayout } = useDagreLayout();
  const { setNodes, getNode, setEdges } = useReactFlow();

  const onGenerate = useCallback(() => {
    onLayout("TB");
  }, [onLayout]);

  const { push } = useRouter();

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
        onGoal: () => push(`/journeys/${journeyId}/actions/`),
        rootDescription: null,
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

  const savingActions = TreeMachineContext.useSelector((state) =>
    state.matches("save")
  );

  return (
    <>
      <Panel position="top-left">
        <button
          className="px-4 py-1 bg-white border border-gray-light-secondary rounded-xl"
          onClick={() => {
            treeRef.send({ type: "INTERRUPT" });
          }}
          id="forward"
        >
          Forward to next step
        </button>
      </Panel>

      <Modal.Root visible={savingActions}>
        <div className="flex items-center gap-4 px-8 py-6 bg-white border rounded-xl border-gray-light-secondary">
          <Loader2 className="w-4 h-4 animate-spin " /> Saving Tree...
        </div>
      </Modal.Root>
    </>
  );
};
