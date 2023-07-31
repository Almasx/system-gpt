import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { redis } from "~/lib/services/redis";
import Line from "../../../public/line.svg";
import { CreateJourney } from "./client-component";

export default async function Journeys() {
  const { userId } = auth();

  const journeysId: string[] = await redis.zrange(
    `user:${userId}:journeys`,
    0,
    -1,
    {
      rev: true,
    }
  );

  if (!journeysId.length) {
    return (
      <main className="flex flex-col items-center justify-center h-screen max-w-md mx-auto">
        <h1 className="mb-8 text-6xl italic font-medium text-center text-neutral-300">
          No Journeys...
        </h1>
        <p className="mb-12 text-center">
          {`Looks like you haven't embarked on any journeys just yet. Start by
          creating your first journey to achieve your goal. Let's build systems
          together!`}
        </p>
        <CreateJourney userId={userId!} />
      </main>
    );
  }

  return (
    <main className="relative flex flex-col items-center h-screen gap-5 overflow-clip">
      <div className="w-[1024px] py-32 z-10">
        <div className="flex justify-between mb-10">
          <h1 className="text-4xl font-semibold">Journeys</h1>
          <CreateJourney userId={userId!} />
        </div>
        <div className="grid grid-cols-3 gap-5">
          {journeysId.map((journeyId) => (
            <Suspense key={journeyId} fallback={"Loading..."}>
              <GoalCard journeyId={journeyId} />
            </Suspense>
          ))}
        </div>
      </div>
      <Image className="absolute inset-0" src={Line} alt="line" />
    </main>
  );
}

export const GoalCard = async ({ journeyId }: { journeyId: string }) => {
  console.log(journeyId);
  const journey = await redis.json.get(journeyId);
  if (journey) {
    return (
      <Link
        href={`/journeys/${journey.id}/chat`}
        className="flex flex-col border divide-y backdrop-blur rounded-xl border-gray-light-secondary divide-gray-light-secondary overflow-clip"
      >
        <header className="grid p-3 place-items-center bg-white/80">
          {journey.title || "No title yet..."}
        </header>
        <p className="p-4 text-sm bg-light-secondary/80">
          {journey.description ||
            `The journey of a thousand miles begins with a single click!
             Click the it to work on your journey and let your goals to be crushed.
             Your story awaits, and we can't wait to be a part of it!`}
        </p>
      </Link>
    );
  }
};
