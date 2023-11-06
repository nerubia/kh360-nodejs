-- AlterTable
ALTER TABLE `evaluations` ADD COLUMN `for_evaluation` BOOLEAN NULL DEFAULT false AFTER `project_member_id`;
