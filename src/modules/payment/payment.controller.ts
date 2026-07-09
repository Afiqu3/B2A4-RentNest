import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createPaymentUrl = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const tenantId = req.user?.id as string;
    const rentalRequestId = req.params?.rentalRequestId as string;

    const result = await paymentService.createPaymentUrlForStripe(
      rentalRequestId,
      tenantId,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Checkout completed successfully",
      data: result,
    });
  },
);

export const paymentCOntroller = {
  createPaymentUrl,
};
