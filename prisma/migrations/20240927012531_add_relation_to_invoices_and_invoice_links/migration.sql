-- AddForeignKey
ALTER TABLE `invoice_links` ADD CONSTRAINT `invoice_links_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
