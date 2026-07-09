import { Router } from "express";
import { paymentCOntroller } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/checkout/:rentalRequestId",
  auth(Role.TENANT),
  paymentCOntroller.createPaymentUrl,
);

export const paymentRouter = router;
