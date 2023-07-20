import { Day, EventUI } from "~/components/calendar";

import { WorkBlock } from "~/types/work-block";
import { convertWorkBlocksUI } from "~/components/calendar";
import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);

// mock

export const generateData = () => {
  const workBlocks: WorkBlock[] = [];
  const startTime = [8, 0];
  const endTime = [10, 0];

  for (let i = 0; i < 30; i++) {
    for (let j = 0; j < 3; j++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      workBlocks.push({
        summary: `Event ${j + 1}`,
        description: `This is event ${j + 1}`,
        dayOfWeek: date.getDay(),
        start: `${startTime[0]}:${startTime[1]}`,
        end: `${endTime[0]}:${endTime[1]}`,
      });
      startTime[0] += 3;
      endTime[0] += 3;
    }
    startTime[0] = 8;
    endTime[0] = 10;
  }

  return workBlocks;
};

export const generateUIData = () => {
  return convertWorkBlocksUI(generateData());
};

// date

export function convertTimeToHoursAndMinutes(timeString: string) {
  const [hours, minutes] = timeString.split(":").map(Number);
  return { hours, minutes };
}

export function getNearestDayOfWeek(dayOfWeek: number) {
  const currentDay = new Date().getDay();
  const targetDay = dayOfWeek;
  const difference = (targetDay - currentDay + 7) % 7;

  const targetDate = new Date();
  targetDate.setDate(targetDate.getDate() + difference);

  return targetDate;
}

export function getWorkBlockDate(dayOfWeek: number, timeString: string) {
  const date = getNearestDayOfWeek(dayOfWeek);

  const workBlockTime = convertTimeToHoursAndMinutes(timeString);
  const tempDate = new Date(date);
  tempDate.setHours(workBlockTime.hours, workBlockTime.minutes);
  return tempDate;
}

export function convertEventsUI(workBlocks: WorkBlock[]): { days: Day[] } {
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

  const days = Array.from(dateEventMap.entries())
    .map(([date, events]) => ({
      date: new Date(date),
      events,
    }))
    .sort((a, b) => +a.date - +b.date);

  return {
    days,
  };
}
interface Position {
  x: number;
  y: number;
}

export function calculateSubnodePosition(
  parentNode: Position,
  subnodes: number,
  radius = 450,
  startAngle = 45
) {
  startAngle = startAngle * (Math.PI / 180);
  const angularSeparation = Math.PI / subnodes;
  const subnodePositions = [];
  for (let i = 0; i < subnodes; i++) {
    const angle = startAngle + i * angularSeparation;
    const x_subnode = parentNode.x + radius * Math.cos(angle);
    const y_subnode = parentNode.y + radius * Math.sin(angle);
    subnodePositions.push({ x: x_subnode, y: y_subnode });
  }
  return subnodePositions;
}
