-- AlterTable
ALTER TABLE `project_member_skills` ADD COLUMN `sequence_no` INTEGER NULL AFTER `project_member_id`;

-- AlterTable
ALTER TABLE `project_skills` ADD COLUMN `sequence_no` INTEGER NULL AFTER `project_id`;
