import { prisma } from "../../lib/prisma";
import {
  IRentalRequest,
  IRentalRequestUpdate,
} from "./rentalRequest.interface";

const createRentalRequestIntoDB = async (
  propertyId: string,
  tenantId: string,
  payload: IRentalRequest,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const property = await tx.property.findUniqueOrThrow({
      where: {
        id: propertyId,
      },
    });

    const result = await tx.rentalRequest.create({
      data: {
        moveInDate: new Date(payload.moveInDate),
        durationMonths: payload.durationMonths,
        propertyId,
        tenantId,
      },
    });

    await tx.payment.create({
      data: {
        amount: property.rentAmount,
        rentalRequestId: result.id,
        tenantId: tenantId,
      },
    });
    return result;
  });

  return transactionResult;
};

const updateRentalRequestStatusIntoDB = async (
  landlordId: string,
  requestId: string,
  payload: IRentalRequestUpdate,
) => {
  const request = await prisma.rentalRequest.findUniqueOrThrow({
    where: {
      id: requestId,
    },
    include: {
      property: true,
    },
  });

  if (request.property.landlordId !== landlordId) {
    throw new Error("You are not allowed to update this request");
  }

  const result = await prisma.rentalRequest.update({
    where: {
      id: requestId,
    },
    data: {
      status: payload.status,
    },
  });

  return result;
};

const getAllRentalRequestFromDB = async () => {
  const result = await prisma.rentalRequest.findMany();

  return result;
};

const getMyRenalRequestFromDB = async (landlordId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      property: {
        landlordId,
      },
    },
    include: {
      property: true,
      tenant: {
        select: {
          name: true,
          email: true,
          phone: true,
        },
      },
    },
  });

  return result;
};

const getMyRequestFromDB = async (tenantId: string) => {
  const result = await prisma.rentalRequest.findMany({
    where: {
      tenantId,
    },
    include: {
      property: true,
    },
  });

  return result;
};

export const rentalRequestService = {
  createRentalRequestIntoDB,
  updateRentalRequestStatusIntoDB,
  getAllRentalRequestFromDB,
  getMyRenalRequestFromDB,
  getMyRequestFromDB,
};
