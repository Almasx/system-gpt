import { Day, EventUI } from "~/components/calendar";
import {
  BASE,
  COMPLEXITY_WEIGHT,
  RELEVANCE_WEIGHT,
  SIGNIFICANCE_WEIGHT,
  THRESHOLD,
} from "./constants";

import { customAlphabet } from "nanoid";
import { WorkBlock } from "~/types/work-block";

export const nanoid = customAlphabet(
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
  7
);

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

const foldLine = (input: string) => {
  return input.replace(/(.{75})/g, "$1\r\n ");
};

const generateEvent = (event: WorkBlock) => {
  const startDate = getWorkBlockDate(event.dayOfWeek, event.start);
  const endDate = getWorkBlockDate(event.dayOfWeek, event.end);

  return foldLine(
    `BEGIN:VEVENT\r\nUID:${startDate.getTime()}@yourproduct.com\r\n` +
      `DTSTAMP:${
        startDate.toISOString().replace(/[-:]/g, "").split(".")[0]
      }Z\r\n` +
      `DTSTART:${
        startDate.toISOString().replace(/[-:]/g, "").split(".")[0]
      }Z\r\n` +
      `DTEND:${endDate.toISOString().replace(/[-:]/g, "").split(".")[0]}Z\r\n` +
      `SUMMARY:${event.summary}\r\nDESCRIPTION:${event.description}\r\nEND:VEVENT`
  );
};

export const downloadICS = (events: WorkBlock[]) => {
  const icsEvents = events.map(generateEvent).join("\r\n");
  const icsContent =
    `BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Your Product//EN\r\n` +
    `${icsEvents}\r\nEND:VCALENDAR`;

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "events.ics";
  a.click();
};

interface Position {
  x: number;
  y: number;
}

export function calculateSubnodePosition(
  parentNode: Position,
  subnodes: number,
  nodeWidth = 350,
  nodeHeight = 180,
  horizontalGap = 150,
  verticalGap = 150
) {
  const subnodePositions = [];

  // The first child is positioned directly below the parent and centered
  const totalWidth = subnodes * nodeWidth + (subnodes - 1) * horizontalGap;
  const firstChildX = parentNode.x - totalWidth / 2 + nodeWidth / 2; // Centered
  const firstChildY = parentNode.y + nodeHeight + verticalGap;

  for (let i = 0; i < subnodes; i++) {
    // Compute the position for this child
    const x_subnode = firstChildX + i * (nodeWidth + horizontalGap);
    const y_subnode = firstChildY;

    subnodePositions.push({ x: x_subnode, y: y_subnode });
  }

  return subnodePositions;
}

export const calculateChildren = (
  priority: number,
  relevance: number,
  complexity: number,
  depth: number
) => {
  const score =
    SIGNIFICANCE_WEIGHT * priority * 0.1 +
    RELEVANCE_WEIGHT * relevance * 0.1 +
    COMPLEXITY_WEIGHT * complexity * 0.1;
  const discount_factor = BASE ** depth;
  const discounted_score = score * discount_factor;
  const number_of_children = discounted_score / THRESHOLD;
  return Math.round(number_of_children);
};
