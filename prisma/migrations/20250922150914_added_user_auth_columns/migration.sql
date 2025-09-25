/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `USERS` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `email` to the `USERS` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `USERS` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `USERS` ADD COLUMN `email` VARCHAR(191) NOT NULL,
    ADD COLUMN `name` VARCHAR(191) NULL,
    ADD COLUMN `password` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `USERS_email_key` ON `USERS`(`email`);
