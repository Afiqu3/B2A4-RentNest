import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { propertyService } from "./property.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const landlordId = req.user?.id as string;
    const payload = req.body;

    const result = await propertyService.createPropertyIntoDB(
      landlordId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "New Property Created Successfully",
      data: result,
    });
  },
);

const updateProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params?.propertyId as string;
    const landlordId = req.user?.id as string;
    const payload = req.body;

    const result = await propertyService.updatePropertyIntoDB(
      propertyId,
      landlordId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property updated successfully",
      data: result,
    });
  },
);

const deleteProperty = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const propertyId = req.params?.propertyId as string;
    const landlordId = req.user?.id as string;

    await propertyService.deletePropertyFromDB(propertyId, landlordId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Property deleted successfully",
      data: null,
    });
  },
);

export const propertyController = {
  createProperty,
  updateProperty,
  deleteProperty,
};
