-- AddForeignKey
ALTER TABLE `payment_accounts` ADD CONSTRAINT `payment_accounts_country_id_fkey` FOREIGN KEY (`country_id`) REFERENCES `countries`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
