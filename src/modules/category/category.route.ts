import { Router } from "express";
import { auth } from "../../middlewares/auth";
import { Role } from "../../../generated/prisma/enums";
import { categoryController } from "./category.controller";

const router = Router();

router.post("/", auth(Role.ADMIN), categoryController.createCategory);
router.get(
  "/",
  auth(Role.ADMIN, Role.LANDLORD),
  categoryController.getAllCategory,
);
router.put("/:categoryId", auth(Role.ADMIN), categoryController.updateCategory);

export const categoryRouter = router;
