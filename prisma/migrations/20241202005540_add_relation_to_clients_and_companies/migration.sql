-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_company_id_fkey` FOREIGN KEY (`company_id`) REFERENCES `companies`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
