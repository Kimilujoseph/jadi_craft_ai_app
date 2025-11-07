-- CreateTable
CREATE TABLE `MarketplaceImpression` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `listingId` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `userQuery` VARCHAR(191) NOT NULL,
    `impressedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MarketplaceImpression_listingId_idx`(`listingId`),
    INDEX `MarketplaceImpression_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MarketplaceClick` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `listingId` VARCHAR(191) NOT NULL,
    `userId` BIGINT NULL,
    `clickedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `MarketplaceClick_listingId_idx`(`listingId`),
    INDEX `MarketplaceClick_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `MarketplaceImpression` ADD CONSTRAINT `MarketplaceImpression_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `MarketplaceListing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketplaceImpression` ADD CONSTRAINT `MarketplaceImpression_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketplaceClick` ADD CONSTRAINT `MarketplaceClick_listingId_fkey` FOREIGN KEY (`listingId`) REFERENCES `MarketplaceListing`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MarketplaceClick` ADD CONSTRAINT `MarketplaceClick_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`user_id`) ON DELETE SET NULL ON UPDATE CASCADE;
