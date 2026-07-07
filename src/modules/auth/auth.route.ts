import { Router } from "express";
import { authController } from "./auth.controller";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/register", authController.registerUser);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.refreshToken);
router.get(
  "/me",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  authController.getMyProfile,
);
router.patch(
  "/my-profile",
  auth(Role.TENANT, Role.LANDLORD, Role.ADMIN),
  authController.updateProfile,
);
router.get("/users", auth(Role.ADMIN), authController.getAllUser);

export const authRouter = router;
