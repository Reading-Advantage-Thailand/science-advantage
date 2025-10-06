import { PrismaClient } from "@prisma/client";
import { config } from "./env";

type GlobalWithPrisma = typeof globalThis & {
  prisma?: PrismaClient;
};

const globalForPrisma = globalThis as GlobalWithPrisma;

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: config.app.isDev ? ["query", "error", "warn"] : ["error"],
  });

if (!config.app.isProd) {
  globalForPrisma.prisma = prisma;
}

export default prisma;
