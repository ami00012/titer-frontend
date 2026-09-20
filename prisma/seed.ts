/**
 * V1 ships with zero seed/demo inventory -- fake listings on a trust product are
 * fatal (AGENTS spec §1). This is intentionally a no-op kept only so
 * `prisma migrate reset`'s configured seed command (see prisma.config.ts) doesn't
 * fail looking for a script that doesn't exist.
 */
async function main() {
  console.log("No seed data for V1 — real listings only.");
}

main();
