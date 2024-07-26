-- CreateTable
CREATE TABLE `test_apis` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(255) NOT NULL,
    `endpoint` VARCHAR(255) NOT NULL,
    `env` VARCHAR(100) NOT NULL,
    `description` TEXT NOT NULL,
    `status` BOOLEAN NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` INTEGER NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `test_items` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `test_apis_id` INTEGER NULL,
    `http_method` ENUM('get', 'post', 'put', 'patch', 'delete') NOT NULL,
    `payload` TEXT NOT NULL,
    `response` TEXT NOT NULL,
    `description` TEXT NULL,
    `status` BOOLEAN NOT NULL,
    `created_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `created_by` INTEGER NOT NULL,
    `updated_at` TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP(0),
    `updated_by` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `test_items` ADD CONSTRAINT `test_items_test_apis_id_fkey` FOREIGN KEY (`test_apis_id`) REFERENCES `test_apis`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
