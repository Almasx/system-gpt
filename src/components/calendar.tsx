import { getNearestDayOfWeek, getWorkBlockDate } from "~/lib/utils";

import { WorkBlock } from "~/types/work-block";

interface Wrapper {
  children: React.ReactNode;
}

function Wrapper({ children }: Wrapper) {
  return (
    <div className="grid bg-light-secondary rounded-xl grid-flow-col auto-cols-[191px] overflow-x-auto w-[954px]">
      {children}
    </div>
  );
}

export interface Day {
  date: Date;
  events: EventUI[];
}

function Day({ date, events }: Day) {
  return (
    <div className="flex flex-col col-span-1">
      <div className="grid h-16 text-sm border-b place-items-center border-gray-light-secondary">
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
      </div>
      <div className="flex flex-col gap-6 px-2 py-3 pb-6 border-r border-gray-light-secondary grow">
        {events.map((event) => (
          <Event
            key={event.start.toISOString() + event.end.toISOString()}
            {...event}
          />
        ))}
      </div>
    </div>
  );
}

export interface EventUI {
  summary: string;
  description: string;
  start: Date;
  end: Date;
}

function Event({ summary, description, start, end }: EventUI) {
  return (
    <div className="relative flex flex-col gap-2 p-3 pb-6 bg-sky-200 rounded-xl">
      <div className="absolute bottom-0 p-1 px-2 text-xs translate-y-1/2 border rounded-md text-semibold bg-light border-gray-light-secondary left-3">
        {start.toLocaleTimeString("en-us", {
          hour: "2-digit",
          minute: "2-digit",
        })}{" "}
        -{" "}
        {end.toLocaleTimeString("en-us", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </div>
      <h6 className="text-sm font-semibold text-sky-800">{summary}</h6>
      <p className="text-xs font-light text-slate-800">{description}</p>
    </div>
  );
}

export function convertWorkBlocksUI(workBlocks: WorkBlock[]) {
  const dateEventMap: Map<string, EventUI[]> = new Map();

  for (let index = 0; index < workBlocks.length; index++) {
    const workBlock = workBlocks[index];

    const date = getNearestDayOfWeek(workBlock.dayOfWeek);
    const dateKey = date.toISOString().split("T")[0];

    const startDate = getWorkBlockDate(workBlock.dayOfWeek, workBlock.start);
    const endDate = getWorkBlockDate(workBlock.dayOfWeek, workBlock.end);

    const convertedEvent: EventUI = {
      ...workBlock,
      start: startDate,
      end: endDate,
    };

    if (dateEventMap.has(dateKey)) {
      dateEventMap.get(dateKey)!.push(convertedEvent);
    } else {
      dateEventMap.set(dateKey, [convertedEvent]);
    }
  }

  const days = Array.from(dateEventMap.entries()).map(([date, events]) => ({
    date: new Date(date),
    events,
  }));

  return {
    days,
  };
}

export const Calendar = { Wrapper, Day, Event };
export default Wrapper;
