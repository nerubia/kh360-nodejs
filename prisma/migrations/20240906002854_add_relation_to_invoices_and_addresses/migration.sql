-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_billing_address_id_fkey` FOREIGN KEY (`billing_address_id`) REFERENCES `addresses`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
