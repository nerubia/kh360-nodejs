-- AlterTable
ALTER TABLE `invoice_attachments` ADD COLUMN `mime_type` VARCHAR(50) NULL AFTER `filename`;
