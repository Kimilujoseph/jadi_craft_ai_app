/*
  Warnings:

  - You are about to drop the column `errorMessage` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Message` DROP COLUMN `errorMessage`;

-- AlterTable
ALTER TABLE `USERS` ADD COLUMN `plan` ENUM('FREE', 'PAID') NOT NULL DEFAULT 'FREE';

-- CreateTable
CREATE TABLE `FailureLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `messageId` BIGINT NOT NULL,
    `failureType` ENUM('PROMPT_ORCHESTRATION', 'CATEGORIZER', 'LLM_PRIMARY', 'LLM_FALLBACK', 'TTS_SERVICE') NOT NULL,
    `errorCode` VARCHAR(191) NULL,
    `errorMessage` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `FailureLog_messageId_idx`(`messageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `UsageTracker` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `userId` BIGINT NOT NULL,
    `usageType` ENUM('AUDIO_GENERATION', 'CHAT_MESSAGES') NOT NULL,
    `count` INTEGER NOT NULL DEFAULT 0,
    `cycleStartDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `UsageTracker_userId_usageType_key`(`userId`, `usageType`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `FailureLog` ADD CONSTRAINT `FailureLog_messageId_fkey` FOREIGN KEY (`messageId`) REFERENCES `Message`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UsageTracker` ADD CONSTRAINT `UsageTracker_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `USERS`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;
