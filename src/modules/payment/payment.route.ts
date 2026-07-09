import { Router } from "express";
import { paymentController } from "./payment.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/checkout/:rentalRequestId",
  auth(Role.TENANT),
  paymentController.createPaymentUrl,
);

router.post("/confirm", paymentController.handleWebhook);

export const paymentRouter = router;
