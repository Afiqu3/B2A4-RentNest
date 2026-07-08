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

const updatePropertyIntoDB = async (
  propertyId: string,
  landlordId: string,
  payload: IProperty,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  if (property.landlordId !== landlordId) {
    throw new Error("You are not the owner of this property!");
  }

  const result = await prisma.property.update({
    where: {
      id: propertyId,
    },
    data: {
      ...payload,
    },
    include: {
      category: true,
    },
  });

  return result;
};

const deletePropertyFromDB = async (propertyId: string, landlordId: string) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  if (property.landlordId !== landlordId) {
    throw new Error("You are not the owner of this property!");
  }

  await prisma.property.delete({
    where: {
      id: propertyId,
    },
  });
};

export const propertyService = {
  createPropertyIntoDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
};
