-- AlterTable
ALTER TABLE `survey_template_categories` ADD COLUMN `status` BOOLEAN NULL AFTER `description`;
ALTER TABLE `survey_template_categories` DROP COLUMN `category_type`;
ALTER TABLE `survey_template_categories` ADD COLUMN `category_type` VARCHAR(255) NULL AFTER `sequence_no`;