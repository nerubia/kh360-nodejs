-- AddForeignKey
ALTER TABLE `contract_billings` ADD CONSTRAINT `contract_billings_contract_id_fkey` FOREIGN KEY (`contract_id`) REFERENCES `contracts`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
