import { PropertyStatus } from "../../../generated/prisma/enums";
import { PropertyWhereInput } from "../../../generated/prisma/models";

export interface IProperty {
  title: string;
  description: string;
  location: string;
  address: string;
  rentAmount: number;
  bedrooms: number;
  bathrooms: number;
  areaSquareFt?: number;
  amenities: string[];
  status?: PropertyStatus;
  categoryId: string;
}

export interface IPropertyUpdate {
  title?: string;
  description?: string;
  location?: string;
  address?: string;
  rentAmount?: number;
  bedrooms?: number;
  bathrooms?: number;
  areaSquareFt?: number;
  amenities?: string[];
  status?: PropertyStatus;
  categoryId?: string;
}

export interface IPropertyQuery extends PropertyWhereInput {
  searchTerm?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
  limit?: string;
  sortOrder?: string;
  sortBy?: string;
}
