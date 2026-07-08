import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { rentalRequestService } from "./rentalRequest.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createRentalRequest = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params?.propertyId as string;
    const tenantId = req.user?.id as string;
    const payload = req.body;

    const result = await rentalRequestService.createRentalRequestFromDB(
      propertyId,
      tenantId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Rental request submitted successfully",
      data: result,
    });
  },
);

export const rentalRequestController = {
  createRentalRequest,
};
