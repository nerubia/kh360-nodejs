-- AddForeignKey
ALTER TABLE `offerings` ADD CONSTRAINT `offerings_client_id_fkey` FOREIGN KEY (`client_id`) REFERENCES `clients`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `offerings` ADD CONSTRAINT `offerings_offering_category_id_fkey` FOREIGN KEY (`offering_category_id`) REFERENCES `offering_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
