import { prisma } from "../../lib/prisma";
import {
  IRentalRequest,
  IRentalRequestUpdate,
} from "./rentalRequest.interface";

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
        }
    });
};

export const rentalRequestService = {
  createRentalRequestFromDB,
  updateRentalRequestStatusIntoDB,
  getAllRentalRequestFromDB,
  getMyRenalRequestFromDB,
};


// const getPropertyWithRequests = async (propertyId: string) => {
//   const result = await prisma.property.findUnique({
//     where: { id: propertyId },
//     include: {
//       rentalRequests: true,
//     },
//   });

//   return result;
// };

// const getMyRentalRequests = async (tenantId: string) => {
//   return prisma.rentalRequest.findMany({
//     where: { tenantId },
//     include: {
//       property: {
//         include: {
//           landlord: {
//             select: { id: true, name: true, email: true },
//           },
//         },
//       },
//     },
//     orderBy: { createdAt: "desc" },
//   });
// };