import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

const connectionString = process.env.DATABASE_URL!;

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        adapter: new PrismaMariaDb(connectionString),
    });

if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = prisma;
}