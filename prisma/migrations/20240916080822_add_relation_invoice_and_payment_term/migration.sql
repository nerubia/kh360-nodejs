-- AddForeignKey
ALTER TABLE `invoices` ADD CONSTRAINT `invoices_payment_term_id_fkey` FOREIGN KEY (`payment_term_id`) REFERENCES `payment_terms`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
