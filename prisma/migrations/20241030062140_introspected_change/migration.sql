/*
  Warnings:

  - You are about to drop the column `payment_network` on the `payment_accounts` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `payment_accounts` DROP COLUMN `payment_network`,
    ADD COLUMN `payment_network_id` INTEGER NULL;

-- CreateTable
CREATE TABLE `payment_networks` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `description` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
