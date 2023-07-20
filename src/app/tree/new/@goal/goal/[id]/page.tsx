"use client";

import { Loader2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { Skeleton } from "~/core/ui/skeleton";
import { selectGoalById, useTreeStore } from "~/lib/hooks/useTree";

export default function Goal({ params }: { params: { id: string } }) {
  const { back } = useRouter();
  const goal = useTreeStore(selectGoalById(params.id));

  if (goal) {
    return (
      <aside className="fixed right-0 z-40 w-96 h-[calc(100vh-20px)] gap-5 px-4 pt-1 top-5 overflow-y-auto">
        <h2 className="flex items-center justify-between mb-3 text-4xl font-medium">
          {goal.topic}
        </h2>
        <X
          className="absolute top-5 right-5 text-neutral-300"
          onClick={() => back()}
        />
        <p className="mb-3 text-xl font-medium text-neutral-400">
          {goal.description}
        </p>

        {goal.status === "calculateScore" ? (
          <div className="flex gap-2 mb-8">
            <div className="p-1 text-xs uppercase bg-indigo-200 border border-indigo-500 rounded-md ">
              priority: {goal.meta.score!.priority}
            </div>
            <div className="p-1 text-xs uppercase bg-green-200 border border-green-500 rounded-md">
              relevance: {goal.meta.score!.relevance}
            </div>
            <div className="p-1 text-xs uppercase bg-yellow-200 border border-yellow-500 rounded-md">
              complexity: {goal.meta.score!.complexity}
            </div>
          </div>
        ) : (
          <div className="flex gap-2 mb-8">
            {Array(3)
              .fill(undefined)
              .map((_, index) => (
                <Skeleton
                  className="w-[100px] h-[20px] rounded-full bg-neutral-300"
                  key={`badge-${index}`}
                />
              ))}
          </div>
        )}

        <section>
          <header className="mb-3 text-2xl italic text-neutral-400">
            Context
          </header>
          <p className="p-4 text-base break-words whitespace-pre-line bg-white border rounded-xl border-gray-light-secondary">
            {goal.status === "messageEnrich" ? (
              goal.meta.context
            ) : (
              // eslint-disable-next-line react/jsx-no-undef
              <Loader2 className="m-auto h-7 w-7 animate-spin text-neutral-300" />
            )}
          </p>
        </section>
      </aside>
    );
  }

  return "Loading...";
}
