import { prisma } from "../../lib/prisma";
import { IRentalRequest } from "./rentalRequest.interface";

const createRentalRequestFromDB = async (
  propertyId: string,
  tenantId: string,
  payload: IRentalRequest,
) => {
  const property = await prisma.property.findUniqueOrThrow({
    where: {
      id: propertyId,
    },
  });

  const result = await prisma.rentalRequest.create({
    data: {
      moveInDate: new Date(payload.moveInDate),
      durationMonths: payload.durationMonths,
      propertyId,
      tenantId,
    },
  });

  return result;
};

export const rentalRequestService = {
  createRentalRequestFromDB,
};
