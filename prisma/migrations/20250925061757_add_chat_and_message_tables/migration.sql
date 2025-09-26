/*
  Warnings:

  - A unique constraint covering the columns `[idempotencyKey]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Message` ADD COLUMN `errorMessage` TEXT NULL,
    ADD COLUMN `fallbackUsed` BOOLEAN NULL DEFAULT false,
    ADD COLUMN `idempotencyKey` VARCHAR(191) NULL,
    ADD COLUMN `refinedPrompt` TEXT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Message_idempotencyKey_key` ON `Message`(`idempotencyKey`);
