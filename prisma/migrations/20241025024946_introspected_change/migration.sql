-- AlterTable
ALTER TABLE `payment_attachments` ADD COLUMN `created_at` DATETIME(0) NULL,
    ADD COLUMN `description` VARCHAR(255) NULL DEFAULT '',
    ADD COLUMN `filename` VARCHAR(255) NULL DEFAULT '',
    ADD COLUMN `mime_type` VARCHAR(50) NULL,
    ADD COLUMN `payment_id` INTEGER NULL,
    ADD COLUMN `sequence_no` INTEGER NULL,
    ADD COLUMN `updated_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `payment_details` ADD COLUMN `payment_id` INTEGER NULL;

-- AlterTable
ALTER TABLE `payment_emails` ADD COLUMN `created_at` DATETIME(0) NULL,
    ADD COLUMN `email_address` VARCHAR(255) NULL DEFAULT '',
    ADD COLUMN `email_type` VARCHAR(255) NULL DEFAULT '',
    ADD COLUMN `payment_id` INTEGER NULL,
    ADD COLUMN `sequence_no` INTEGER NULL,
    ADD COLUMN `updated_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `payments` ADD COLUMN `or_no` VARCHAR(255) NULL DEFAULT '',
    ADD COLUMN `payment_no` VARCHAR(255) NULL DEFAULT '';

-- CreateIndex
CREATE INDEX `index_payment_attachments_on_payment_id` ON `payment_attachments`(`payment_id`);

-- CreateIndex
CREATE INDEX `index_payment_emails_on_payment_id` ON `payment_emails`(`payment_id`);
