import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { categoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;

    const result = await categoryService.createCategoryIntoDB(payload);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.CREATED,
      message: "Category Created Successfully",
      data: result,
    });
  },
);

const getAllCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const result = await categoryService.getAllCategoryFromDB();

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Categories retrieved successfully",
      data: result,
    });
  },
);

const updateCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params?.categoryId as string;
    const payload = req.body;

    const updatedCategory = await categoryService.updateCategoryIntoDB(
      categoryId,
      payload,
    );

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category name updated successfully",
      data: updatedCategory,
    });
  },
);

const deleteCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categoryId = req.params?.categoryId as string;
    await categoryService.deleteCategoryFromDB(categoryId);

    sendResponse(res, {
      success: true,
      statusCode: httpStatus.OK,
      message: "Category deleted successfully",
      data: null,
    });
  },
);

export const categoryController = {
  createCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
};
