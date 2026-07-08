import { PropertyStatus } from "../../../generated/prisma/enums";

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