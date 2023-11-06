-- AlterTable
ALTER TABLE `evaluation_administrations` ADD COLUMN `email_subject` TEXT NULL AFTER `remarks`,
    ADD COLUMN `email_content` VARCHAR(255) NULL DEFAULT '' AFTER `email_subject`;
