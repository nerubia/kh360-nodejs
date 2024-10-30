-- AddForeignKey
ALTER TABLE `payment_accounts` ADD CONSTRAINT `payment_accounts_payment_network_id_fkey` FOREIGN KEY (`payment_network_id`) REFERENCES `payment_networks`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
