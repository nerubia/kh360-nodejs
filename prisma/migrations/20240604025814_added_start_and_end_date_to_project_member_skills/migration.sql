-- AlterTable
ALTER TABLE `project_member_skills` ADD COLUMN `start_date` DATE NULL AFTER `status`,
    ADD COLUMN `end_date` DATE NULL AFTER `start_date`;
