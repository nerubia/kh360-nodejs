-- CreateTable
CREATE TABLE `skill_map_administrations` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NULL DEFAULT '',
    `skill_map_schedule_start_date` DATE NULL,
    `skill_map_schedule_end_date` DATE NULL,
    `skill_map_period_start_date` DATE NULL,
    `skill_map_period_end_date` DATE NULL,
    `remarks` TEXT NULL,
    `email_subject` VARCHAR(255) NULL DEFAULT '',
    `email_content` TEXT NULL,
    `status` VARCHAR(20) NULL DEFAULT '',
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_map_results` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skill_map_administration_id` INTEGER NULL,
    `user_id` INTEGER NULL,
    `submitted_date` DATE NULL,
    `comments` TEXT NULL,
    `status` VARCHAR(20) NULL DEFAULT '',
    `created_by_id` INTEGER NULL,
    `updated_by_id` INTEGER NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `index_skill_map_results_on_skill_map_administration_id`(`skill_map_administration_id`),
    INDEX `index_skill_map_results_on_user_id`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `skill_map_ratings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `skill_map_administration_id` INTEGER NULL,
    `skill_map_result_id` INTEGER NULL,
    `skill_id` INTEGER NULL,
    `skill_category_id` INTEGER NULL,
    `answer_option_id` INTEGER NULL,
    `comments` TEXT NULL,
    `created_at` DATETIME(0) NULL,
    `updated_at` DATETIME(0) NULL,
    `deleted_at` DATETIME(0) NULL,

    INDEX `index_skill_map_ratings_on_answer_option_id`(`answer_option_id`),
    INDEX `index_skill_map_ratings_on_skill_map_administration_id`(`skill_map_administration_id`),
    INDEX `index_skill_map_ratings_on_skill_map_result_id`(`skill_map_result_id`),
    INDEX `index_skill_map_ratings_on_skill_id`(`skill_id`),
    INDEX `index_skill_map_ratings_on_skill_category_id`(`skill_category_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `skill_map_results` ADD CONSTRAINT `skill_map_results_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_map_results` ADD CONSTRAINT `skill_map_results_skill_map_administration_id_fkey` FOREIGN KEY (`skill_map_administration_id`) REFERENCES `skill_map_administrations`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_map_ratings` ADD CONSTRAINT `skill_map_ratings_skill_map_result_id_fkey` FOREIGN KEY (`skill_map_result_id`) REFERENCES `skill_map_results`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_map_ratings` ADD CONSTRAINT `skill_map_ratings_skill_id_fkey` FOREIGN KEY (`skill_id`) REFERENCES `skills`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `skill_map_ratings` ADD CONSTRAINT `skill_map_ratings_skill_category_id_fkey` FOREIGN KEY (`skill_category_id`) REFERENCES `skill_categories`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
