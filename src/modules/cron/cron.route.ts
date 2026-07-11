import { Router } from "express";
import { rentalRequestService } from "../rentalRequest/rentalRequest.service";

const router = Router();

router.get("/expire-rentals", async (req, res, next) => {
  try {
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret) {
      const authHeader = req.headers.authorization;
      if (authHeader !== `Bearer ${cronSecret}`) {
        res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
        return;
      }
    }

    const result = await rentalRequestService.expireOverdueRentals();

    res.status(200).json({
      success: true,
      message: "Overdue rentals processed successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export const cronRouter = router;
