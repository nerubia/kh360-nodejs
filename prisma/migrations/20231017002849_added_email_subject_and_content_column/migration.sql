-- AlterTable
ALTER TABLE `evaluation_administrations` ADD COLUMN `email_subject` TEXT NULL AFTER `remarks`,
    ADD COLUMN `email_content` TEXT NULL AFTER `email_subject`;
