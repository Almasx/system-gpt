import { auth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { redis } from "~/lib/services/redis";
import { Journey } from "~/types/journey";
import Line from "../../../public/line.svg";
import { CreateJourney } from "./client-component";

export default async function Journeys() {
  const { userId } = auth();
  const pipeline = redis.pipeline();
  const journeysId: string[] = await redis.zrange(
    `user:${userId}:journeys`,
    0,
    -1,
    {
      rev: true,
    }
  );

  for (const journeyId of journeysId) {
    pipeline.hgetall(journeyId);
  }
  console.log(journeysId);

  const journeys: Journey[] =
    journeysId.length > 0 ? await pipeline.exec() : [];

  if (userId) {
    return (
      <main className="relative flex flex-col items-center h-screen gap-5 overflow-clip">
        <div className="w-[1024px] py-32 z-10">
          <div className="flex justify-between mb-10">
            <h1 className="text-4xl font-bold">Journeys</h1>
            <CreateJourney userId={userId} />
          </div>
          <div className="grid grid-cols-3 gap-5">
            {journeys.map((journey) => (
              <GoalCard key={journey.id} journey={journey} />
            ))}
          </div>
        </div>
        <Image className="absolute inset-0" src={Line} alt="line" />
      </main>
    );
  }
}

export const GoalCard = ({ journey }: { journey: Journey }) => {
  return (
    <Link
      href={`dd`}
      className="flex flex-col border divide-y backdrop-blur rounded-xl border-gray-light-secondary divide-gray-light-secondary overflow-clip"
    >
      <header className="grid p-3 place-items-center bg-white/80">
        {journey.title}
      </header>
      <p className="p-4 text-sm bg-light-secondary/80">{journey.description}</p>
    </Link>
  );
};
