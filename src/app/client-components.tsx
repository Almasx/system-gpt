"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { PanelLeftClose, PanelRightClose } from "lucide-react";
import { Suspense, useCallback, useState } from "react";
import {
  FormProvider,
  SubmitHandler,
  useForm,
  useFormContext,
} from "react-hook-form";

import { useAutoAnimate } from "@formkit/auto-animate/react";
import { zodResolver } from "@hookform/resolvers/zod";
import clsx from "clsx";
import { z } from "zod";
import Chat from "~/components/Chat";
import { Spinner } from "~/core/ui/spinner";
import TextAreaField from "~/core/ui/text-area";
import TextField from "~/core/ui/text-field";
import { ChatMachineContext } from "~/lib/machines/chatMachine";

export default function SystemGenerator({
  children,
}: {
  children: React.ReactNode;
}) {
  const methods = useForm<Prompt>({
    resolver: zodResolver(promptSchema),
  });

  const [parent] = useAutoAnimate({ easing: "ease-in-out", duration: 600 });
  const [layoutParent] = useAutoAnimate({
    easing: "ease-in-out",
    duration: 150,
  });
  const [showSideBar, setShowSideBar] = useState<boolean>(false);

  return (
    <div
      className={clsx("relative  bg-light-secondary", showSideBar && "pt-5")}
      ref={layoutParent}
    >
      {showSideBar && (
        <aside className="fixed left-0 z-40 flex flex-col w-64 h-[calc(100vh-20px)] gap-5 px-4 pt-1  top-5">
          <h2 className="flex items-center justify-between text-xl font-medium text-neutral-500">
            Goals
            <PanelLeftClose onClick={() => setShowSideBar(false)} />
          </h2>
          <div className="flex flex-col gap-3">
            <Suspense
              fallback={
                <Spinner className="w-full my-72 text-gray-light-secondary h-7 fill-neutral-500" />
              }
            >
              {children}
            </Suspense>
          </div>
          <div className="py-3 mt-auto">
            <UserButton afterSignOutUrl="/" />
          </div>
        </aside>
      )}
      <main
        className={clsx(
          "flex flex-col items-center h-screen gap-5 overflow-x-hidden bg-white border border-gray-light-secondary rounded-s-xl",
          showSideBar && "ml-64"
        )}
      >
        {!showSideBar && (
          <button className="fixed z-10 grid w-10 h-10 border rounded-lg text-neutral-500 place-items-center border-gray-light-secondary left-4 bottom-3">
            <PanelRightClose onClick={() => setShowSideBar((val) => !val)} />
          </button>
        )}
        <div className="max-w-[1024px]" ref={parent}>
          {!methods.formState.isSubmitted && (
            <h1 className="mt-64 mb-8 text-4xl">
              Lets start by defining your goal. This will help us create a
              habit-forming system tailored to your needs.
            </h1>
          )}
          <div className="flex flex-col gap-3 pb-32">
            <FormProvider {...methods}>
              <Form />
            </FormProvider>
            {methods.formState.isSubmitted && <Chat />}
          </div>
        </div>
      </main>
    </div>
  );
}

const promptSchema = z.object({
  goal: z.string(),
  user: z.string(),
  context: z.string(),
});

type Prompt = z.infer<typeof promptSchema>;

const Form = () => {
  const { userId } = useAuth();
  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useFormContext<Prompt>();

  const actorRef = ChatMachineContext.useActorRef();
  const [changeInterface, setChangeInterface] = useState(false);

  const onSubmit: SubmitHandler<Prompt> = useCallback(
    ({ user, goal, context }) => {
      if (userId) {
        setTimeout(() => {
          setChangeInterface(true);
        }, 180);

        actorRef.send({
          type: "SET_GOAL",
          goal: `The Problem, is """User is ${user}. ${context}. His goal is ${goal}"""`,
          userId,
        });
      }
    },
    [actorRef, userId]
  );

  if (changeInterface) {
    return (
      <div
        className=" text-dark/40 italic !font-normal w-full
             mt-24 p-4 grid place-items-center
             text-lg rounded-xl bg-gray-light"
      >
        {getValues("goal")}
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
        <div className="flex gap-3">
          {/* <Badge>Fitness</Badge>
        <Badge>Education</Badge>
        <Badge>Work</Badge> */}
        </div>
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
