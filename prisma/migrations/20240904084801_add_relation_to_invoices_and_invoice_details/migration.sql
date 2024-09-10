-- AddForeignKey
ALTER TABLE `invoice_details` ADD CONSTRAINT `invoice_details_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
