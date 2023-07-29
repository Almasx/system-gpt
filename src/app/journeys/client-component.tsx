"use client";

import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useZact } from "zact/client";
import { Modal } from "~/components/ui/modal";
import { create } from "./journey.actions";

export const CreateJourney = ({ userId }: { userId: string }) => {
  const { push } = useRouter();
  const { mutate, isLoading, data: id } = useZact(create);

  useEffect(() => {
    id && push(`/journeys/${id}`);
  }, [id, push]);

  return (
    <button
      onClick={() => mutate({ userId })}
      className="px-4 py-2 text-white bg-blue-700 shadow rounded-xl "
    >
      Start new journey
      <Modal.Root visible={isLoading}>
        <div className="flex items-center gap-4 px-8 py-6 bg-white border rounded-xl border-gray-light-secondary">
          <Loader2 className="w-4 h-4 animate-spin " /> Creating new Journey...
        </div>
      </Modal.Root>
    </button>
  );
};
