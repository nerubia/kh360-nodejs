-- AlterTable
ALTER TABLE `project_roles` ADD COLUMN `for_project` BOOLEAN NULL DEFAULT false AFTER `is_evaluee`;