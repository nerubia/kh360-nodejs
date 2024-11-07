-- AddForeignKey
ALTER TABLE `invoice_activities` ADD CONSTRAINT `invoice_activities_reference_id_fkey` FOREIGN KEY (`reference_id`) REFERENCES `payments`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
