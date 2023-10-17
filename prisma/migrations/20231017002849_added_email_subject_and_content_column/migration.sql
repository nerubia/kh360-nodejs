-- AlterTable
ALTER TABLE `evaluation_administrations` ADD COLUMN `email_content` TEXT NULL,
    ADD COLUMN `email_subject` VARCHAR(255) NULL DEFAULT '';
