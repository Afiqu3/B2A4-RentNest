import { z } from "zod";

export const createReviewSchema = z.object({
  rating: z
    .number()
    .int("rating must be a whole number")
    .min(1, "rating must be at least 1")
    .max(5, "rating must be at most 5"),
  comment: z.string().max(1000).optional(),
});
