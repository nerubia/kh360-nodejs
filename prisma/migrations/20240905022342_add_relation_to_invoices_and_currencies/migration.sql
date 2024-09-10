-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_currency_id_fkey` FOREIGN KEY (`currency_id`) REFERENCES `currencies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
