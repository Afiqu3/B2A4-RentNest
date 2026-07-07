import { prisma } from "../../lib/prisma";
import { ICreateCategory } from "./category.interface";

const createCategoryIntoDB = async (payload: ICreateCategory) => {
  const result = await prisma.category.create({
    data: {
      ...payload,
    },
  });

  return result;
};

const getAllCategoryFromDB = async () => {
  const result = await prisma.category.findMany();

  return result;
};

export const categoryService = {
  createCategoryIntoDB,
  getAllCategoryFromDB,
};
