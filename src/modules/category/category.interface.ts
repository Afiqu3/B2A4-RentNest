import { z } from "zod";
import { categorySchema } from "./category.validation";

export type ICategory = z.infer<typeof categorySchema>;
