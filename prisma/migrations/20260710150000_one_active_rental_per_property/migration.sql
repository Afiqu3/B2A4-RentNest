-- Bug #3 (double-booking) safety net: at most ONE active rental per property.
-- Partial unique index — Prisma cannot represent it in the schema, so it lives
-- here. Even under concurrent payment webhooks, the second transaction to try
-- to set a rental ACTIVE for an already-active property fails on this index
-- instead of silently double-booking.
CREATE UNIQUE INDEX "rental_requests_property_active_key"
ON "rental_requests" ("propertyId")
WHERE "status" = 'ACTIVE';
