import { z } from "zod";
import { ActiveStatus, Role } from "../../../generated/prisma/enums";

export const registerUserSchema = z.object({
  name: z.string().trim().min(2, "name must be at least 2 characters").max(100),
  email: z.email("invalid email address"),
  password: z
    .string()
    .min(4, "password must be at least 4 characters")
    .max(100),
  phone: z
    .string()
    .trim()
    .min(10, "phone must be at least 10 characters")
    .max(15),
  role: z.enum([Role.TENANT, Role.LANDLORD]).optional(),
});

export const loginUserSchema = z.object({
  email: z.email("invalid email address"),
  password: z
    .string()
    .min(4, "password must be at least 4 characters")
    .max(100),
});

export const updateProfileSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "name must be at least 2 characters")
      .max(100)
      .optional(),
    phone: z
      .string()
      .trim()
      .min(10, "phone must be at least 10 characters")
      .max(15)
      .optional(),
  })
  .refine((data) => data.name !== undefined || data.phone !== undefined, {
    message: "at least one field is required",
  });

export const updateActiveStatusSchema = z.object({
  activeStatus: z.enum(ActiveStatus),
});
