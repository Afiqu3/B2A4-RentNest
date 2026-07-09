import { prisma } from "../../lib/prisma";
import { IReview } from "./review.interface";

const createReviewIntoDB = async (
  tenantId: string,
  rentalRequestId: string,
  payload: IReview,
) => {
  const transactionResult = await prisma.$transaction(async (tx) => {
    const rentalRequest = await tx.rentalRequest.findUniqueOrThrow({
      where: {
        id: rentalRequestId,
        tenantId,
      },
    });

    if (rentalRequest?.status !== "COMPLETED") {
      throw new Error("You are not allowed to review yet!");
    }

    const result = await tx.review.create({
      data: {
        tenantId,
        propertyId: rentalRequest.propertyId,
        rentalRequestId,
        ...payload,
      },
    });

    return result;
  });

  return transactionResult;
};

export const reviewService = {
  createReviewIntoDB,
};
