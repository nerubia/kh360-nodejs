-- AlterTable
ALTER TABLE `evaluation_ratings` ADD COLUMN `deleted_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `evaluation_result_details` ADD COLUMN `deleted_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `evaluation_results` ADD COLUMN `deleted_at` DATETIME(0) NULL;

-- AlterTable
ALTER TABLE `evaluations` ADD COLUMN `deleted_at` DATETIME(0) NULL;
