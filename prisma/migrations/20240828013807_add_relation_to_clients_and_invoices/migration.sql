-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

