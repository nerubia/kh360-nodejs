-- AddForeignKey
ALTER TABLE `clients` ADD CONSTRAINT `clients_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
