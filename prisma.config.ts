import { defineConfig } from "prisma/config";

// CLI-only config (migrate/introspect/studio) -- needs a direct, non-pooled
// connection since migrations can't run through pgbouncer. The app's
// runtime connection (pooled, via a driver adapter) is configured
// separately in src/lib/db.ts. See DATABASE.md.
//
// Read via plain process.env (not the config module's `env()` helper,
// which throws immediately if unset) so `prisma generate` keeps working
// before DIRECT_URL is configured -- only `migrate`/`studio` need it set.
export default defineConfig({
  datasource: {
    url: process.env.DIRECT_URL,
  },
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
});
