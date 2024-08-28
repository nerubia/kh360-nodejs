-- AddForeignKey
ALTER TABLE `invoice_details` ADD CONSTRAINT `invoice_details_offering_id_fkey` FOREIGN KEY (`offering_id`) REFERENCES `offerings`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
