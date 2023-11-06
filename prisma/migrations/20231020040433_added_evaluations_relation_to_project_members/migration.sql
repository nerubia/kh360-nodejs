-- AlterTable
ALTER TABLE `evaluations` ADD COLUMN `project_member_id` INTEGER NULL AFTER `project_id`;

-- AddForeignKey
ALTER TABLE `evaluations` ADD CONSTRAINT `evaluations_project_member_id_fkey` FOREIGN KEY (`project_member_id`) REFERENCES `project_members`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
