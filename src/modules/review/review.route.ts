import { Router } from "express";
import { reviewController } from "./review.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewSchema } from "./review.validation";

const router = Router();

router.post(
  "/:rentalRequestId",
  auth(Role.TENANT),
  validateRequest(createReviewSchema),
  reviewController.createReview,
);

export const reviewRouter = router;
