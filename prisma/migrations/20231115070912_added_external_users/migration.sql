-- CreateTable
CREATE TABLE `external_users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL DEFAULT '',
    `first_name` VARCHAR(100) NOT NULL,
    `middle_name` VARCHAR(75) NULL,
    `last_name` VARCHAR(75) NOT NULL,
    `role` VARCHAR(255) NULL,
    `company` VARCHAR(255) NULL,
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    UNIQUE INDEX `index_external_users_on_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
