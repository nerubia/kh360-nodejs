-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_tax_type_id_fkey` FOREIGN KEY (`tax_type_id`) REFERENCES `tax_types`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
