import { z } from "zod";

export const workBlockSchema = z.object({
  summary: z.string(),
  description: z.string(),
  dayOfWeek: z.number(),
  start: z.string(),
  end: z.string(),
});

export type WorkBlock = z.infer<typeof workBlockSchema>;

export const workBlocksSchema = z.object({
  schedule: z.array(workBlockSchema),
});

export type WorkBlocks = z.infer<typeof workBlocksSchema>;
