import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Creating Transaction table directly in MySQL...");
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS \`Transaction\` (
        \`id\` VARCHAR(191) NOT NULL,
        \`userId\` BIGINT NOT NULL,
        \`amount\` DOUBLE NOT NULL,
        \`status\` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
        \`type\` ENUM('EVENT_CREATION', 'LISTING_CREATION') NOT NULL,
        \`reference\` VARCHAR(191) NULL,
        \`checkoutRequestID\` VARCHAR(191) NULL,
        \`createdAt\` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
        \`updatedAt\` DATETIME(3) NOT NULL,
        UNIQUE INDEX \`Transaction_reference_key\`(\`reference\`),
        UNIQUE INDEX \`Transaction_checkoutRequestID_key\`(\`checkoutRequestID\`),
        INDEX \`Transaction_userId_idx\`(\`userId\`),
        PRIMARY KEY (\`id\`)
      ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
    `);
    console.log("Table Transaction created successfully.");
  } catch (error) {
    console.error("Error creating table:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
