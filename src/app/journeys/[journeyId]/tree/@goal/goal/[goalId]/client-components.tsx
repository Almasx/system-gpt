"use client";

import { Loader2, X } from "lucide-react";
import {
  selectGoalStatus,
  useTreeStatusStore,
} from "~/lib/hooks/useTreeStatus";

import { useRouter } from "next/navigation";
import { Skeleton } from "~/components/ui/skeleton";
import { Score } from "~/types/goal";

export const GoalScore = ({
  score,
  id,
}: {
  score: Score | null;
  id: string;
}) => {
  const status = useTreeStatusStore(selectGoalStatus(id));

  if (score) {
    <div className="flex gap-2 mb-8">
      <div className="p-1 text-xs uppercase bg-indigo-200 border border-indigo-500 rounded-md ">
        significance: {score.significance}
      </div>
      <div className="p-1 text-xs uppercase bg-green-200 border border-green-500 rounded-md">
        relevance: {score.relevance}
      </div>
      <div className="p-1 text-xs uppercase bg-yellow-200 border border-yellow-500 rounded-md">
        complexity: {score.complexity}
      </div>
    </div>;
  }

  if (status === "calculateScore") {
    return (
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
    );
  }
};

export const GoalContext = ({
  context,
  id,
}: {
  context: string | null;
  id: string;
}) => {
  const status = useTreeStatusStore(selectGoalStatus(id));

  if (context) {
    return context;
  }

  if (status === "messageEnrich") {
    return <Loader2 className="m-auto h-7 w-7 animate-spin text-neutral-300" />;
  }
};

export const BackButton = ({ journeyId }: { journeyId: string }) => {
  const { push } = useRouter();
  return (
    <X
      className="absolute top-5 right-5 text-neutral-300"
      onClick={() => push(`/journeys/${journeyId}/tree`)}
    />
  );
};
