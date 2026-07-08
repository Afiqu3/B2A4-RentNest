import { prisma } from "../../lib/prisma";
import { IProperty } from "./property.interface";

const createPropertyIntoDB = async (landlordId: string, payload: IProperty) => {
  const result = await prisma.property.create({
    data: {
      landlordId,
      ...payload,
    },
    include: {
      category: true,
    },
  });

  return result;
};

export const propertyService = {
  createPropertyIntoDB,
};
