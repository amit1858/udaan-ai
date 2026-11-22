import { prisma, seedSales } from "./db";
import { logger } from "../lib/logger";
await seedSales();
logger.info({ salesDays: await prisma.sale.count() }, "Synthetic restaurant seed ready");
await prisma.$disconnect();
