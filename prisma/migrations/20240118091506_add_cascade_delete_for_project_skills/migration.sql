-- DropForeignKey
ALTER TABLE `project_skills` DROP FOREIGN KEY `project_skills_project_id_fkey`;

-- AddForeignKey
ALTER TABLE `project_skills` ADD CONSTRAINT `project_skills_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
