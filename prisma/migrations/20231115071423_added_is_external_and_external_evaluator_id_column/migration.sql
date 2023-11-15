-- AlterTable
ALTER TABLE `evaluations` ADD COLUMN `is_external` BOOLEAN NULL AFTER `submitted_date`,
    ADD COLUMN `external_evaluator_id` INTEGER NULL AFTER `is_external`;
