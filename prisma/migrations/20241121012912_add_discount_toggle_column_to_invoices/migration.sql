-- AlterTable
ALTER TABLE `invoices` ADD COLUMN `discount_toggle` BOOLEAN NULL AFTER `discount_amount`;
