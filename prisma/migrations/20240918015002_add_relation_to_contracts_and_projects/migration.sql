-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
