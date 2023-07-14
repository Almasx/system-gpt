import "server-only";

import { WorkBlock } from "~/types/work-block";
import { clerkClient } from "@clerk/nextjs";
import { getWorkBlockDate } from "../utils";
import { google } from "googleapis";

export async function createShedule(workBlocks: WorkBlock[], userId: string) {
  const accessToken = await clerkClient.users.getUserOauthAccessToken(
    userId,
    "oauth_google"
  );
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({
    access_token: accessToken[0].token,
  });
  const calendar = google.calendar({
    version: "v3",
    auth: oauth2Client,
  });

  const responses = [];

  for (let index = 0; index < workBlocks.length; index++) {
    const workBlock = workBlocks[index];

    const startDate = getWorkBlockDate(workBlock.dayOfWeek, workBlock.start);
    const endDate = getWorkBlockDate(workBlock.dayOfWeek, workBlock.end);

    const event = {
      summary: workBlock.summary,
      description: workBlock.description,
      start: {
        dateTime: startDate.toISOString(),
        timeZone: "Asia/Almaty",
      },
      end: {
        dateTime: endDate.toISOString(),
        timeZone: "Asia/Almaty",
      },
    };

    await new Promise((resolve) => setTimeout(resolve, 200));

    const response = await calendar.events.insert({
      auth: oauth2Client,
      calendarId: "primary",
      requestBody: event,
    });

    responses.push(response);
  }

  return "Done";
}
