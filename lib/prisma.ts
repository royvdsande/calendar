import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

let prismaClient: PrismaClient | null = null;

try {
  prismaClient =
    global.prisma ||
    new PrismaClient({
      log: ["error", "warn"]
    });
} catch (error) {
  console.error("Prisma client failed to initialize", error);
}

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production" && prisma) global.prisma = prisma;
