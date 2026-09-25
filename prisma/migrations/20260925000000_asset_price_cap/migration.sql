-- Titer is now a $1,000-max micro-marketplace: a hard product rule, not
-- just application-layer validation (createAsset() in
-- src/app/actions/assets.ts, and the zod schema in
-- src/lib/validation/asset.ts, both already enforce this -- this is the
-- third, DB-level layer so no future write path can bypass it).
--
-- Added NOT VALID deliberately: this does NOT validate existing rows, so it
-- cannot fail or block deploy if any currently-published listing is priced
-- above $1,000 (the pre-pivot broker model had no cap). Existing over-cap
-- rows are a separate, explicit admin/product decision -- archive, re-price,
-- or otherwise -- not something a migration should silently resolve.
-- Run `ALTER TABLE "Asset" VALIDATE CONSTRAINT "asset_price_cap";` once
-- that cleanup is done, to get full enforcement on old rows too.
ALTER TABLE "Asset"
  ADD CONSTRAINT "asset_price_cap" CHECK (price IS NULL OR price <= 1000) NOT VALID;
