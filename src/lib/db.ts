import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Prisma 7 no longer reads the connection string from schema.prisma --
// the runtime client takes an explicit driver adapter. This uses the
// pooled DATABASE_URL; prisma.config.ts uses the direct DIRECT_URL
// separately for the CLI (migrate/studio). See DATABASE.md.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
