-- AddForeignKey
ALTER TABLE `invoice_details` ADD CONSTRAINT `invoice_details_project_id_fkey` FOREIGN KEY (`project_id`) REFERENCES `projects`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
