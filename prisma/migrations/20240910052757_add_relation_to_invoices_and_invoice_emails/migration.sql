-- AddForeignKey
ALTER TABLE `invoice_emails` ADD CONSTRAINT `invoice_emails_invoice_id_fkey` FOREIGN KEY (`invoice_id`) REFERENCES `invoices`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
