import { defineConfig } from "@playwright/test";

// NOTE: these gate-flow tests run against the REAL dev backend (Spring Boot
// with `dev` profile active, DevAuthFilter logging every browser request in
// as the fixed DevUser) and the REAL dev Postgres -- no mocking. Tests
// mutate shared DevUser workspace state (invites, plan, memberships), so
// they must run serially, not in parallel, or they'll race each other.
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "retain-on-failure",
  },
  webServer: {
    command: "npm run dev",
    url: "http://localhost:3000",
    reuseExistingServer: true,
    timeout: 60_000,
  },
});
