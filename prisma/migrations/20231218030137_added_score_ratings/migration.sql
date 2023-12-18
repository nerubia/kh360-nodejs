-- CreateTable
CREATE TABLE `score_ratings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL,
    `display_name` VARCHAR(100) NULL,
    `min_score` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `max_score` DECIMAL(8, 2) NULL DEFAULT 0.00,
    `description` TEXT NULL,
    `status` BOOLEAN NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
