"use client";

import { Calendar, Day } from "./calendar";

import { useUser } from "@clerk/nextjs";
import clsx from "clsx";
import Image from "next/image";
import Button from "./button";

export type MessageProps = {
  type: "user" | "assistant";
  id: string;
  message: React.ReactNode;
  error?: string;
};

export function Wrapper({ message, type, error }: MessageProps) {
  const { user } = useUser();

  if (error) {
    return (
      <div className="flex flex-row gap-3 px-3 py-5 text-sm duration-150 ease-in-out border border-red-500 outline-none rounded-xl bg-red-500/70 text-light backdrop-blur-sm">
        <div
          className="flex w-8 h-8 mr-0 rounded-full shrink-0 grow-0"
          style={{
            background:
              "radial-gradient(70.71% 70.71% at 50% 50%, #A3A9FE 0%, #757FF9 36.25%, #1E2BEC 73.23%, #0010FD 100%)",
          }}
        />
        <p className="flex pt-1 text-base break-all">Error in server</p>
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "px-3 py-5 flex flex-row gap-3 items-start border-t border-gray-light-secondary w-full overflow-clip",
        type === "user" && "bg-light-secondary"
      )}
    >
      {type === "user" ? (
        <Image
          src={user?.imageUrl}
          alt="user_image"
          className="rounded-full"
          width={32}
          height={32}
        />
      ) : (
        <div
          className="flex w-8 h-8 mr-0 rounded-full shrink-0 grow-0"
          style={{
            background:
              "radial-gradient(70.71% 70.71% at 50% 50%, #A3A9FE 0%, #757FF9 36.25%, #1E2BEC 73.23%, #0010FD 100%)",
          }}
        />
      )}
      <div className="flex flex-col gap-3 grow">
        {typeof message === "string" ? (
          <p className="flex pt-1 text-base break-words whitespace-pre-line">
            {message}
          </p>
        ) : (
          message
        )}
      </div>
    </div>
  );
}

export interface CalendarMessageProps {
  days: Day[];
  onSchedule: () => void;
  loading?: boolean;
}

export function CalendarMessage({
  days,
  onSchedule,
  loading,
}: CalendarMessageProps) {
  return (
    <>
      <p>Here I tried to generate a calendar for you</p>
      <div className="flex bg-light-secondary rounded-xl">
        <Calendar.Wrapper>
          {days.map((day) => (
            <Calendar.Day {...day} key={day.date.toISOString()} />
          ))}
        </Calendar.Wrapper>
      </div>
      <p>Everything looks good?</p>
      <Button
        className="!bg-black"
        onClick={() => onSchedule()}
        loading={loading}
      >
        Add to calendar
      </Button>
    </>
  );
}

export const Message = { Wrapper, Calendar: CalendarMessage };
