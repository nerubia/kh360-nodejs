-- AlterTable
ALTER TABLE `test_batches` ADD COLUMN `test_apis_id` INTEGER NULL AFTER `id`;

-- AddForeignKey
ALTER TABLE `test_batches` ADD CONSTRAINT `test_batches_test_apis_id_fkey` FOREIGN KEY (`test_apis_id`) REFERENCES `test_apis`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
