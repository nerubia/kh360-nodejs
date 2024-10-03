-- AddForeignKey
ALTER TABLE `invoice_activities` ADD CONSTRAINT `invoice_activities_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
