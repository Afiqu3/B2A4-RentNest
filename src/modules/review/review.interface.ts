export interface IReview {
  rating: number;
  comment?: string;
}

// import { z } from "zod";
// import { createReviewSchema } from "./review.validation";

// export type IReview = z.infer<typeof createReviewSchema>;