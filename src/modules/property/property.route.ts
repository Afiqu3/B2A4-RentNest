import { Router } from "express";
import { propertyController } from "./property.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", auth(Role.ADMIN), propertyController.getAllProperty);
router.get(
  "/my-properties",
  auth(Role.LANDLORD),
  propertyController.getAllMyProperty,
);
router.get("/available", propertyController.getAllAvailableProperty);

router.post("/", auth(Role.LANDLORD), propertyController.createProperty);

router.get("/:propertyId", propertyController.getPropertyById);
router.patch(
  "/:propertyId",
  auth(Role.LANDLORD),
  propertyController.updateProperty,
);
router.delete(
  "/:propertyId",
  auth(Role.LANDLORD),
  propertyController.deleteProperty,
);

export const propertyRouter = router;
