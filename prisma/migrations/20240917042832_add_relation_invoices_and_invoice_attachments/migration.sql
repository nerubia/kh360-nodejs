-- AddForeignKey
ALTER TABLE `invoice_attachments` ADD CONSTRAINT `invoice_attachments_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
