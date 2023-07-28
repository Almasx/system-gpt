import { useRouter } from "next/router";
import { create } from "./journey.actions";

export const CreateJourney = () => {
  const { push } = useRouter();

  const newJourney = async () => {
    const id = await create();
    push(`/journeys/${id}`);
  };

  return (
    <button
      onClick={newJourney}
      className="px-4 py-2 text-white bg-blue-700 shadow rounded-xl "
    >
      Start new journey
    </button>
  );
};
