"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
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
        <div className="flex gap-2 mb-8">
          <div className="p-1 text-xs uppercase bg-indigo-200 border border-indigo-500 rounded-md ">
            priority: {goal.meta.score.priority}
          </div>
          <div className="p-1 text-xs uppercase bg-green-200 border border-green-500 rounded-md">
            relevance: {goal.meta.score.relevance}
          </div>
          <div className="p-1 text-xs uppercase bg-yellow-200 border border-yellow-500 rounded-md">
            complexity: {goal.meta.score.complexity}
          </div>
        </div>

        <section>
          <header className="mb-3 text-2xl italic text-neutral-400">
            Context
          </header>
          <p className="p-4 text-base break-words whitespace-pre-line bg-white border rounded-xl border-gray-light-secondary">
            {goal.meta.context}
          </p>
        </section>
      </aside>
    );
  }

  return "Loading...";
}
