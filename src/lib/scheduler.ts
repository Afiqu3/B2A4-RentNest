import cron from "node-cron";
import { rentalRequestService } from "../modules/rentalRequest/rentalRequest.service";

/**
 * Registers recurring background jobs.
 * - expireOverdueRentals: runs daily at 00:05 to mark ACTIVE rentals whose
 *   endDate has passed as COMPLETED and free their properties (AVAILABLE).
 */
export const startScheduledJobs = () => {
  // Every day at 00:05
  cron.schedule("5 0 * * *", async () => {
    try {
      const result = await rentalRequestService.expireOverdueRentals();
      console.log(
        `[cron] expireOverdueRentals: scanned ${result.scanned}, completed ${result.completed}`,
      );
    } catch (error) {
      console.error("[cron] expireOverdueRentals failed:", error);
    }
  });

  console.log("Scheduled jobs registered.");
};
