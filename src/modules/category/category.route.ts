import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { categorySchema } from "./category.validation";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN),
  validateRequest(categorySchema),
  categoryController.createCategory,
);
router.get(
  "/",
  auth(Role.ADMIN, Role.LANDLORD, Role.TENANT),
  categoryController.getAllCategory,
);
router.put(
  "/:categoryId",
  auth(Role.ADMIN),
  validateRequest(categorySchema),
  categoryController.updateCategory,
);
router.delete(
  "/:categoryId",
  auth(Role.ADMIN),
  categoryController.deleteCategory,
);

export const categoryRouter = router;
