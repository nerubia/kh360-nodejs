-- DropForeignKey
ALTER TABLE `test_batch_items` DROP FOREIGN KEY `test_batch_items_test_batches_id_fkey`;

-- DropForeignKey
ALTER TABLE `test_batch_items` DROP FOREIGN KEY `test_batch_items_test_items_id_fkey`;

-- DropForeignKey
ALTER TABLE `test_items` DROP FOREIGN KEY `test_items_test_apis_id_fkey`;

-- AddForeignKey
ALTER TABLE `test_items` ADD CONSTRAINT `test_items_test_apis_id_fkey` FOREIGN KEY (`test_apis_id`) REFERENCES `test_apis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_batch_items` ADD CONSTRAINT `test_batch_items_test_batches_id_fkey` FOREIGN KEY (`test_batches_id`) REFERENCES `test_batches`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_batch_items` ADD CONSTRAINT `test_batch_items_test_items_id_fkey` FOREIGN KEY (`test_items_id`) REFERENCES `test_items`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
