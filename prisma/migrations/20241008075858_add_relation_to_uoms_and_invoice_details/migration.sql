-- AddForeignKey
ALTER TABLE `invoice_details` ADD CONSTRAINT `invoice_details_uom_id_fkey` FOREIGN KEY (`uom_id`) REFERENCES `uoms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
