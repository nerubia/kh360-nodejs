/*
  Warnings:

  - Added the required column `user_type` to the `external_users` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `external_users` ADD COLUMN `user_type` VARCHAR(75) NOT NULL AFTER `last_name`;

-- AlterTable
ALTER TABLE `survey_results` 
ADD COLUMN `is_external` BOOLEAN NULL AFTER `status`,
ADD COLUMN `external_respondent_id` INTEGER NULL AFTER `is_external`;

