import { BackButton, GoalContext, GoalScore } from "./client-components";

import { redis } from "~/lib/services/redis";
import { PersistedGoal } from "~/types/goal";

export default async function Goal({
  params,
}: {
  params: { goalId: string; journeyId: string };
}) {
  const goal = (
    await redis.json.get(`journey:${params.journeyId}`, `$..${params.goalId}`)
  )[0] as PersistedGoal;

  return (
    <aside className="fixed right-0 z-40 w-96 h-[calc(100vh-20px)] gap-5 px-4 pt-1 top-5 overflow-y-auto">
      <h2 className="flex items-center justify-between mb-3 text-4xl font-medium">
        {goal.topic}
      </h2>
      <BackButton journeyId={params.journeyId} />
      <p className="mb-3 text-xl font-medium text-neutral-400">
        {goal.description}
      </p>

      <GoalScore id={goal.id} score={goal.meta.score} />
      <section>
        <header className="mb-3 text-2xl italic text-neutral-400">
          Context
        </header>
        <p className="p-4 text-base break-words whitespace-pre-line bg-white border rounded-xl border-gray-light-secondary">
          <GoalContext id={goal.id} context={goal.meta.context} />
        </p>
      </section>
    </aside>
  );
}
