-- CreateTable
CREATE TABLE `email_logs` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email_type` VARCHAR(100) NULL DEFAULT '',
    `user_id` INTEGER NULL,
    `email_address` VARCHAR(191) NOT NULL,
    `sent_at` DATETIME(0) NOT NULL,
    `subject` VARCHAR(255) NULL DEFAULT '',
    `content` TEXT NULL,
    `notes` VARCHAR(255) NULL DEFAULT '',
    `mail_id` VARCHAR(191) NOT NULL,
    `email_status` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    INDEX `index_email_logs_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
