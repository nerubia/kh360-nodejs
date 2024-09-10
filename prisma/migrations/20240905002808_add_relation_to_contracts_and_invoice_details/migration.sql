-- AddForeignKey
ALTER TABLE `invoice_details` ADD CONSTRAINT `invoice_details_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
