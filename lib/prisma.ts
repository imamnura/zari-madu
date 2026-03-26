import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

const isNextProductionBuild =
  process.env.NEXT_PHASE === "phase-production-build";

export const prisma =
  global.prisma ??
  new PrismaClient({
    log: isNextProductionBuild
      ? []
      : process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") global.prisma = prisma;
