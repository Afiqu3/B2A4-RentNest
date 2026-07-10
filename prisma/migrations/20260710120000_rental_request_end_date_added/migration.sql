-- AlterTable
ALTER TABLE "rental_requests" ADD COLUMN     "endDate" TIMESTAMP(3);

-- Backfill existing rows: endDate = moveInDate + durationMonths months
UPDATE "rental_requests"
SET "endDate" = "moveInDate" + ("durationMonths" || ' months')::interval
WHERE "endDate" IS NULL;

-- CreateIndex
CREATE INDEX "rental_requests_status_endDate_idx" ON "rental_requests"("status", "endDate");
