-- Drop the old blanket unique constraint. It forbade more than one row per
-- (tenantId, propertyId, status) for EVERY status, which blocked repeat
-- rentals (second COMPLETED collided) and repeat rejections (second REJECTED
-- collided).
DROP INDEX "rental_requests_tenantId_propertyId_status_key";

-- Safety check: a tenant could previously hold e.g. a PENDING and an APPROVED
-- row for the same property (different statuses were allowed). Those collapse
-- into "open" under the new rule and would make the CREATE UNIQUE INDEX below
-- fail. Detect any offenders before deploying:
--
--   SELECT "tenantId", "propertyId", COUNT(*)
--   FROM "rental_requests"
--   WHERE "status" IN ('PENDING','APPROVED','ACTIVE')
--   GROUP BY "tenantId","propertyId"
--   HAVING COUNT(*) > 1;
--
-- Resolve (reject/cancel the stale rows) before running this migration.

-- Enforce at most ONE open request (PENDING/APPROVED/ACTIVE) per
-- tenant+property. Terminal states (REJECTED/COMPLETED) are unrestricted.
CREATE UNIQUE INDEX "rental_requests_tenant_property_open_key"
ON "rental_requests" ("tenantId", "propertyId")
WHERE "status" IN ('PENDING', 'APPROVED', 'ACTIVE');
