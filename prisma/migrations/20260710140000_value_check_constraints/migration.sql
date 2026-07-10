-- Defense-in-depth value check at the DB level (Prisma cannot express CHECK
-- constraints in the schema, so it lives here).
-- Note: the reviews.rating check is already applied in the DB, so it is
-- intentionally omitted here.

-- A rental must last at least one whole month.
ALTER TABLE "rental_requests"
ADD CONSTRAINT "rental_requests_durationMonths_check"
CHECK ("durationMonths" >= 1);
