import { Router } from "express";
import { rentalRequestController } from "./rentalRequest.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/:propertyId",
  auth(Role.TENANT),
  rentalRequestController.createRentalRequest,
);

export const rentalRequestRouter = router;
