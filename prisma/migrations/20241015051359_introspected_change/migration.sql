/*
  Warnings:

  - You are about to alter the column `quantity` on the `invoice_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(12,2)`.
  - You are about to alter the column `rate` on the `invoice_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(12,2)`.
  - You are about to alter the column `sub_total` on the `invoice_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(12,2)`.
  - You are about to alter the column `tax` on the `invoice_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(12,2)`.
  - You are about to alter the column `total` on the `invoice_details` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(12,2)`.
  - You are about to alter the column `price` on the `offerings` table. The data in that column could be lost. The data in that column will be cast from `Decimal(8,2)` to `Decimal(12,2)`.

*/
-- AlterTable
ALTER TABLE `invoice_details` MODIFY `quantity` DECIMAL(12, 2) NULL DEFAULT 0.00,
    MODIFY `rate` DECIMAL(12, 2) NULL DEFAULT 0.00,
    MODIFY `sub_total` DECIMAL(12, 2) NULL DEFAULT 0.00,
    MODIFY `tax` DECIMAL(12, 2) NULL DEFAULT 0.00,
    MODIFY `total` DECIMAL(12, 2) NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `offerings` MODIFY `price` DECIMAL(12, 2) NULL DEFAULT 0.00;

-- CreateTable
CREATE TABLE `payment_attachments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_details` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `invoice_id` INTEGER NULL,
    `payment_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_payment_details_on_invoice_id`(`invoice_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payment_emails` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `payments` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `client_id` INTEGER NULL,
    `company_id` INTEGER NULL,
    `currency_id` INTEGER NULL,
    `payment_date` DATE NULL,
    `payment_reference_no` VARCHAR(255) NULL DEFAULT '',
    `payment_account_id` INTEGER NULL,
    `payment_amount` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `payment_amount_php` DECIMAL(12, 2) NULL DEFAULT 0.00,
    `payment_status` VARCHAR(20) NULL DEFAULT '',
    `remarks` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_payments_on_client_id`(`client_id`),
    INDEX `index_payments_on_company_id`(`company_id`),
    INDEX `index_payments_on_currency_id`(`currency_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
