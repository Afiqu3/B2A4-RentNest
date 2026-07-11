import { z } from "zod";
import { PropertyStatus } from "../../../generated/prisma/enums";
import { PropertyWhereInput } from "../../../generated/prisma/models";
import {
  createPropertySchema,
  updatePropertySchema,
} from "./property.validation";

export type IProperty = z.infer<typeof createPropertySchema>;
export type IPropertyUpdate = z.infer<typeof updatePropertySchema>;

export interface IPropertyQuery extends PropertyWhereInput {
  searchTerm?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
}
