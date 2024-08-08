-- CreateTable
CREATE TABLE `test_batches` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `description` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` INTEGER NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_batch_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `test_items_id` INTEGER NULL,
    `test_batches_id` INTEGER NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `test_batch_items` ADD CONSTRAINT `test_batch_items_test_items_id_fkey` FOREIGN KEY (`test_items_id`) REFERENCES `test_items`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `test_batch_items` ADD CONSTRAINT `test_batch_items_test_batches_id_fkey` FOREIGN KEY (`test_batches_id`) REFERENCES `test_batches`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
