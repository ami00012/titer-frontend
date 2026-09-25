/**
 * Titer is a micro-marketplace: no listing may price above this, full stop.
 * Single source of truth, enforced in three independent places: the zod
 * schema (src/lib/validation/asset.ts), createAsset() (src/app/actions/
 * assets.ts), and a DB CHECK constraint (prisma/migrations/
 * 20260925000000_asset_price_cap) -- so no write path, crafted request, or
 * future feature (like the AI listing assistant) can bypass it.
 */
export const ASSET_PRICE_CAP = 1000;
