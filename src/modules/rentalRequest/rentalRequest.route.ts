import { Router } from "express";
import { rentalRequestController } from "./rentalRequest.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", auth(Role.ADMIN), rentalRequestController.getAllRentalRequest);
router.get(
  "/my-rental",
  auth(Role.LANDLORD),
  rentalRequestController.getMyRenalRequest,
);
router.get(
  "/my-request",
  auth(Role.TENANT),
  rentalRequestController.getMyRequest,
);
router.post(
  "/:propertyId",
  auth(Role.TENANT),
  rentalRequestController.createRentalRequest,
);

router.put(
  "/:requestId/status",
  auth(Role.LANDLORD),
  rentalRequestController.updateRentalRequestStatus,
);

export const rentalRequestRouter = router;
