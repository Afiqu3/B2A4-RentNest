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

const getPropertyByIdFromDB = async (propertyId: string) => {
  const result = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  if (result.status !== "AVAILABLE") {
    throw new Error("Property is not Available!");
  }

  return result;
};

const getAllMyPropertyFromDB = async (landlordId: string) => {
  const result = await prisma.property.findMany({
    where: {
      landlordId,
    },
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return result;
};

export const propertyService = {
  createPropertyIntoDB,
  updatePropertyIntoDB,
  deletePropertyFromDB,
  getPropertyByIdFromDB,
  getAllMyPropertyFromDB,
};
