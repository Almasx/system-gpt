"use client";

import { ChevronRight, Loader2 } from "lucide-react";
import { Reducer, useCallback, useEffect, useReducer, useState } from "react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";
import Joyride, {
  ACTIONS,
  CallBackProps,
  EVENTS,
  STATUS,
  Step,
} from "react-joyride";

import { zodResolver } from "@hookform/resolvers/zod";
import { Prompt } from "next/font/google";
import { z } from "zod";
import { AutoAnimate } from "~/components/auto-animate";
import Chat from "~/components/chat";
import { ChatProvider } from "~/components/providers";
import { Modal } from "~/components/ui/modal";
import TextAreaField from "~/components/ui/text-area";
import TextField from "~/components/ui/text-field";
import { ChatMachineContext } from "~/lib/machines/chatMachine";

export default function SystemGeneratorWrapper(props: {
  params: { journeyId: string };
}) {
  return (
    <ChatProvider journeyId={props.params.journeyId}>
      <SystemGenerator />
    </ChatProvider>
  );
}

const promptSchema = z.object({
  goal: z.string(),
  user: z.string(),
  context: z.string(),
});

type Prompt = z.infer<typeof promptSchema>;

interface State {
  run: boolean;
  stepIndex: number;
  steps: Step[];
}

function SystemGenerator() {
  const [state, updateState] = useReducer<Reducer<State, Partial<State>>>(
    (prev, next) => {
      return { ...prev, ...next };
    },
    {
      run: false,
      stepIndex: 0,
      steps: [
        {
          content: <div>Chat here with Ai to increase quality</div>,
          disableBeacon: true,
          disableOverlayClose: true,
          placement: "top",

          target: "#chat",
          title: "Generate root goal",
        },
        {
          content: <div>Press here ONLY after talking enough with ai</div>,
          disableBeacon: true,
          disableOverlayClose: true,
          placement: "bottom",

          target: "#forward",
          title: "Generate root goal",
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

  const methods = useForm<Prompt>({
    resolver: zodResolver(promptSchema),
  });

  const idle = ChatMachineContext.useSelector((state) =>
    state.matches("chatFlow.idle")
  );

  const generatingGoal = ChatMachineContext.useSelector((state) =>
    state.matches("chatFlow.addingRootGoal")
  );

  const checkDB = ChatMachineContext.useSelector((state) =>
    state.matches("chatFlow.checkDB")
  );

  const waitingForMessage = ChatMachineContext.useSelector((state) =>
    state.matches("chatFlow.waitingForMessage")
  );

  useEffect(() => {
    waitingForMessage &&
      updateState({
        run: true,
      });
  }, [waitingForMessage]);

  if (checkDB) {
    return (
      <Modal.Root visible={checkDB}>
        <div className="flex items-center gap-4 px-8 py-6 bg-white border rounded-xl border-gray-light-secondary">
          <Loader2 className="w-4 h-4 animate-spin " /> Loading conversation
          from db..
        </div>
      </Modal.Root>
    );
  }

  return (
    <main className="flex flex-col items-center h-screen gap-5 overflow-x-hidden bg-white border border-gray-light-secondary rounded-t-xl">
      <AutoAnimate className="max-w-[1024px] ">
        {!methods.formState.isSubmitted && idle && (
          <h1 className="mb-8 text-4xl mt-52">
            Lets start by defining your goal. This will help us create a
            habit-forming system tailored to your needs.
          </h1>
        )}
        <div className="relative flex flex-col gap-3 pb-32">
          <FormProvider {...methods}>
            <Form />
          </FormProvider>
          {(methods.formState.isSubmitted || !idle) && <Chat />}
        </div>
      </AutoAnimate>
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
      <Modal.Root visible={generatingGoal}>
        <div className="flex items-center gap-4 px-8 py-6 bg-white border rounded-xl border-gray-light-secondary">
          <Loader2 className="w-4 h-4 animate-spin " /> Generating root goal..
        </div>
      </Modal.Root>
    </main>
  );
}

const Form = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useFormContext<Prompt>();

  const actorRef = ChatMachineContext.useActorRef();
  const [changeInterface, setChangeInterface] = useState(false);
  const { send } = ChatMachineContext.useActorRef();

  const idle = ChatMachineContext.useSelector((state) =>
    state.matches("chatFlow.idle")
  );

  const goalTopic = ChatMachineContext.useSelector(
    (state) => state.context.user.topic
  );

  const onSubmit: SubmitHandler<Prompt> = useCallback(
    ({ user, goal, context }) => {
      setTimeout(() => {
        setChangeInterface(true);
      }, 180);

      actorRef.send({
        type: "SET_GOAL",
        goal: `User: 'is ${user}'. Context: '${context}'. Goal: '${goal}'`,
        topic: goal,
      });
    },
    [actorRef]
  );

  if (changeInterface || !idle) {
    return (
      <div
        className="text-neutral-400 italic !font-normal w-full
                   top-4 p-4 items-center justify-between
                   text-lg rounded-xl bg-gray-light/60
                   flex sticky z-10 border border-gray-light-secondary
                   backdrop-blur"
      >
        <div className="px-4">
          {goalTopic &&
            goalTopic!.charAt(0).toUpperCase() + goalTopic!.slice(1)}
        </div>
        <button
          type="button"
          id="forward"
          onClick={() => {
            send({ type: "PERSIST_GOAL" });
          }}
          className="flex items-center justify-center h-8 gap-1 p-3 text-sm font-medium bg-white border rounded-lg text-dark border-gray-light-secondary"
        >
          Forward to next step
          <ChevronRight height={16} width={16} />
        </button>
      </div>
    );
  }

  return (
    <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
      <div>
        <div className="flex flex-col gap-4">
          <div className="flex gap-4">
            <TextField
              label="You"
              className="grow"
              placeholder="ex: Student from 11 grade"
              {...register("user")}
            />
            <TextField
              label="Goal"
              className="grow"
              placeholder="ex: get job at top agency"
              {...register("goal")}
            />
          </div>
          <TextAreaField
            label="Context"
            placeholder="Describe your situation (experience with habit, 
            why you can stick with habit)"
            {...register("context")}
            className=""
          />
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="submit"
          className="flex items-center justify-center h-8 p-3 font-medium text-white bg-black rounded-lg"
        >
          Submit
        </button>
      </div>

      {errors.goal && (
        <div className="px-3 py-1 text-sm duration-150 ease-in-out border border-red-500 outline-none bg-red-500/70 rounded-xl text-light backdrop-blur-sm">
          {errors.goal.message}
        </div>
      )}
    </form>
  );
};
