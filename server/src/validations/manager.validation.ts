import { z } from "zod";

export const updateManagerSchema = z.object({
  reportingManager: z.string().nullable()
});

