-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_account_id_fkey` FOREIGN KEY (`payment_account_id`) REFERENCES `payment_accounts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
