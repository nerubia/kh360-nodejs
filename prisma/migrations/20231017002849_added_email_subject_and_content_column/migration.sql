-- AlterTable
ALTER TABLE `evaluation_administrations` ADD COLUMN `email_subject` VARCHAR(255) NULL DEFAULT '' AFTER `remarks`,
    ADD COLUMN `email_content` TEXT NULL AFTER `email_subject`;
